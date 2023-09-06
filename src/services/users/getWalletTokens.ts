import { httpHeaders } from '$utils/firebase';
import type { BigNumber } from 'ethers';

export type Balance = {
	thumbnail?: string | null;
	logo?: string | null;
	uniswapPrice?: number;
	balance: string | BigNumber;
	name: string;
	symbol: string;
	decimals: number;
	contractAddress: string;
	shushiswapPrice?: number;
	tokenBalance?: number;
	sketchy?: boolean;
};

export const getWalletTokenBalances = async (
	walletAddress: string,
	chainId: string,
	fetch: Window['fetch'],
): Promise<Balance[]> => {
	try {
		const url = `${String(
			import.meta.env.VITE_FIREBASE_FUNCTIONS_URL,
		)}/app/web3/getWalletTokenBalances/${walletAddress}?chain=${chainId}`;

		const response = await fetch(url, { headers: httpHeaders });
		let json = (await response.json()) as Balance[];
		json = json.map((token) => ({ ...token, contractAddress: token.token_address as string }));
		return json.filter(
			(token) =>
				!token.name.startsWith('$') && !token.name.startsWith('!') && !token.name.startsWith('@'),
		);
	} catch (error) {
		// TODO: [getWalletTokenBalances] error handling
		console.error('[getWalletTokenBalances]', error);
		return [];
	}
};
