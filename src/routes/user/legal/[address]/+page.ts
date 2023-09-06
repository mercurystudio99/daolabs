import { error, type Page } from '@sveltejs/kit';
import { utils } from 'ethers';
import { changeUserData, userdata } from '$utils/firebase';
import { addressFromEns } from '$utils/web3/address';
import { browser } from '$app/environment';

export async function load({ params }: { params: Page['params']; fetch: Window['fetch'] }) {
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
	let userLegal = '';
	userdata.subscribe((_user) => {
		userLegal = _user?.legalContent;
	});

	return {
		userLegal,
	};
}

export const prerender = 'auto';
