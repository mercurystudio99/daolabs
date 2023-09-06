import { Request, Response } from 'express';
import { firestore } from '../init';

const checkKey = async (key: string): Promise<boolean> => {
	const doc = firestore.doc(`apikeys/${key}`);
	const snap = await doc.get();
	return Boolean(snap.exists && snap.data().whitelisted);
};

export async function checkApiKey(request: Request, response: Response, next: Function) {
	if (!request.headers || !request.headers.apikey) {
		response.statusCode = 403;
		response.json({ error: 'Missing Api key from the header' });
		return;
	}
	const isApikey = await checkKey(String(request.headers.apikey));

	if (!isApikey) {
		response.statusCode = 403;
		response.json({ error: 'Api key not found' });
		return;
	}
	next();
}
