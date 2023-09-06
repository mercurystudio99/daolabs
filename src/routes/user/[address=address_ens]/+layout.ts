import { error, type Page } from '@sveltejs/kit';
import { utils } from 'ethers';
import { changeUserData } from '$utils/firebase';
import { addressFromEns } from '$utils/web3/address';
import { getWalletTokenBalances } from '$services/users/getWalletTokens';
import { chainId } from '$stores/web3';
import { browser } from '$app/environment';

export async function load({ params, fetch }: { params: Page['params']; fetch: Window['fetch'] }) {
	if (!browser) return {};
	const address = utils.isAddress(params.address)
		? params.address
		: params.address.endsWith('.eth')
		? await addressFromEns(params.address)
		: null;

	if (!address && browser) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw error(404, 'page not found');
	}
	await changeUserData(address);
	let balances = [];
	try {
		balances = await getWalletTokenBalances(address, `0x${chainId.get()}`, fetch);
	} catch (err) {
		console.error(err);
	}

	return {
		address,
		balances,
	};
}

export const prerender = 'auto';
