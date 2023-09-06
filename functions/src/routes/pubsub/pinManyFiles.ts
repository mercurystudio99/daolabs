import { QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';
import { database, firestore } from '../../init';
import { Collection } from '../../types/Collection';
import { pushPFPAssetsToIpfs } from '../../utils/pfp';

export async function pinManyFilesFn(snapshot: QueryDocumentSnapshot, context: any) {
	const { params } = context as { params: { docId: string } };
	const data = snapshot.data() as { collectionId: string };
	const ref = database.ref(`collections/${data.collectionId}`);
	const collection: Collection = (await ref.get()).val() as Collection;
	await firestore.doc(`pin-many-files/${params.docId}`).update({
		status: 'pending',
	});
	const newCollection = await pushPFPAssetsToIpfs(collection, `pin-many-files/${params.docId}`);
	await ref.set(newCollection);
	await firestore.doc(`pin-many-files/${params.docId}`).update({
		status: 'success',
	});
}
