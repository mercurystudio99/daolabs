import { fetch } from 'undici';
import type { Response, Request } from 'express';

async function getBlockNumbers(
	timestamp: number,
): Promise<{ blockNumber: number; timestamp: number }> {
	const gql = JSON.stringify({
		query: `query MyQuery { blocks(first: 1, orderBy: timestamp, orderDirection: asc, where: { timestamp_gte:  ${timestamp} }) { number timestamp }}`,
		variables: {},
	});
	const response = await fetch(
		'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: gql,
			redirect: 'follow',
		},
	);

	const json = (await response.json()) as {
		data: { blocks: { number: number; timestamp: number }[] };
	};
	return {
		blockNumber: json.data.blocks[0].number,
		timestamp: json.data.blocks[0].timestamp,
	};
}

const getBalanceByBlock = async (address: string, block?: string) => {
	const url = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

	const body = {
		id: 1,
		jsonrpc: '2.0',
		method: 'eth_getBalance',
		params: [address],
	};
	if (block) {
		body.params.push(block);
	}
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	const json = (await response.json()) as { result: string };
	return json.result;
};

export async function getBlocks(request: Request, response: Response) {
	const { address, duration, now } = request.query;

	const SECONDS_IN_DAY = 24 * 60 * 60;
	const daysToMillis = (days: number) => days * SECONDS_IN_DAY * 1000;

	const startBlock = await getBlockNumbers(
		Math.floor((Number(now) - daysToMillis(Number(duration) + 0.1)) / 1000),
	);
	const nowBlock = await getBlockNumbers(Math.floor(Number(now) / 1000));

	const newBlockRefs: { block: number; timestamp: number; balance?: string }[] = [];
	const blocksCount = 100;
	const blancePromises = [];

	// Calculate intermediate block numbers at consistent intervals
	for (let i = 0; i < blocksCount; i++) {
		const block = Math.round(
			((+nowBlock.blockNumber - +startBlock.blockNumber) / +blocksCount) * +i +
				+startBlock.blockNumber,
		);
		const blockHex = `0x${Number(block).toString(16)}`;
		const balance = getBalanceByBlock(String(address), blockHex);
		blancePromises.push(balance);
		newBlockRefs.push({
			block,
			timestamp: Math.round(
				((+nowBlock.timestamp - +startBlock.timestamp) / +blocksCount) * +i + +startBlock.timestamp,
			),
		});
	}

	newBlockRefs.push({
		block: nowBlock.blockNumber,
		timestamp: Math.round(Number(now).valueOf() / 1000),
	});

	const balance = getBalanceByBlock(String(address));
	blancePromises.push(balance);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	Promise.all<string[]>(blancePromises)
		.then((data) => {
			response.json({
				data: newBlockRefs.map((b, i) => ({
					...b,
					balance: data[i],
				})),
			});
		})
		.catch(console.error);
}

export function getBalance(request: Request, response: Response) {
	const { address, blockNumber } = request.query;

	if (!address) {
		response.statusCode = 400;
		response.json({
			message: 'fromAddress or toAddress is a required request parameter',
		});
	}

	const url = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

	const body = {
		id: 1,
		jsonrpc: '2.0',
		method: 'eth_getBalance',
		params: [address],
	};
	const num = +blockNumber;
	console.log(num.toString(16));
	if (blockNumber) body.params.push(`0x${num.toString(16)}`);

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
				.then((data: { result: string }) => {
					console.log(data);
					response.json({
						balance: data.result,
					});
					return;
				})
				.catch((e) => response.send(e));
		})
		.catch((e) => response.send(e));
}
