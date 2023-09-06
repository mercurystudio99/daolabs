import { fetch } from 'undici';
import type { Response, Request } from 'express';

export function getContractInfo(request: Request, response: Response) {
	const { contractAddress } = request.query;

	if (!contractAddress) {
		response.statusCode = 400;
		response.json({
			message: 'contractAddress is a required request parameter',
		});
		return;
	}

	const API_URL = `https://api.opensea.io/api/v1/asset_contract/${contractAddress.toString()}`;
	fetch(API_URL)
		.then((res) => {
			console.log(res);
			res
				.json()
				.then((contract) => {
					response.json(contract);
				})
				.catch((e) => {
					response.statusCode = 400;
					response.send(e);
				});
		})
		.catch((e) => {
			response.statusCode = 400;
			response.send(e);
		});
}
