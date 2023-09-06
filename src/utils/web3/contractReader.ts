import { ethers } from 'ethers';
import { connectedAccount, getProvider, readNetwork } from '$stores/web3';

import { parseCachedData, parseContractResponse } from '$utils/cached';

export async function readContractByAddress(
	contractAddress: string,
	ABI: ethers.ContractInterface,
	functionName: string,
	args: Any[] = [],
	cached = false,
): Promise<any> {
	const cache = await caches.open('CONTRACT_RESPONSE');
	const id = btoa(
		JSON.stringify({
			chainId: readNetwork.get().id,
			contractAddress,
			functionName,
			args,
		}),
	);
	if (cached) {
		const response = await cache.match(id);
		if (response) {
			const result = await response.text();
			const jsonResult = JSON.parse(result) as Record<string, string>;
			const data = parseCachedData(jsonResult) as unknown;
			if (typeof data !== 'undefined' && data !== null) {
				return data;
			}
		} else console.log('cache miss');
	}

	const contract = new ethers.Contract(contractAddress, ABI, getProvider());

	if (connectedAccount.get() && getProvider()) {
		const fun = contract[functionName] as (..._args: Any[]) => Any;
		if (typeof fun === 'function') {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const res = (await fun(...args)) as Record<string, string>;
			const response = parseContractResponse(res);
			await cache.put(id, new Response(JSON.stringify(response)));
			return response;
		} else {
			throw Error(`${functionName}() does not exist on contract`);
		}
	}
	const response = await fetch(
		`${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string}/app/web3/readContract`,
		{
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				apikey: import.meta.env.VITE_API_KEY as string,
			},
			body: JSON.stringify({
				chainId: readNetwork.get().id,
				address: contractAddress,
				abi: ABI,
				function: functionName,
				args: args || [],
			}),
		},
	);

	const jsonResponse = (await response.json()) as Record<string, string>;
	await cache.put(id, new Response(JSON.stringify(jsonResponse)));
	return parseCachedData(jsonResponse);
}
