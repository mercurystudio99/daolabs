import { ZDK } from '@zoralabs/zdk';
import { ZDKChain, ZDKNetwork } from '@zoralabs/zdk/dist/types';
import Store from '$utils/Store';
import { NetworkName } from '$models/network-name';
import { pageReady } from '$stores';
import { readNetwork } from './web3';
import type { CurrentNetwork } from '$constants/networks';

export const zora = new Store<ZDK>(null);

function getNetworkInfo(network: CurrentNetwork) {
	if (network.alias === NetworkName.mainnet) {
		return {
			network: ZDKNetwork.Ethereum,
			chain: ZDKChain.Mainnet,
		};
	}
	return {
		network: ZDKNetwork.Ethereum,
		chain: ZDKChain.Goerli,
	};
}

function getSettings(network: CurrentNetwork) {
	const networkInfo = getNetworkInfo(network);
	return {
		endPoint:
			networkInfo.chain === ZDKChain.Mainnet ? 'https://api.zora.co' : 'https://api.goerli.zora.co',
		networks: [networkInfo],
	};
}

pageReady.subscribe((state) => {
	if (state.web3 || !zora) {
		const settings = getSettings(readNetwork.get());
		zora.set(new ZDK(settings));
	}
});

readNetwork.subscribe((network) => {
	if (zora) {
		const settings = getSettings(network);
		zora.set(new ZDK(settings));
	}
});
