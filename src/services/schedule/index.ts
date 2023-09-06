import { get } from 'svelte/store';
import { readNetwork } from '$stores/web3';
import { getNftContractAddress } from '$utils/collectionHelpers';
import { contracts } from '$utils/web3/contractMap';
import type { AdvancedCollection } from '$models/minter/collection-config';

export async function scheduleRevealForCollection(collection: AdvancedCollection) {
	const { reveal } = collection;
	const baseUri = `ipfs://${collection.contracts.nft.ipfs.IpfsHash}`;
	const contractAddress = getNftContractAddress(collection);
	const { abi } = await contracts.daolabs[get(readNetwork).alias].NFToken();
	const parsedAbi: any[] = typeof abi === 'string' ? (JSON.parse(abi) as any[]) : (abi as any[]);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const setBaseURIAbi = parsedAbi.find(
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(item) => item.type === 'function' && item.name === 'setBaseURI',
	);

	if (!setBaseURIAbi) {
		throw new Error('setBaseURI function ABI not found');
	}

	const revealDate = new Date(reveal.revealValue);

	const requestOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			apikey: import.meta.env.VITE_API_KEY as string,
		},
		body: JSON.stringify({
			chainId: Number(get(readNetwork).id),
			address: contractAddress,
			abi: [setBaseURIAbi],
			function: 'setBaseURI',
			args: [baseUri, true],
			date: revealDate,
		}),
	};

	try {
		const response = await fetch(
			`${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string}/app/web3/scheduleWriteContract`,
			requestOptions,
		);

		if (response.ok) {
			console.log('Function scheduled successfully');
			return await Promise.resolve('Function scheduled successfully');
		} else {
			console.error(`Error scheduling function: ${response.status} ${response.statusText}`);
			return await Promise.reject(
				`Error scheduling function: ${response.status} ${response.statusText}`,
			);
		}
	} catch (error) {
		console.error('Error scheduling function:', error);
		return Promise.reject(error);
	}
}
