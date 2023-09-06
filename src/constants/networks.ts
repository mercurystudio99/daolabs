export type NetworkInfo = {
	name: 'mainnet' | 'goerli';
	color: string;
	chainId: number;
	blockExplorer: string;
	rpcUrl: string;
	faucet?: string;
	price?: number;
	gasPrice?: number;
};

export type CurrentNetwork = {
	id: string;
	token: string;
	label: string;
	alias: 'mainnet' | 'goerli';
	rpcUrl: string;
};

export const blocknativeNetworks: CurrentNetwork[] = [
	{
		id: '0x1', // chain ID must be in hexadecimel
		token: 'ETH', // main chain token
		label: 'Ethereum Mainnet',
		alias: 'mainnet',
		rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${String(
			import.meta.env.VITE_ALCHEMY_MAINNET_API_KEY,
		)}`,
	},
	{
		id: '0x5',
		token: 'gETH',
		label: 'Ethereum Goerli Testnet',
		alias: 'goerli',
		rpcUrl: `https://eth-goerli.g.alchemy.com/v2/${String(
			import.meta.env.VITE_ALCHEMY_GOERLI_API_KEY,
		)}`,
	},
];

export const NETWORKS_BY_ALIAS = Object.values(blocknativeNetworks).reduce(
	(acc, curr) => ({
		...acc,
		[curr.alias]: curr,
	}),
	{} as Record<'goerli' | 'mainnet', NetworkInfo>,
);
