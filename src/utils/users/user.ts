/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	child,
	DataSnapshot,
	get,
	query,
	onValue,
	push,
	ref,
	remove,
	set,
	update,
	equalTo,
	orderByChild,
	type Unsubscribe,
} from 'firebase/database';
import { constants } from 'ethers';
import { spaceCadets } from '$constants/config';
import { database, user } from '$utils/firebase';
import { deepCopy } from '$utils/object';
import { convertFirebaseArray } from '$utils/firebaseUtils';
import { defaults } from '$lib/components/constants';
import { connectedAccount, readNetwork } from '$stores/web3';
import {
	isAdvancedCollection,
	isCollectionDeployed,
	isSimpleCollection,
} from '$utils/collectionHelpers';
import { isRevenueSplit, type RevenueSplit } from '$models/user/revenue-splits';
import {
	deleteRevenueSplitById,
	getRevenueSplitsByAccount,
	tryMigrateRevenueSplits,
} from './revenueSplitsHelpers';
import type { Collection } from '$models/minter/collection-config';
import type { NftType } from '$models/minter/nft-config';
import type { TokenStandard } from '$models/minter/token-standard';
import type Store from '$utils/Store';

export const defaultUser: User = {
	uid: '',
	name: constants.AddressZero,
	displayName: constants.AddressZero,
	description: defaults.user.description,
	avatar: '',
	banner: '',
	links: [],
	collections: [],
	revenueSplits: [],
	legalContent: defaults.legal.nftTerms,
	hashtags: defaults.user.hashtags,
};

export interface User {
	uid: string;
	name: string;
	displayName: string;
	description: string;
	avatar: string;
	banner: string;
	links: string[];
	externalLink?: string;
	twitter?: string;
	twitterSignature?: string;
	discord?: string;
	github?: string;
	instagram?: string;
	collections: any[];
	created?: number;
	legalContent?: string;
	hashtags?: string;
	nftSettings?: {
		nftType: NftType;
		tokenStandard: TokenStandard;
	};
	revenueSplits?: RevenueSplit[];
	revenueFailed?: string;
	collectionAutoNavigate?: boolean;
}

function fixIfLegacyUser(_user: User) {
	// Meaning a user that has specific links and not a link array.
	let migratedUser: User;
	if (!Object.prototype.hasOwnProperty.call(_user, 'links')) {
		migratedUser = deepCopy(_user);

		let twitter = _user.twitter;
		if (twitter?.match(/^\w+$/)) {
			twitter = `https://twitter.com/${twitter}`;
		}

		// @ts-ignore
		migratedUser.links = [
			_user.externalLink,
			twitter,
			_user.discord,
			_user.github,
			_user.instagram,
		].filter((l) => l);
		return migratedUser;
	}
	return _user;
}

function sortByDeployedState(a: Collection, b: Collection) {
	const aDeployed = isCollectionDeployed(a);
	const bDeployed = isCollectionDeployed(b);
	// Sort the collections with contractAddress first
	if (aDeployed && !bDeployed) return -1;
	if (!aDeployed && bDeployed) return 1;
	return 0;
}

function subscribeCollections(callback: (collections: any[]) => void): Unsubscribe {
	const queryRef = query(
		ref(database, `collections`),
		orderByChild('network'),
		equalTo(`${readNetwork.get().alias}`),
	);

	return onValue(
		queryRef,
		(snap: DataSnapshot) => {
			const value = snap.val();
			const collections = [];
			for (const key in value) {
				if (Object.prototype.hasOwnProperty.call(value, key)) {
					collections.push({ ...value[key], firebaseId: key });
				}
			}
			callback(collections);
		},
		{
			onlyOnce: true,
		},
	);
}

function getCollectionByAccount(account: string, userStore: Store<User>): Unsubscribe {
	const queryRef = query(
		ref(database, `collections`),
		orderByChild('network'),
		equalTo(`${readNetwork.get().alias}`),
	);

	return onValue(
		queryRef,
		(snap: DataSnapshot) => {
			const value = snap.val();
			const collections = [];
			for (const key in value) {
				if (Object.prototype.hasOwnProperty.call(value, key)) {
					if (value[key].creator.toLowerCase() === account.toLowerCase()) {
						collections.push({ ...value[key], firebaseId: key });
					}
				}
			}
			userStore.update((_user) => {
				return {
					..._user,
					collections: collections.sort(sortByDeployedState),
				};
			});
		},
		{
			onlyOnce: true,
		},
	);
}

async function getUserDataInFirebase(account: string) {
	const snapshotUser = await get(child(ref(database), `users/${account.toLowerCase()}`));
	if (!snapshotUser.exists()) return null;
	let jsonUser: User = snapshotUser.toJSON() as User;
	jsonUser = fixIfLegacyUser(jsonUser);
	jsonUser.links = Object.values(jsonUser.links);

	if (jsonUser.revenueSplits) {
		// TODO
		jsonUser.revenueSplits = convertFirebaseArray(jsonUser.revenueSplits);
		jsonUser.revenueSplits = await tryMigrateRevenueSplits(
			snapshotUser.ref,
			[...jsonUser.revenueSplits],
			account,
		);
	}

	getRevenueSplitsByAccount(account, user);
	getCollectionByAccount(account, user);

	return {
		...jsonUser,
		uid: account,
	};
}

async function saveUserFirebase(uid: string, u: User) {
	if (!uid) return null;
	try {
		const userRef = ref(database, `users/${uid.toLowerCase()}`);
		await update(userRef, {
			name: u.name,
			displayName: u.displayName,
			description: u.description,
			avatar: u.avatar,
			banner: u.banner,
			links: u.links,
			twitter: u.twitter,
			twitterSignature: u.twitterSignature,
			legalContent: u.legalContent || '',
			hashtags: u.hashtags || '',
			created: new Date().getTime(),
			nftSettings: u.nftSettings || {},
			collectionAutoNavigate: u.collectionAutoNavigate || false,
		});
		const userDataFirebase = await getUserDataInFirebase(uid);
		user.set({
			...userDataFirebase,
			// collections: Object.values(userDataFirebase.collections || {}),
		});
		return true;
	} catch (error) {
		console.error('[Save user firebase] :', error);
		throw error;
	}
}

async function updateUserFirebase(uid: string, updater: (user: User) => Promise<User> | User) {
	const updatedUser = await updater(await getUserDataInFirebase(uid));
	updatedUser.links = [];
	return saveUserFirebase(uid, updatedUser);
}

async function getCollectionById(id: string) {
	const snapshot = await get(query(ref(database, `collections`), orderByChild('id'), equalTo(id)));

	if (snapshot.exists()) {
		const value = snapshot.val();

		for (const key in value) {
			return { ...value[key], firebaseId: key } as Collection;
		}
	} else {
		return null;
	}
}

async function removeCollection(collection: Collection) {
	if (!collection) return;

	if (
		isRevenueSplit(collection.royalty?.creator_address) &&
		collection.royalty.creator_address.firebaseId
	) {
		await deleteRevenueSplitById(collection.royalty.creator_address.firebaseId);
	}

	if (
		isAdvancedCollection(collection) &&
		isRevenueSplit(collection.pricing?.payoutReceivers) &&
		collection.pricing.payoutReceivers.firebaseId
	) {
		await deleteRevenueSplitById(collection.pricing.payoutReceivers.firebaseId);
	} else if (
		isSimpleCollection(collection) &&
		isRevenueSplit(collection.payoutAddress) &&
		collection.payoutAddress.firebaseId
	) {
		await deleteRevenueSplitById(collection.payoutAddress.firebaseId);
	}

	const collectionRef = ref(database, `collections/${collection.firebaseId}`);
	await remove(collectionRef);
}

async function saveUserCollection(collection: Collection): Promise<boolean> {
	try {
		const collectionsRef = ref(database, 'collections');
		const newCollection = push(collectionsRef);
		await set(newCollection, collection);
		return true;
	} catch (error) {
		console.error('[Save user collection] :', error);
		throw error;
	}
}

async function updateCollection(collection: Collection): Promise<boolean> {
	try {
		const collectionsRef = ref(database, `collections/${collection.firebaseId}`);
		await update(collectionsRef, collection);
		return true;
	} catch (error) {
		console.error('[Save user collection] :', error);
		throw error;
	}
}

async function checkCollectionExists(id: string) {
	const snapshot = await get(query(ref(database, `collections`), orderByChild('id'), equalTo(id)));
	return snapshot.exists();
}

function isCurrentUserSpaceCadet() {
	const currentUser = connectedAccount.get();
	if (!currentUser) return false;
	return spaceCadets.includes(currentUser.toLowerCase());
}

export {
	saveUserFirebase,
	updateUserFirebase,
	saveUserCollection,
	getCollectionById,
	checkCollectionExists,
	removeCollection,
	updateCollection,
	getUserDataInFirebase,
	isCurrentUserSpaceCadet,
	subscribeCollections,
};
