import axios from 'axios';
import { BigNumber, utils } from 'ethers';
import type { Request, Response } from 'express';

export async function checkGnosisAddress(req: Request, res: Response) {
	const getEndpoint = (address: string) =>
		`https://safe-transaction.gnosis.io/api/v1/safes/${address}/`;
	const { address } = req.params || {};
	try {
		const { data, status } = await axios.get(getEndpoint(utils.getAddress(address)));
		if (status < 400 && data) {
			res.json({
				isGnosis: true,
				...(data || {})
			});
			return;
		}
	} catch (error) {
		console.log('Error:', error?.message);
	}
	res.json({
		isGnosis: false
	});
}

export async function safeBalancesInEth(req: Request, res: Response) {
	const getEndpoint = (address: string) =>
		`https://safe-transaction.gnosis.io/api/v1/safes/${address}/balances/usd/?trusted=false&exclude_spam=false`;
	let { address } = req.params || {};
	try {
		address = utils.getAddress(address);
		console.log({ address });
		const { data, status } = await axios.get(getEndpoint(address));
		if (status < 400 && data) {
			const ethValues = data.map((token) =>
				BigNumber.from(token.balance)
					.mul(Math.floor(Number(token.ethValue) * 10 ** 9))
					.div(10 ** 9)
					.div(BigNumber.from(10).pow(token.token?.decimals || 18))
			);
			res.json({
				isGnosis: true,
				ethValue: ethValues.reduce((acc, value) => acc.add(value), BigNumber.from(0))?.toString()
			});
			return;
		}
		console.log(data, status);
	} catch (error) {
		console.log('Error:', error?.message);
	}
	res.json({
		isGnosis: false
	});
}

export async function getPendingTransactions(req: Request, res: Response) {
	const getEndpoint = (address: string) =>
		`https://safe-transaction.gnosis.io/api/v1/safes/${address}/all-transactions/?executed=false&limit=20&offset=20&queued=true&trusted=true`;
	let { address } = req.params || {};
	try {
		address = utils.getAddress(address);
		console.log({ address });
		const { data, status } = await axios.get(getEndpoint(address));
		if (status < 400 && data) {
			const pendingTransactions = data.results.filter((res) => res.isExecuted === false);
			res.json({
				isGnosis: true,
				count: pendingTransactions.length,
				pendingTransactions: pendingTransactions
			});
			return;
		}
		console.log(data, status);
	} catch (error) {
		console.log('Error:', error?.message);
	}
	res.json({
		isGnosis: false
	});
}
