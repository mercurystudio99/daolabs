import * as admin from 'firebase-admin';
import Moralis from 'moralis';
import * as functions from 'firebase-functions';

// const serviceAccount = require('../juicebox-svelte-firebase-adminsdk-dcrl6-5bbff7a999.json');

// const options = {
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "juicebox-svelte.appspot.com",
//   databaseURL: "https://juicebox-svelte-default-rtdb.firebaseio.com"
// };

export const firebaseApp = admin.initializeApp({
	serviceAccountId: 'juicebox-svelte@appspot.gserviceaccount.com',
});
export const firestore = firebaseApp.firestore();
firestore.settings({ ignoreUndefinedProperties: true });
export const storage = admin.storage(firebaseApp);
export const database = firebaseApp.database('https://juicebox-svelte-default-rtdb.firebaseio.com');

async function initMoralis() {
	await Moralis.start({
		apiKey: process.env.MORALIS_API_KEY,
	});
}

initMoralis().catch((error) => {
	functions.logger.error('Error initializing moralis', error);
});
