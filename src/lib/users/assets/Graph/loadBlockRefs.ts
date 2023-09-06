// TODO seems unnecessary to install moment.js just for this script
// https://github.com/monosux/ethereum-block-by-date/blob/master/src/ethereum-block-by-date.js
// attempted to do so in jbx/utils/etherumBlockByDate.ts but brainfog
import { formatISO } from 'date-fns';

import readProvider from '$constants/readProvider';
import { EthereumBlockByDate } from '$utils/ethereumBlockByDate';
import { daysToMillis } from './utils';
import type { BlockRef, Duration } from './types';

export const loadBlockByFetch = async ({
	duration,
	now,
	address,
}: {
	duration: Duration;
	now: number;
	address: string;
}) => {
	const headers = new Headers();
	headers.append('apikey', String(import.meta.env.VITE_API_KEY));
	const response = await fetch(
		`${String(
			import.meta.env.VITE_FIREBASE_FUNCTIONS_URL,
		)}/app/alchemy/getBlocks?now=${now}&duration=${duration}&address=${address}`,
		{ headers },
	);
	const json = (await response.json()) as {
		data: { block: number; timestamp: number; balance: string }[];
	};
	return json.data;
};

export const loadBlockRefs = async ({ duration, now }: { duration: Duration; now: number }) => {
	// Get number of most recent block, and block at start of duration window
	const blockRefs = new EthereumBlockByDate(readProvider())
		.getEvery(
			'days',
			//TODO + 0.1 fixes bug where only one block is returned. Needs better fix
			formatISO(now - daysToMillis(duration + 0.1)),
			formatISO(now),
			duration,
			false,
		)
		.then((res: (BlockRef & { block: number })[]) => {
			const newBlockRefs: BlockRef[] = [];
			const blocksCount = 100;

			// Calculate intermediate block numbers at consistent intervals
			for (let i = 0; i < blocksCount; i++) {
				newBlockRefs.push({
					block: Math.round(((res[1].block - res[0].block) / blocksCount) * i + res[0].block),
					timestamp: Math.round(
						((res[1].timestamp - res[0].timestamp) / blocksCount) * i + res[0].timestamp,
					),
				});
			}

			// Push blockRef for "now"
			newBlockRefs.push({
				block: null,
				timestamp: Math.round(now.valueOf() / 1000),
			});

			return newBlockRefs;
		});
	return blockRefs;
};
