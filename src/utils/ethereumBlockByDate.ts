// /**
//  * Wholly taken from https://github.com/monosux/ethereum-block-by-date/blob/master/src/ethereum-block-by-date.js
//  * and rewritten to use date-fns
//  *
//  * :WIP: This is a work in progress.
//  */

import {
	format,
	formatISO,
	addMinutes,
	getUnixTime,
	isAfter,
	isEqual,
	isBefore,
	differenceInSeconds,
	parseISO,
	add,
} from 'date-fns';

function toUTC(date: Date) {
	return format(addMinutes(date, date.getTimezoneOffset()), 'yyyy-MM-dd HH:mm:ss');
}

function isSameOrAfter(date1: number | Date, date2: number | Date) {
	return isEqual(date1, date2) || isAfter(date1, date2);
}

function isSameOrBefore(date1: number | Date, date2: number | Date) {
	return isEqual(date1, date2) || isBefore(date1, date2);
}

export class EthereumBlockByDate {
	web3: any;

	checkedBlocks: Record<string, number[]>;

	savedBlocks: Record<string, { number: number; timestamp: number }>;

	requests: number;

	latestBlock: {
		number: number;
		timestamp: number;
	};

	firstBlock: {
		number: number;
		timestamp: number;
	};

	blockTime: number;

	constructor(web3) {
		this.web3 = typeof web3.eth !== 'undefined' ? web3 : { eth: web3 };
		this.checkedBlocks = {};
		this.savedBlocks = {};
		this.requests = 0;
	}

	async getBoundaries() {
		this.latestBlock = await this.getBlockWrapper('latest');
		this.firstBlock = await this.getBlockWrapper(1);
		this.blockTime =
			(this.latestBlock.timestamp - this.firstBlock.timestamp) / (this.latestBlock.number - 1);
	}

	async getDate(date: Date, after = true, refresh = false) {
		date = parseISO(toUTC(date));
		if (
			typeof this.firstBlock === 'undefined' ||
			typeof this.latestBlock === 'undefined' ||
			typeof this.blockTime === 'undefined' ||
			refresh
		)
			await this.getBoundaries();
		const firstBlockUnix = getUnixTime(this.firstBlock.timestamp * 1000) * 1000;
		const latestBlockUnix = getUnixTime(this.latestBlock.timestamp * 1000) * 1000;
		if (isBefore(date, firstBlockUnix)) {
			return this.returnWrapper(formatISO(date), 1);
		}
		if (isSameOrAfter(date, latestBlockUnix)) {
			return this.returnWrapper(formatISO(date), this.latestBlock.number);
		}
		this.checkedBlocks[getUnixTime(date)] = [];
		const predictedBlock = await this.getBlockWrapper(
			Math.ceil(
				differenceInSeconds(date, getUnixTime(this.firstBlock.timestamp * 1000) * 1000) /
					this.blockTime,
			),
		);
		return this.returnWrapper(formatISO(date), await this.findBetter(date, predictedBlock, after));
	}

	async getEvery(duration, start: string, end: string, every = 1, after = true, refresh = false) {
		let current = parseISO(start);
		const dates: Array<Date> = [];
		let maxCount = 0;
		while (isSameOrBefore(current, parseISO(end)) && maxCount < 50) {
			dates.push(current);
			current = add(current, { [duration]: every });
			maxCount++;
		}
		if (
			typeof this.firstBlock === 'undefined' ||
			typeof this.latestBlock === 'undefined' ||
			typeof this.blockTime === 'undefined' ||
			refresh
		)
			await this.getBoundaries();
		return Promise.all(dates.map((date) => this.getDate(date, after)));
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async findBetter(
		date: number | Date,
		predictedBlock: { number: number; timestamp: number },
		after: boolean,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		blockTime = this.blockTime,
	) {
		return predictedBlock.number;
		// NOTE: Commented it out because code below is unreachable but linter finds errors
		//       Please remove disabled error after code below will be used
		// if (await this.isBetterBlock(date, predictedBlock, after)) return predictedBlock.number;
		// const difference = differenceInSeconds(
		// 	date,
		// 	getUnixTime(predictedBlock.timestamp * 1000) * 1000,
		// );
		// let skip = Math.ceil(difference / (blockTime == 0 ? 1 : blockTime));
		// if (skip == 0) skip = difference < 0 ? -1 : 1;
		// const nextPredictedBlock = await this.getBlockWrapper(
		// 	this.getNextBlock(date, predictedBlock.number, skip),
		// );
		// blockTime = Math.abs(
		// 	(predictedBlock.timestamp - nextPredictedBlock.timestamp) /
		// 		(predictedBlock.number - nextPredictedBlock.number),
		// );
		// return this.findBetter(date, nextPredictedBlock, after, blockTime);
	}

	async isBetterBlock(
		date: number | Date,
		predictedBlock: { number: number; timestamp: number },
		after: boolean,
	) {
		const blockTime = getUnixTime(predictedBlock.timestamp * 1000) * 1000;
		if (after) {
			if (isBefore(blockTime, date)) return false;
			const previousBlock = await this.getBlockWrapper(predictedBlock.number - 1);
			if (
				isSameOrAfter(blockTime, date) &&
				isBefore(getUnixTime(previousBlock.timestamp * 1000) * 1000, date)
			)
				return true;
		} else {
			if (isSameOrAfter(blockTime, date)) return false;
			const nextBlock = await this.getBlockWrapper(predictedBlock.number + 1);
			if (
				isBefore(blockTime, date) &&
				isSameOrAfter(getUnixTime(nextBlock.timestamp * 1000) * 1000, date)
			)
				return true;
		}
		return false;
	}

	getNextBlock(date: number | Date, currentBlock: number, skip: number): number {
		let nextBlock: number = currentBlock + skip;
		if (nextBlock > this.latestBlock.number) nextBlock = this.latestBlock.number;
		if (this.checkedBlocks[getUnixTime(date)].includes(nextBlock))
			return this.getNextBlock(date, currentBlock, skip < 0 ? --skip : ++skip);
		this.checkedBlocks[getUnixTime(date)].push(nextBlock);
		return nextBlock < 1 ? 1 : nextBlock;
	}

	returnWrapper(date: string, block: number) {
		return { date, block, timestamp: this.savedBlocks[block].timestamp };
	}

	async getBlockWrapper(block: string | number) {
		if (this.savedBlocks[block]) return this.savedBlocks[block];
		const { number, timestamp } = (await this.web3.eth.getBlock(block)) as {
			number: number;
			timestamp: number;
		};
		this.savedBlocks[number] = {
			timestamp,
			number,
		};
		this.requests++;
		return this.savedBlocks[number];
	}
}
