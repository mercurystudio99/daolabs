import { BigNumber, utils, providers } from 'ethers';
import walletConnectModule from '@web3-onboard/walletconnect';
import ledgerModule from '@web3-onboard/ledger';
import trezorModule from '@web3-onboard/trezor';
import injectedModule from '@web3-onboard/injected-wallets';
import { blocknativeNetworks } from '$constants/networks';
import {
	getNetworkAliasByChainId,
	getNetworkAliasInQueryParams,
	setNetworkAliasInQueryParams,
} from '$utils/web3/networkName';
import { coinbaseWallet, gnosis as gnosisModule } from '$utils/onboard';
import Store from '$utils/Store';
import { authWithWallet } from '$utils/firebase';
import blockedAddresses from '$constants/blocklist';
import { getEthBalance } from '$data/eth';
import { handleCloudMessage } from '$utils/cloudMessage';
import { checkAndOpenDocumentModal } from '$services/templates';
import { browser } from '$app/environment';
import type { OnboardAPI, WalletState } from '@web3-onboard/core';
import type { AppMetadata } from '@web3-onboard/common';

export const ethPrice = new Store(1);
export const daiPrice = new Store(1);
export const web3Provider = new Store<providers.Web3Provider>();
export const connectedAccount = new Store('');
export const connectedAccountBalance = new Store<BigNumber>(undefined);
export const web3Onboard = new Store<OnboardAPI>();

export function getDefaultProvider(network?: string) {
	if (browser) {
		const defaultNetworkAlias = network ?? new URLSearchParams(location.search).get('network');
		return (
			blocknativeNetworks.find((net) => net.alias === defaultNetworkAlias) || blocknativeNetworks[0]
		);
	}
	return blocknativeNetworks[0];
}

export const chainId = new Store<number>(Number(getDefaultProvider().id));
export const readNetwork = new Store(getDefaultProvider());

function handleConnected(wallets: WalletState[]) {
	const activeWallet = wallets[0];
	if (browser) {
		localStorage.setItem('connectedWallets', JSON.stringify(wallets.map((w) => w.label)));
	}
	if (activeWallet) {
		const activeAccount = activeWallet.accounts?.[0];
		const activeChain = activeWallet.chains?.[0];
		if (activeAccount) {
			if (activeChain) {
				connectedAccount.set(activeAccount.address);
				chainId.set(Number(activeChain.id));
				const networkAlias = getNetworkAliasByChainId(activeChain.id);
				setNetworkAliasInQueryParams(networkAlias, networkAlias === getNetworkAliasInQueryParams());
				localStorage.setItem('network', networkAlias);
				web3Provider.set(new providers.Web3Provider(activeWallet.provider));
			} else {
				console.error('no active chain');
				connectedAccount.set('');
			}
		} else {
			console.error('no active account');
			connectedAccount.set('');
		}
	} else {
		console.error('no active wallet');
		connectedAccount.set('');
	}
}

export async function web3Disconnect() {
	const onboard = web3Onboard.get();
	if (!onboard) throw Error('web3Onboard is not set');
	await onboard.disconnectWallet({
		label: onboard?.state?.get().wallets[0].label,
	});
	console.log('disconnected');
	connectedAccount.set('');
	localStorage.setItem('connectedWallets', JSON.stringify([]));
}

export async function switchNetwork(_chainId: number | string) {
	const onboard = web3Onboard.get();
	if (!onboard) return;
	const netId = `0x${Number(_chainId).toString(16)}`;
	await onboard.setChain({
		chainId: netId,
	});
	chainId.set(Number(_chainId));
	const network = blocknativeNetworks.find((net) => net.id === netId);
	location.replace(`?network=${network.alias}`);
	// window.location.reload();
}

let skipHandleConnected = false;
export async function initialize() {
	if (!browser) return;
	const metadata: AppMetadata = {
		name: 'Juicebox',
		icon: '/favicon.svg',
		logo: '/favicon.svg',
		description: 'Community funding for people and projects',
		recommendedInjectedWallets: [
			{ name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
			{ name: 'MetaMask', url: 'https://metamask.io' },
		],
	};
	const injected = injectedModule();
	const walletConnect = walletConnectModule({
		bridge: 'https://bridge.walletconnect.org/',
		qrcodeModalOptions: {
			mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar'],
		},
	});
	const coinbase = coinbaseWallet({ darkMode: true });
	const gnosis = gnosisModule({});
	const ledger = ledgerModule();
	const trezor = trezorModule({
		email: '<EMAIL_CONTACT>',
		appUrl: './',
	});
	const accountCenterDisabled = { enabled: false };
	const Onboard = (await import('@web3-onboard/core')).default;
	const onboard = Onboard({
		accountCenter: {
			desktop: accountCenterDisabled,
			mobile: accountCenterDisabled,
		},
		wallets: [coinbase, injected, walletConnect, ledger, trezor, gnosis],

		chains: blocknativeNetworks.map((net) => {
			const { alias, ...chain } = net;
			return chain;
		}),
		appMetadata: metadata,
		apiKey: import.meta.env.VITE_BLOCKNATIVE_API_KEY as string,
		notify: {
			desktop: {
				enabled: true,
				position: 'bottomRight',
			},
		},
	});
	onboard.state
		.select('wallets')
		.subscribe((wallets) => (skipHandleConnected ? null : handleConnected(wallets)));
	web3Onboard.set(onboard);

	const lastConnectedTo = JSON.parse(localStorage.getItem('connectedWallets') || '[]') as string[];
	if (lastConnectedTo.length) {
		await onboard.connectWallet({
			autoSelect: { label: lastConnectedTo[0], disableModals: true },
		});
	}
}

export function updateBalance() {
	const address = connectedAccount.get();
	if (address) {
		const currentBalance = connectedAccountBalance.get();
		connectedAccountBalance.set(undefined);
		getEthBalance(address)
			.then((balance) => {
				connectedAccountBalance.set(balance);
			})
			.catch((err) => {
				if (err instanceof Error) {
					console.log(`Failed to get balance for ${connectedAccount.get()} due to ${err.message}`);
				}
				connectedAccountBalance.set(currentBalance);
			});
	} else {
		connectedAccountBalance.set(undefined);
	}
}

if (browser) {
	connectedAccount.subscribe((_address) => {
		if (!_address) {
			handleCloudMessage(_address);
			updateBalance();
			return;
		}
		const address = utils.getAddress(_address);
		if (blockedAddresses.includes(address)) {
			console.log(`${address} was found in blocklist`);
			void web3Disconnect();
		} else {
			updateBalance();
		}
		handleCloudMessage(_address);
	});

	readNetwork.subscribe(() => {
		updateBalance();
	});
}

export async function web3Connect() {
	if (browser) {
		const onboard = web3Onboard.get();
		if (!onboard) {
			return console.error('onboard undefined');
		}
		skipHandleConnected = true;
		const wallets = await onboard.connectWallet();
		setTimeout(() => (skipHandleConnected = false), 3000);
		if (!wallets.length) return;
		try {
			handleConnected(wallets);
			await checkAndOpenDocumentModal('tos');
			await authWithWallet(wallets[0].accounts[0].address);
		} catch (error: any) {
			console.error('Error occurred when connecting.', error);
			void web3Disconnect();
		}
	}
}

export function getSupportedNetworks() {
	const onboard = web3Onboard.get();
	if (!onboard) return [];
	return onboard.state.get().chains;
}

export function getProvider(): providers.Web3Provider {
	if (!browser) return;
	if (window.ethereum) {
		return new providers.Web3Provider(window.ethereum);
	}
	return web3Provider.get();
}

export function getBaseProvider(network: string) {
	const selectedNetwork = getDefaultProvider(network);
	const provider = providers.getDefaultProvider(selectedNetwork.rpcUrl);
	return provider;
}

export function alchemyProvider() {
	if (browser) {
		if (window.ethereum) {
			return new providers.Web3Provider(window.ethereum);
		}
		return new providers.AlchemyProvider(
			chainId.get(),
			String(import.meta.env.VITE_ALCHEMY_MAINNET_API_KEY),
		);
	}
}
