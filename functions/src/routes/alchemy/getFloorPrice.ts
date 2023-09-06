import { fetch } from 'undici';
import type { Response, Request } from 'express';

export function getFloorPrice(request: Request, response: Response) {
	const { contractAddress } = request.query;

	if (!contractAddress) {
		response.statusCode = 400;
		response.json({
			message: 'contractAddress is a required request parameter',
		});
	}

	const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${
		process.env.ALCHEMY_API_KEY
	}/getFloorPrice?contractAddress=${contractAddress.toString()}`;

	fetch(url)
		.then((res) => {
			response.set('Content-Type', res.headers.get('content-type'));
			res
				.json()
				.then((floorPrice) => {
					response.json(floorPrice);
					return;
				})
				.catch((e) => response.send(e));
		})
		.catch((e) => response.send(e));
}
