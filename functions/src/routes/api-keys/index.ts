import { randomUUID } from 'crypto';
import { Router } from 'express';
import { firestore } from '../../init';

const apiKeyRouter = Router();

apiKeyRouter.post('/', async (req, res) => {
	const apiKey = randomUUID();

	const doc = firestore.doc(`apikeys/${apiKey}`);

	try {
		await doc.set({
			created_at: Date.now(),
			whitelisted: false,
		});
		res.send({
			apiKey,
			success: true,
			whitelisted: false,
		});
	} catch (error) {
		console.log('Error:');
		console.error(error);
		res.status(500).send({
			success: false,
			error: 'some error',
		});
	}
});

apiKeyRouter.delete('/:apiKey', async (req, res) => {
	const { apiKey } = req.params || {};
	const doc = firestore.doc(`apikeys/${apiKey}`);
	try {
		const snap = await doc.get();
		if (snap.exists) {
			await doc.delete();
		}
		res.send({
			apiKey,
			success: true,
		});
	} catch (error) {
		console.log('Error:');
		console.error(error);
		res.status(500).send({
			success: false,
			error: 'some error',
		});
	}
});

export default apiKeyRouter;
