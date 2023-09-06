import {
	type ContractInput,
	type StatusError,
	validateContractInput,
	handleContractWrite,
} from '../../utils/contract';
import type { Request, Response } from 'express';

export async function writeContract(req: Request, res: Response) {
	const inputValid = validateContractInput(req.body as ContractInput);
	if (!inputValid) {
		return res.status(400).json({
			error: 'Missing required parameters',
		});
	}
	try {
		const result = await handleContractWrite(req.body as ContractInput);
		return res.json(result);
	} catch (error) {
		console.log(error);
		return res.status((error as StatusError).status).json({
			error: (error as StatusError).message,
		});
	}
}
