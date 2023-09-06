import { Buffer } from 'buffer';
import { setCurrentNetworkAlias } from '$utils/web3/networkName';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const csr = true;

if (browser) {
	window.Buffer = Buffer;
}

export const load: LayoutLoad = () => {
	setCurrentNetworkAlias();
};
