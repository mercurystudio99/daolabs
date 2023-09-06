import * as admin from 'firebase-admin';
import axios from 'axios';
import { utils } from 'ethers';
import { Request, Response } from 'express';
import { firebaseApp } from '../../init';

const firestore = admin.firestore(firebaseApp);

const CACHE_FOR = 1000 * 60 * 60 * 24;

export async function getParticipationScore(req: Request, res: Response) {
	let { address } = req.params || {};
	try {
		address = utils.getAddress(address);

		const document = firestore.doc(`/deepdao/${address}`);

		try {
			const snapshot = await document.get();
			if (snapshot.exists) {
				console.log('used cached version');
				const data = snapshot.data();
				const timestamp = new Date(data.date).getTime();
				if (Date.now() - timestamp < CACHE_FOR) {
					res.json(snapshot.data());
					return;
				}
			}
		} catch (error) {
			console.log(error);
		}

		const endpoint1 = `https://api.deepdao.io/v0.1/people/participation_score/${address}`;
		const endpoint2 = `https://api.deepdao.io/v0.1/people/is_active_in_daos/${address}`;
		const headers = {
			'X-API-Key': process.env.DEEP_DAO_API_KEY,
		};
		const { data: data1, status: status1 } = await axios.get(endpoint1, {
			headers,
		});

		const { data: data2, status: status2 } = await axios.get(endpoint2, {
			headers,
		});

		if (status1 < 400 && status2 < 400) {
			const result = {
				...(data1?.data || {}),
				...(data2?.data || {}),
				date: data2?.apiAccountMetaData?.date,
			};

			try {
				await document.set(result);
			} catch (error) {
				console.log(error);
			}

			res.json({
				...result,
			});
			return;
		}
	} catch (error) {
		console.log('Error:', error?.message);
	}
	res.json({
		error: `Fetching the DeepDAO participation score for ${address} has encountered an error`,
	});
}
