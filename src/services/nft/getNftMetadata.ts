import { httpHeaders } from '$utils/firebase';
import type { Event, Token, Sale as SaleType } from '@zoralabs/zdk/dist/queries/queries-sdk';

type ErrorType = { errors: { [key: string]: { [key: string]: string } }[]; message: string };

async function requestHelper(body: string, fetch: Window['fetch']) {
	try {
		const url = `${String(import.meta.env.VITE_FIREBASE_FUNCTIONS_URL)}/app/zora/graphQl`;
		const response = await fetch(url, {
			method: 'POST',
			body,
			headers: httpHeaders,
		});
		const json = (await response.json()) as ErrorType;
		if (json.errors) {
			// TODO: I'm not throwing here as I'm not sure how the current
			// implementation of the error handling works, ie do they check data key etc
			console.log(json.errors);
		}
		return json;
	} catch (e) {
		const callerName = requestHelper.caller.name;
		console.error(`[${callerName}]`, e);
		return null;
	}
}

export const getNftMetadata = async (body: string, fetch: Window['fetch']) => {
	const json = (await requestHelper(body, fetch)) as {
		data: { token: { token: Token; events: Event[]; sales: SaleType[] } };
	} & ErrorType;
	return json?.data?.token;
};

export const getNftsForContract = async (body: string, fetch: Window['fetch']) => {
	const json = (await requestHelper(body, fetch)) as {
		data: { tokens: { token: Token; events: Event[]; sales: SaleType[] }[] };
	} & ErrorType;
	return json;
};

export const getTotalNumberOfOwners = async (body: string, fetch: Window['fetch']) => {
	const json = (await requestHelper(body, fetch)) as {
		data: { aggregateStat: { ownersCount: number } };
	} & ErrorType;
	return json;
};

export const getNftOwnersList = async (body: string, fetch: Window['fetch']) => {
	const json = (await requestHelper(body, fetch)) as {
		data: {
			aggregateStat: {
				ownersByCount: {
					nodes: { number: number; owner: string };
					pageInfo: { hasNextPage: boolean; endCursor: string };
				};
			};
		};
	} & ErrorType;
	return json;
};
