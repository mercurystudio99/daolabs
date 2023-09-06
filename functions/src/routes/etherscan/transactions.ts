import axios from 'axios';
import type { Request, Response } from 'express';

const getEndpoint = (address: string) =>
	`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`;

export async function getTransactions(req: Request, res: Response) {
	const { address } = req.params || {};
	if (address) {
		try {
			const { data } = await axios.get(getEndpoint(address));
			if (data.result) {
				res.json(data.result);
				return;
			}
		} catch (error) {
			console.error(error.message);
		}
	}
	res.status(500).json({
		message: `Fetching all Etherscan transactions for ${address} has encountered an error`
	});
}
