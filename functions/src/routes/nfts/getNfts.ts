import { fetch } from 'undici';

import type { Response, Request } from 'express';

interface AlchemyNFTReponse {
	ownedNfts: {
		contract: {
			address: string;
		};
		id: {
			id: string;
			tokenMetadata: {
				tokenType: string;
			};
		};
		balance: string;
		title: string;
		description: string;
		tokenUri: {
			raw: string;
			gateway: string;
		};
		media: {
			raw: string;
			gateway: string;
			thumbnail: string;
			format: string;
			bytes: number;
		}[];
		metadata: {
			date: number;
			iamge: string;
			dna: string;
			name: string;
			description: string;
			edition: number;
			attributes: {
				value: string;
				trait_type: string;
			}[];
			compiler: string;
		};
		timeLastUpdated: string;
		contractMetadata: {
			name: string;
			symbol: string;
			totalSupply: string;
			tokenType: string;
			openSea: {
				floorPrice: number;
				collectionName: string;
				safelistRequestStatus: string;
				imageUrl: string;
				description: string;
				externalUrl: string;
				lastIngestedAt: string;
			};
		};
	}[];
	pageKey: string;
	totalCount: number;
	blockHash: string;
}

async function getNftsByAlchemy(owner: string, pageKey?: string): Promise<AlchemyNFTReponse> {
	const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${
		process.env.ALCHEMY_API_KEY
	}/getNFTs?owner=${owner}${pageKey ? '&pageKey=' + pageKey : ''}`;
	const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
	const json = (await response.json()) as AlchemyNFTReponse;
	return json;
}

export async function getNfts(request: Request, response: Response) {
	const { owner, pageKey } = request.query;
	const data = await getNftsByAlchemy(String(owner), String(pageKey));
	response.json(data);
}
