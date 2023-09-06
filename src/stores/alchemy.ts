import { Network, Alchemy, type AlchemySettings } from 'alchemy-sdk';
import Store from '$utils/Store';
import { NetworkName } from '$models/network-name';
import { pageReady } from '$stores';
import { readNetwork } from './web3';
import type { CurrentNetwork } from '$constants/networks';

export const alchemy = new Store<Alchemy>(null);

function getSettings(network: CurrentNetwork): AlchemySettings {
	if (network.alias === NetworkName.mainnet) {
		return {
			apiKey: import.meta.env.VITE_ALCHEMY_MAINNET_API_KEY as string,
			network: Network.ETH_MAINNET,
		};
	}
	return {
		apiKey: import.meta.env.VITE_ALCHEMY_GOERLI_API_KEY as string,
		network: Network.ETH_GOERLI,
	};
}

pageReady.subscribe((state) => {
	if (state.web3 || !alchemy) {
		const settings = getSettings(readNetwork.get());
		alchemy.set(new Alchemy(settings));
	}
});

readNetwork.subscribe((network) => {
	if (alchemy) {
		const settings = getSettings(network);
		alchemy.set(new Alchemy(settings));
	}
});
