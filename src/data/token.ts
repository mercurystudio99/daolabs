import { readNetwork } from '$stores/web3';
import { httpHeaders } from '$utils/firebase';
import { CodeError } from '$utils/errors';
import type { Erc20Data } from '@moralisweb3/evm-utils';

type QueryParams = {
	[key: string]: string | number | boolean | null | undefined;
};

export class TokenData {
	static getEndpoint(method: string, params: string[] = [], queryParams: QueryParams = {}) {
		const network = readNetwork.get();
		const path = [method, ...params].join('/');
		const queryString = Object.entries({
			...queryParams,
			chain: network.id,
		})
			.map(([key, value]) => `${key}=${String(value)}`)
			.join('&');

		return `${
			import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string
		}/app/web3/${path}?${queryString}`;
	}

	static fetch(endpoint: string): Promise<Response> {
		return fetch(endpoint, {
			headers: httpHeaders,
		});
	}

	static async getWalletTokenBalances(address: string): Promise<Token[]> {
		try {
			const response = await this.fetch(this.getEndpoint('getWalletTokenBalances', [address]));
			const json = (await response.json()) as TokenBalance[];
			// flatten the list items
			return json.map((item) => ({
				...item.token,
				contractAddress: String(item.token.contractAddress),
				value: Math.abs(item.value),
				uniswapPrice: Math.abs(item.uniswapPrice),
				shushiswapPrice: Math.abs(item.shushiswapPrice),
			})) as Token[];
		} catch (e) {
			console.error(e);
			throw new CodeError('Fetching the token balances has encountered an error', 'tokenBalances');
		}
	}
}

export type TokenBalance = {
	value: number;
	token: Erc20Data;
	uniswapPrice: number;
	shushiswapPrice: number;
};

export type Token = Erc20Data & { value: number } & {
	contractAddress: string;
	tokenBalance: number;
	uniswapPrice: number;
	shushiswapPrice: number;
};
