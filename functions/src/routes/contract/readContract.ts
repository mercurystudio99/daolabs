import { ethers } from 'ethers';
import { getRpcUrl, parseContractResponse } from '../../utils/contract';
import type { Request, Response } from 'express';

export async function readContract(req: Request, res: Response) {
	const {
		chainId,
		address,
		abi,
		function: fn,
		args,
	} = req.body as {
		chainId: number | string;
		address: string;
		abi: any[];
		function: string;
		args: any[];
	};
	if (chainId && address && abi && fn && args) {
		try {
			const provider = new ethers.providers.JsonRpcProvider(getRpcUrl(Number(chainId)));
			const contract = new ethers.Contract(address, abi, provider);
			const result = parseContractResponse(await contract[fn](...args));
			return res.json(result);
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				error: error.message,
			});
		}
	} else {
		return res.status(400).json({
			error: `Missing required parameters`,
		});
	}
}
