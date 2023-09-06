import axios from 'axios';
import type { Request, Response } from 'express';

export const blocknativeGasPrices =
	'https://api.blocknative.com/gasprices/blockprices?confidenceLevels=70&confidenceLevels=90';

export async function currentGas(request: Request, response: Response) {
	const result = await axios.get(blocknativeGasPrices, {
		headers: {
			Authorization: process.env.BLOCKNATIVE_API_KEY,
		},
	});
	if ((200 >= result.status || result.status < 400) && result.data) {
		response.json(result.data);
	} else {
		response.status(result.status).json({
			error: result.statusText,
		});
	}
}
