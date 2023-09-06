/* eslint-disable */
import type {
	TokenWithMarketsSummaryConnection,
	Token,
} from '@zoralabs/zdk/dist/queries/queries-sdk';
import type { Collection } from './types';

type KeyedByCollectionAddress = Record<string, Token[]>;

export function keyNftsByCollection(tokens: any, preGrouped: KeyedByCollectionAddress = {}) {
	const groupedByCollection = tokens.ownedNfts?.reduce((acc, item) => {
		const collectionAddress = item.contract.address;
		if (!acc[collectionAddress]) {
			acc[collectionAddress] = [item];
		} else {
			acc[collectionAddress].push(item);
		}
		return acc;
	}, preGrouped);
	return groupedByCollection;
}

export function groupByCollection(tokens, preGrouped: Collection[] = []) {
					
	// reverse pregrouped structure to be keyed by collection address
	const preGroupedByKey = preGrouped.reduce((acc, item: Collection) => {
		acc[item.collectionAddress] = item.nfts;
		return acc;
	}, {} as KeyedByCollectionAddress);

	// Creates a list of collections with a list of tokens
	const groupedByCollection = keyNftsByCollection(tokens, preGroupedByKey);

	const collections = Object.keys(groupedByCollection)
		.map((collectionAddress) => {
			const grouped = {
				...groupedByCollection[collectionAddress][0],
				nfts: groupedByCollection[collectionAddress],
			};

			if (grouped?.contractMetadata && grouped?.contractMetadata?.name) {
				return grouped;
			}
		})
		.filter((collection) => collection);
	return collections;
}
