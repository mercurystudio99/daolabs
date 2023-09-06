export const fetchPrice = () => {
	return fetch(
		'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true',
	).then((res) => res.json());
};

export const getFloorPrice = (contractAddress: string) => {
	const headers = new Headers();
	headers.append('apikey', String(import.meta.env.VITE_API_KEY));
	return fetch(
		`${String(
			import.meta.env.VITE_FIREBASE_FUNCTIONS_URL,
		)}/app/alchemy/getFloorPrice?contractAddress=${contractAddress}`,
		{
			headers,
		},
	).then((res) => res.json());
};

export const getAssetTransfers = (toAddress?: string, fromAddress?: string, pageKey?: string) => {
	const headers = new Headers();
	headers.append('apikey', String(import.meta.env.VITE_API_KEY));
	return fetch(
		`${String(import.meta.env.VITE_FIREBASE_FUNCTIONS_URL)}/app/alchemy/getAssetTransfers?${
			toAddress ? 'toAddress' : 'fromAddress'
		}=${toAddress ? toAddress : fromAddress}${pageKey ? '&pageKey=' + pageKey : ''}`,
		{
			headers,
		},
	).then((res) => res.json());
};

export const zoraGetNfts = (body: string) => {
	const headers = new Headers();
	headers.append('apikey', String(import.meta.env.VITE_API_KEY));
	return fetch(`${String(import.meta.env.VITE_FIREBASE_FUNCTIONS_URL)}/app/zora/graphQl`, {
		headers,
		method: 'POST',
		body,
	}).then((res) => res.json());
};

export const fetchNfts = (owner: string, pageKey?: string) => {
	const headers = new Headers();
	headers.append('apikey', String(import.meta.env.VITE_API_KEY));
	return fetch(
		`${String(import.meta.env.VITE_FIREBASE_FUNCTIONS_URL)}/app/nfts/getNfts?owner=${owner}${
			pageKey ? '&pageKey=' + pageKey : ''
		}`,
		{
			headers,
		},
	).then((res) => res.json());
};

export const getBalance = (address: string, block?: string) => {
	const headers = new Headers();
	headers.append('apikey', String(import.meta.env.VITE_API_KEY));
	return fetch(
		`${String(
			import.meta.env.VITE_FIREBASE_FUNCTIONS_URL,
		)}/app/alchemy/getBalance?address=${address}${block ? '&blockNumber=' + block : ''}`,
		{
			headers,
		},
	).then((res) => res.json());
};
