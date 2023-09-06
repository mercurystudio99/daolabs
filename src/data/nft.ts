import {
	querySubgraph,
	querySubgraphRaw,
	type EntityKeys,
	type GraphQueryOpts,
	type InfiniteGraphQueryOpts,
	type SubgraphQueryReturnTypes,
	type WhereConfig,
} from '$utils/graph';
import { subscribeCollections } from '$utils/users/user';
import {
	getCollectionPrice,
	getNftContractAddress,
	isCollectionDeployed,
} from '$utils/collectionHelpers';
import type { NftType } from '$models/minter/nft-config';
import type { Collection } from '$models/minter/collection-config';
import type { CollectionSortType } from '$models/collection-visibility';
import type { NftContract, NftToken } from '$models/subgraph-entities/v2/nft-contract';

interface NftTokenOptions {
	pageNumber?: number;
	id?: string;
	ids?: string[];
	contractAddress?: string;
	contractAddresses?: string[];
	orderBy?: 'createdAt' | 'tokenId';
	orderDirection?: 'asc' | 'desc';
	pageSize?: number;
	keys?: (keyof NftToken)[];
}

interface NftContractOptions {
	pageNumber?: number;
	id?: string;
	ids?: string[];
	orderBy?: 'totalSupply' | 'maxSupply';
	orderDirection?: 'asc' | 'desc';
	pageSize?: number;
	keys?: (keyof NftContract)[];
}

const tokenKeys: (keyof NftToken)[] = [
	'id',
	'tokenId',
	'symbol',
	'mintReceiver',
	'createdAt',
	'owner',
	'tokenUri',
	'contractAddress',
];

const contractKeys: (keyof NftContract)[] = [
	'id',
	'type',
	'address',
	'name',
	'symbol',
	'totalSupply',
	'maxSupply',
];

const queryTokenOpts = (
	opts: NftTokenOptions,
): Partial<
	| GraphQueryOpts<'nftToken', EntityKeys<'nftToken'>>
	| InfiniteGraphQueryOpts<'nftToken', EntityKeys<'nftToken'>>
> => {
	const where: WhereConfig<'nftToken'>[] = [];

	if (opts.ids) {
		where.push({
			key: 'id',
			operator: 'in',
			value: opts.ids || [],
		});
	}

	if (opts.id) {
		where.push({
			key: 'id',
			value: opts.id,
		});
	}

	if (opts.contractAddresses) {
		where.push({
			key: 'contractAddress',
			operator: 'in',
			value: opts.contractAddresses || [],
		});
	}

	if (opts.contractAddress) {
		where.push({
			key: 'contractAddress',
			value: opts.contractAddress,
		});
	}

	return {
		entity: 'nftToken',
		keys: opts.keys ?? tokenKeys,
		orderDirection: 'desc',
		orderBy: 'createdAt',
		pageSize: opts.pageSize,
		where,
	};
};

const queryContractOpts = (
	opts: NftContractOptions,
): Partial<
	| GraphQueryOpts<'nftContract', EntityKeys<'nftContract'>>
	| InfiniteGraphQueryOpts<'nftContract', EntityKeys<'nftContract'>>
> => {
	const where: WhereConfig<'nftContract'>[] = [];

	if (opts.ids) {
		where.push({
			key: 'id',
			operator: 'in',
			value: opts.ids || [],
		});
	}

	if (opts.id) {
		where.push({
			key: 'id',
			value: opts.id,
		});
	}

	return {
		entity: 'nftContract',
		first: 20,
		keys: opts.keys ?? contractKeys,
		orderDirection: opts.orderDirection ?? 'desc',
		...(opts.orderBy ? { orderBy: opts.orderBy } : {}),
		pageSize: opts.pageSize,
		where,
	};
};

export async function getRecentMints(opts?: NftTokenOptions) {
	opts =
		opts ??
		({
			keys: [
				'price',
				'contractAddress',
				'tokenId',
				'tokenUri',
				'createdAt',
				'symbol',
				'mintReceiver',
				{ entity: 'contract', keys: ['id', 'name'] },
			],
		} as NftTokenOptions);
	return querySubgraph({
		...(queryTokenOpts(opts ?? {}) as GraphQueryOpts<'nftToken', EntityKeys<'nftToken'>>),
		entity: 'nftToken',
		first: opts.pageSize,
		skip: opts.pageNumber && opts.pageSize ? opts.pageNumber * opts.pageSize : undefined,
	});
}

export async function getNftTokens(opts?: NftTokenOptions) {
	opts = opts ?? {};
	return querySubgraph({
		...(queryTokenOpts(opts) as GraphQueryOpts<'nftToken', EntityKeys<'nftToken'>>),
		entity: 'nftToken',
		keys: tokenKeys,
		skip: opts.pageNumber && opts.pageSize ? opts.pageNumber * opts.pageSize : undefined,
	});
}

export async function getNftTokenFromIds(ids: string[], opts?: NftTokenOptions) {
	opts = opts ?? {};
	return querySubgraph({
		...(queryTokenOpts(opts) as GraphQueryOpts<'nftToken', EntityKeys<'nftToken'>>),
		entity: 'nftToken',
		keys: tokenKeys,
		where: [
			{
				key: 'id',
				value: ids,
				operator: 'in',
			},
		],
	});
}

export async function getNftContracts(opts?: NftContractOptions) {
	opts = opts ?? {};
	return querySubgraph({
		...(queryContractOpts(opts) as GraphQueryOpts<'nftContract', EntityKeys<'nftContract'>>),
		entity: 'nftContract',
		keys: contractKeys,
	});
}

export async function getNftHolders(
	contractAddress: string,
): Promise<SubgraphQueryReturnTypes['nftHolder']> {
	return querySubgraphRaw<'nftHolder'>(
		`{
			nftHolders(where: {tokens_: {contractAddress: "${contractAddress}"}}) {
				id
				address
				tokens(contractAddress: "${contractAddress}") {
					id
					tokenId
				}
			}
  		}`,
	);
}

export async function getCollections(
	opts: {
		filter?: { types: NftType[]; deployed: boolean };
		sort?: CollectionSortType;
	} = {
		filter: { types: [], deployed: true },
		sort: 'volume',
	},
): Promise<(Collection & { volume: number })[]> {
	let unsub: Function;
	const promise = new Promise((resolve, reject) => {
		// @ts-nocheck
		unsub = subscribeCollections(async (collections: (Collection & { nftType?: NftType })[]) => {
			try {
				let filteredCollections = collections;
				if (opts?.filter?.types.length) {
					filteredCollections = filteredCollections.filter((collection) =>
						opts?.filter?.types.includes(collection.nftType),
					);
				}
				if (opts?.filter?.deployed) {
					filteredCollections = filteredCollections.filter((collection) =>
						isCollectionDeployed(collection),
					);
				}
				const aoll = filteredCollections.map(async (collection) => {
					let price = getCollectionPrice(collection);
					if (typeof price !== 'number') {
						price = 0;
					}
					const contractAddress = getNftContractAddress(collection);
					if (contractAddress) {
						const response = await getNftContracts({ id: contractAddress.toLowerCase() });
						const stats = response?.[0];
						// TODO: calculate total earned for an edition; the price returned it the mean, and we have to check each edition supply to know earned
						const totalEarned = (stats?.totalSupply || 0) * Number(price);
						return { volume: totalEarned, ...collection } as Collection & { volume: number };
					}
					return { volume: 0, ...collection } as Collection & { volume: number };
				});
				const result = await Promise.all(aoll);
				let sorted: (Collection & { volume: number })[];
				if (opts?.sort === 'name') {
					sorted = result.sort((a, b) => (b.name > a.name ? -1 : 1)); // sort by name (ascending)
				} else {
					sorted = result.sort((a, b) => b.volume - a.volume); // sort by volume (descending)
				}
				resolve(sorted);
			} catch (error) {
				console.error((<Error>error).message);
				reject(error);
			}
		});
	});
	const result = await promise;
	unsub();
	return result as (Collection & { volume: number })[];
}
