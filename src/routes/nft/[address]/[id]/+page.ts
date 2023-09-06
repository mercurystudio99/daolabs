import { utils } from 'ethers';
import { error } from '@sveltejs/kit';
import { getNftMetadata } from '$services/nft/getNftMetadata';
import { browser } from '$app/environment';

export async function load({
	params,
	fetch,
}: {
	params: { address: string; id: string };
	fetch: Window['fetch'];
}) {
	if (!browser) return {};
	const { address, id } = params;
	if (!utils.isAddress(String(address))) {
		throw error(404, 'page not found') as unknown as Error;
	}
	const nftMetadata = await getNftMetadata(
		JSON.stringify({
			queryMethod: 'token',
			tokenAddress: address,
			tokenId: id,
		}),
		fetch,
	);
	return {
		nftMetadata,
	};
}

export const prerender = 'auto';
