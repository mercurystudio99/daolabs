/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BigNumber } from 'ethers';

export type ParseCachedData = string[] | string | Record<string, unknown> | BigNumber;
export type ParseContractResponse = string[] | string | Record<string, unknown> | BigNumber;

export function parseContractResponse(
	data: string | Record<string, string>,
): ParseContractResponse {
	if (['string', 'boolean', 'number'].includes(typeof data)) {
		return data;
	}
	if (Array.isArray(data)) {
		const isObject = Object.keys(data).find((key) => key.match(/[^\d]/));
		if (isObject) {
			return parseContractResponse({ ...(data as Record<string, string>) });
		}
		return data.map(parseContractResponse) as string[];
	}
	//@ts-ignore
	if (data instanceof BigNumber || data._isBigNumber) {
		//@ts-ignore
		return BigNumber.from(data.hex || data._hex);
	}
	if (typeof data === 'object') {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return Object.keys(data).reduce((acc, key) => {
			acc[key] = parseContractResponse(data[key]);
			return acc;
		}, {});
	}
	return data;
}

export function parseCachedData(
	data: string | Record<string, string | number | BigNumber>,
): ParseCachedData {
	if (['string', 'boolean', 'number'].includes(typeof data)) {
		return data;
	}
	if (Array.isArray(data)) {
		return data.map(parseCachedData) as string[];
	}
	if (typeof data === 'object') {
		const result: Record<string, unknown> = {};
		if ((data.type === 'BigNumber' || data._isBigNumber) && (data.hex || data._hex)) {
			return BigNumber.from(data.hex || data._hex);
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		for (const key of Object.keys(data)) {
			//@ts-ignore
			result[key] = parseCachedData(data[key]);
		}
		return result;
	}
	return data;
}
