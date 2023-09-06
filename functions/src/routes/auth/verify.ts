import { logger } from 'firebase-functions';
import { sign, hash } from 'tweetnacl';
import axios from 'axios';
import { ethers } from 'ethers';
import { firebaseApp } from '../../init';
import type { Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

export async function verifyTwitter(request: Request, response: Response) {
	const { idToken } = request.body as { idToken: string };
	let decodedToken: DecodedIdToken;
	try {
		decodedToken = await firebaseApp.auth().verifyIdToken(idToken);

		if (decodedToken.firebase.sign_in_provider === 'twitter.com') {
			const user = await firebaseApp.auth().getUser(decodedToken.uid);
			const provider = user.providerData.find((prov) => prov.providerId === 'twitter.com');
			if (provider) {
				const twitterUid = provider.uid;
				const message = `${Math.floor(Date.now() / 1000)}:${twitterUid}`;
				const encodedMessage = new TextEncoder().encode(message);

				const secretKey = Buffer.from(process.env.SIGNER_SECRET_KEY, 'hex');
				const pair = sign.keyPair.fromSeed(Uint8Array.from(secretKey).slice(0, 32));
				const signature = Buffer.from(sign(encodedMessage, pair.secretKey)).toString('hex');

				response.json({
					twitter: `https://twitter.com/intent/user?user_id=${twitterUid}`,
					twitterVerification: signature,
				});
				return;
			}
		}
	} catch (error) {
		logger.error((<Error>error).message);
	}
	response.status(403).json({
		error: 'Token verification failed',
	});
}

export function getAppPublicKey(request: Request, response: Response) {
	const secretKey = Buffer.from(process.env.SIGNER_SECRET_KEY, 'hex');
	const pair = sign.keyPair.fromSeed(Uint8Array.from(secretKey).slice(0, 32));

	const publicKey = pair.publicKey;

	response.json({
		publicKey: Buffer.from(publicKey).toString('hex'),
	});
}

export async function validateTwitterConnect(request: Request, response: Response) {
	let decodedToken: DecodedIdToken;
	try {
		const { signature } = request.body as {
			username: string;
			signature: string;
		};
		const bearerToken = request.headers.authorization?.replace(/^\s*Bearer[^\w]+/, '');

		decodedToken = await firebaseApp.auth().verifyIdToken(bearerToken, true);

		if (decodedToken.firebase.sign_in_provider === 'twitter.com') {
			const user = await firebaseApp.auth().getUser(decodedToken.uid);
			const provider = user.providerData.find((prov) => prov.providerId === 'twitter.com');
			if (provider) {
				const twitterUid = provider.uid;

				const twitterUserInfoEndpoint = `https://api.twitter.com/1.1/users/show.json?user_id=${twitterUid}`;
				const twitterResponse = await axios.get<{ screen_name: string }>(twitterUserInfoEndpoint, {
					headers: {
						authorization: `Bearer ${process.env.TWITTER_CONSUMER_BEARER}`,
					},
				});

				const signer = ethers.utils.verifyMessage(
					`Connect twitter @${twitterResponse.data.screen_name?.toLowerCase()}`,
					signature,
				);
				if (!ethers.utils.isAddress(signer)) throw Error('Invalid signature');

				const signatureHex = signature.replace(/^0x/, '');
				const signatureBuffer = Uint8Array.from(Buffer.from(signatureHex, 'hex'));
				const word = hash(signatureBuffer);

				const secretKey = Buffer.from(process.env.SIGNER_SECRET_KEY, 'hex');
				const pair = sign.keyPair.fromSeed(Uint8Array.from(secretKey).slice(0, 32));
				const signedWord = Buffer.from(sign(word, pair.secretKey)).toString('hex');

				response.json({
					signature: `${signatureHex}:${signedWord}`,
				});
				return;
			}
		}
	} catch (error) {
		logger.error((<Error>error).message);
	}
	response.status(403).json({
		error: 'Token verification failed',
	});
}
