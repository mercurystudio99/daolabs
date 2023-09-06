import { fetch } from 'undici';
import type { Response, Request } from 'express';

export function getAssetTransfers(request: Request, response: Response) {
	const { fromAddress, toAddress, pageKey } = request.query;

	if (!fromAddress && !toAddress) {
		response.statusCode = 400;
		response.json({
			message: 'fromAddress or toAddress is a required request parameter',
		});
	}

	const url = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

	const body = {
		id: 1,
		jsonrpc: '2.0',
		method: 'alchemy_getAssetTransfers',
		params: [
			{
				fromBlock: '0x0',
				withMetadata: true,
				order: 'desc',
				maxCount: '0x3e8',
				excludeZeroValue: true,
				category: ['external', 'erc20', 'erc721', 'erc1155'],
			},
		],
	};
	//@ts-ignore
	if (fromAddress) body.params[0].fromAddress = fromAddress;
	//@ts-ignore
	if (toAddress) body.params[0].toAddress = toAddress;

	//@ts-ignore
	if (pageKey) body.params[0].pageKey = pageKey;

	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	})
		.then((res) => {
			response.set('Content-Type', res.headers.get('content-type'));
			res
				.json()
				.then(({ result }) => {
					response.json(result);
					return;
				})
				.catch((e) => response.send(e));
		})
		.catch((e) => response.send(e));
}
