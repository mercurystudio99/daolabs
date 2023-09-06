import axios from 'axios';
import { ipfsCidToWorkerUrl } from '$utils/ipfs';
import type { IPFSNftRewardTier, NftCollectionMetadata } from '$models/nftRewardTier';

export async function getNftRewardTierMetadata(cid: string) {
	if (!cid) {
		console.error('No tier cid provided');
		return;
	}
	const url = ipfsCidToWorkerUrl(cid);
	const response = await axios.get(url, {
		headers: {
			apikey: import.meta.env.VITE_API_KEY as string,
		},
	});
	return response.data as IPFSNftRewardTier;
}

export async function getNftRewardCollectionMetadata(cid: string) {
	if (!cid) {
		console.error('No tier cid provided');
		return;
	}
	const url = ipfsCidToWorkerUrl(cid);
	const response = await axios.get(url, {
		headers: {
			apikey: import.meta.env.VITE_API_KEY as string,
		},
	});
	return response.data as NftCollectionMetadata;
}
