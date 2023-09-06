import { getFunctions } from 'firebase-admin/functions';
import { ContractInput, validateContractInput } from '../../utils/contract';
import { firebaseApp } from '../../init';
import type { Request, Response } from 'express';

export const scheduleContractWrite = (req: Request, res: Response) => {
	const { date, ...rest } = req.body as ContractInput & { date: string };
	const scheduledDate = new Date(date);

	if (!validateContractInput(rest)) {
		res.status(400).json({ error: 'Invalid contract input' });
		return;
	}

	// Validate date
	const now = new Date();
	if (isNaN(scheduledDate.getTime()) || scheduledDate <= now) {
		console.log('Invalid date or date in the past');
		res.status(400).json({ error: 'Invalid date or date in the past' });
		return;
	}

	const internalFunctions = getFunctions(firebaseApp);
	internalFunctions
		.taskQueue('scheduleWriteContract')
		.enqueue(
			{
				...(rest as ContractInput),
			},
			{
				scheduleTime: scheduledDate,
			},
		)
		.then(() => {
			res.status(200).send('Function scheduled successfully');
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json({ error: 'Error scheduling function execution' });
		});
};
