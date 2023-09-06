import { initializeApp } from 'firebase/app';
import {
	getAuth,
	signInWithPopup,
	TwitterAuthProvider,
	signOut,
	signInWithEmailAndPassword,
	RecaptchaVerifier,
	signInWithPhoneNumber,
	GoogleAuthProvider,
	GithubAuthProvider,
	signInWithCustomToken,
	type ApplicationVerifier,
	type AuthProvider,
	type User as FirebaseUser,
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, type Messaging } from 'firebase/messaging';

import { derived } from 'svelte/store';
import axios from 'axios';
import { ethers } from 'ethers';
import * as nacl from 'tweetnacl';
import { connectedAccount, getProvider, web3Provider } from '$stores/web3';
import { browser } from '$app/environment';
import { defaultUser, getUserDataInFirebase, saveUserFirebase, type User } from './users/user';
import Store from './Store';

const FIREBASE_CONFIG = {
	apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY),
	authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
	projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID),
	storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
	appId: String(import.meta.env.VITE_FIREBASE_APP_ID),
	messagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
	measurementId: String(import.meta.env.VITE_FIREBASE_MEASURMENT_ID),
	databaseURL: String(import.meta.env.VITE_FIREBASE_DATABASE_URL),
};
const firebaseApp = initializeApp(FIREBASE_CONFIG);

const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

const user: Store<User> = new Store<User>(null);

export const changeUserData = async (uid: string) => {
	if (!uid) {
		return user.set(defaultUser);
	}
	const userDataFirebase = await getUserDataInFirebase(uid);
	if (!userDataFirebase) {
		const saved = await saveUserFirebase(uid, defaultUser);
		if (saved) user.set({ ...defaultUser, uid });
	}
	user.update((_user) => ({
		..._user,
		...userDataFirebase,
		// collections: Object.values(userDataFirebase.collections),
		uid,
	}));
};

const userdata = derived<Store<User>, User>(user, ($user) => $user);

export type AuthMethod =
	| 'phone_auth'
	| 'google_auth'
	| 'email_password'
	| 'facebook_auth'
	| 'github_auth'
	| 'twitter_auth';

interface AuthOptions {
	email?: string;
	password?: string;
	phone?: string;
	captchaContainer?: string | HTMLElement;
}

async function popupLogin(authMethod: AuthMethod, options?: AuthOptions) {
	let provider: AuthProvider;
	switch (authMethod) {
		case 'phone_auth': {
			globalThis.recaptchaVerifier = new RecaptchaVerifier(
				options.captchaContainer,
				{ size: 'invisible' },
				auth,
			);
			const confirmationResult = await signInWithPhoneNumber(
				auth,
				options.phone,
				globalThis.recaptchaVerifier as ApplicationVerifier,
			);
			return confirmationResult;
		}
		case 'email_password': {
			const response = await signInWithEmailAndPassword(auth, options.email, options.password);
			console.log(response);
			return response;
		}
		case 'twitter_auth':
			provider = new TwitterAuthProvider();
			break;
		case 'google_auth':
			provider = new GoogleAuthProvider();
			break;
		case 'github_auth':
			provider = new GithubAuthProvider();
			break;
		default:
			throw new Error('Authentication method is not supported.');
	}
	return signInWithPopup(auth, provider);
}

async function twitterLogout() {
	await signOut(auth);
}

// async function saveVerefictaionData(userData: any) {
// 	const snapshot = await get(child(ref(database), `users/${userData.uid}`));
// 	if (snapshot.exists()) {
// 		const snapshotData = snapshot.val();
// 		if (snapshotData.verificationTweetId && snapshotData.verification) {
// 			return Promise.reject('Already exists verification');
// 		}
// 		set(ref(database, `users/${userData?.uid}`), {
// 			wallet: userData.wallet,
// 			verificationTweetId: userData.verificationTweetId,
// 			verification: true,
// 		});
// 		user.set({ ...userData, verification: true });
// 	}
// }

// async function saveRecoveryInfo(userData: any) {
// 	set(ref(database, `users/${userData?.uid}`), {
// 		recovery: true,
// 	});
// 	user.set({ ...userData, recovery: true });
// }

/*
	TODO: Require user signing with wallet for firebase settings add user modal to explain the purpose of connecting wallet. 
*/
async function authWithWallet(_connectedAccount: string): Promise<any> {
	const rand = () => Math.random().toString(36).substring(2);
	const generateToken = () => rand() + rand() + rand() + rand();
	const provider = getProvider();
	const token = generateToken();
	const message = { account: _connectedAccount, token };
	const signature = await provider.getSigner().signMessage(JSON.stringify(message));
	const response = await fetch('https://us-central1-identity-concierge.cloudfunctions.net/auth', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ message, signature }),
	});
	const json: { token: string } = (await response.json()) as { token: string };
	const credential = await signInWithCustomToken(auth, json.token);
	return credential;
}

const httpHeaders = {
	apikey: String(import.meta.env.VITE_API_KEY),
};

export function getCloudMessaging(): Messaging {
	return browser ? getMessaging(firebaseApp) : undefined;
}

async function connectTwitter() {
	await popupLogin('twitter_auth');
	const firebaseUser = auth.currentUser as FirebaseUser & {
		reloadUserInfo: { providerUserInfo: { screenName: string }[] };
	};
	if (auth.currentUser.providerData?.[0]?.providerId !== 'twitter.com') {
		throw Error('unknown error');
	}

	const idToken = await firebaseUser.getIdToken();

	const providerInfo: { screenName: string } = firebaseUser.reloadUserInfo.providerUserInfo[0];
	const username = providerInfo.screenName;
	if (!username) throw Error('Could not extract username from user object');

	const provider = web3Provider.get();
	const signer = provider.getSigner();
	const message = `Connect twitter @${username.toLowerCase()}`;
	const signature = await signer.signMessage(message);

	const { data } = await axios.post<{ signature: string }>(
		`${String(import.meta.env.VITE_FIREBASE_FUNCTIONS_URL)}/app/auth/twitter/validate`,
		{
			signature,
		},
		{
			headers: {
				Authorization: `Bearer ${idToken}`,
				apikey: String(import.meta.env.VITE_API_KEY),
			},
		},
	);

	return {
		username: username,
		signature: data.signature,
		user: firebaseUser,
	};
}

function checkTwitterVerified(handle: string, signatures: string) {
	try {
		if (handle && signatures) {
			const [signature, signatureBackend] = signatures.split(':');
			const signer = ethers.utils.verifyMessage(
				`Connect twitter @${handle.toLowerCase()}`,
				`0x${signature}`,
			);
			if (!import.meta.env.VITE_SIGNER_PUBLIC_KEY) {
				console.error(`Must set VITE_SIGNER_PUBLIC_KEY environment variable`);
				return;
			}
			const hashedSignature = Buffer.from(nacl.hash(Buffer.from(signature, 'hex'))).toString('hex');
			if (ethers.utils.getAddress(signer) === ethers.utils.getAddress(connectedAccount.get())) {
				const result = nacl.sign.open(
					Buffer.from(signatureBackend, 'hex'),
					Buffer.from(import.meta.env.VITE_SIGNER_PUBLIC_KEY as string, 'hex'),
				);
				const wordHex = Buffer.from(result).toString('hex');
				if (hashedSignature.startsWith(wordHex)) {
					return handle;
				}
			}
		}
	} catch (error) {
		console.error((<Error>error).message);
	}
}
async function checkUserTwitterVerified(accountAddress: string) {
	try {
		const userData = await getUserDataInFirebase(accountAddress);
		if (userData.twitter && userData.twitterSignature) {
			return checkTwitterVerified(userData.twitter, userData.twitterSignature);
		}
	} catch (error) {
		console.error((<Error>error).message);
	}
}

export {
	database,
	storage,
	auth,
	popupLogin,
	twitterLogout,
	userdata,
	user,
	authWithWallet,
	httpHeaders,
	firestore,
	connectTwitter,
	checkTwitterVerified,
	checkUserTwitterVerified,
};
