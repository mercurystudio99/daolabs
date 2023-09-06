import { BigNumber } from 'ethers';

type Types = string | number | boolean | BigNumber;

export function projectDataToJson<T = Record<string, Types | Types[] | Record<string, Types>>>(
	payload: T,
	skip: string[] = [],
): T {
	if (['string', 'number', 'boolean'].includes(typeof payload)) {
		return payload;
	} else if (payload instanceof Array) {
		return payload.map((n) => projectDataToJson(n) as T) as T;
	} else if (payload instanceof BigNumber) {
		return `BN:${payload.toHexString()}` as T;
	} else if (typeof payload === 'object' && payload !== null) {
		return Object.fromEntries(
			Object.entries(payload)
				.map<T[]>(
					([key, value]) => (skip.includes(key) ? [''] : [key, projectDataToJson(value)]) as T[],
				)
				.filter(([k, v]) => !!k && typeof v !== 'undefined'),
		) as T;
	}
}

export function parseProjectJson<T = Record<string, Types | Types[] | Record<string, Types>>>(
	payload: T,
	skip: string[] = [],
) {
	if (typeof payload === 'string' && payload.startsWith('BN:0x')) {
		return BigNumber.from(payload.replace('BN:', ''));
	} else if (['string', 'number', 'boolean'].includes(typeof payload)) {
		return payload;
	} else if (payload instanceof Array) {
		return payload.map((n) => parseProjectJson(n) as T) as T;
	} else if (typeof payload === 'object' && payload !== null) {
		return Object.fromEntries(
			Object.entries(payload)
				.map<T[]>(
					([key, value]) => (skip.includes(key) ? [''] : [key, parseProjectJson(value)]) as T[],
				)
				.filter(([k, v]) => !!k && typeof v !== 'undefined'),
		) as T;
	}
}
