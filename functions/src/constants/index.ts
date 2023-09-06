export const subgraphUrl = {
	mainnet: `https://gateway.thegraph.com/api/${process.env.SUBGRAPH_API_KEY}/subgraphs/id/FVmuv3TndQDNd2BWARV8Y27yuKKukryKXPzvAS5E7htC`,
	goerli: 'https://api.thegraph.com/subgraphs/name/peripheralist/juicebox-dev',
};

export const whitelistedDomains = [
	'https://juicebox.wtf',
	'https://www.juicebox.wtf',
	'https://juicebox-svelte.web.app',
	'https://identity-develop.web.app',
	'https://staging-juicebox.on.fleek.co',
	'https://staging.juicebox.wtf',
	'https://bleeding-edge.juicebox.wtf',
	'https://identity.juicebox.wtf',
	'https://ipfs.juicebox.wtf',
	'https://nft.juicebox.wtf',
	'https://juicebox.fund',
	'https://juicebox.builders',
	'https://juicebox.plus',
	'https://membership-nfts.juicebox.wtf',
	'https://membership.juicebox.wtf',
	'https://tiles.wtf',
	'https://daolabs-nft-tooling.on.fleek.co',
	'https://nft-tooling.web.app',
	'https://animation-url.on.fleek.co',
	'https://dao.move.xyz',
	'https://move.xyz',
	'http://localhost:8080',
	'http://localhost',
	'http://127.0.0.1',
	'http://127.0.0.1:8080',
	'http://localhost:4173',
	'http://127.0.0.1:4173',
];

export const availableContentTypes = [
	'application/json',
	'image/svg+xml',
	'image/jpeg',
	'image/png',
	'multipart/form-data',
];

export const ipfsUrl = 'https://ipfs.io';

export const allTokensUrl = 'https://tokens.coingecko.com/uniswap/all.json';
