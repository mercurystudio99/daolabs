import { NftType } from '$models/minter/nft-config';
import { CollectionType } from '$models/minter/collection-config';
import { getCollectionById, updateCollection } from './users/user';
import { convertFirebaseModel } from './firebaseUtils';
import { tryGetLatestRevenueSplit } from './users/revenueSplitsHelpers';
import type { PinataPinResponse } from 'pinata_ipfs_sdk';
import type {
	SimpleCollection,
	AdvancedCollection,
	Collection,
	ImageCollection,
	MusicCollection,
	VideoCollection,
	P5Collection,
	PfpCollection,
} from '$models/minter/collection-config';

/** Type guards */

export function isSimpleCollection(collection: Collection): collection is SimpleCollection {
	return 'type' in collection && collection.type === CollectionType.SIMPLE;
}

export function isAdvancedCollection(collection: Collection): collection is AdvancedCollection {
	return 'type' in collection && collection.type === CollectionType.ADVANCED;
}

export function isImageCollection(collection: AdvancedCollection): collection is ImageCollection {
	return 'nftType' in collection && collection.nftType === NftType.IMAGE;
}

export function isMusicCollection(collection: AdvancedCollection): collection is MusicCollection {
	return 'nftType' in collection && collection.nftType === NftType.MUSIC;
}

export function isVideoCollection(collection: AdvancedCollection): collection is VideoCollection {
	return 'nftType' in collection && collection.nftType === NftType.VIDEO;
}

export function isP5Collection(collection: AdvancedCollection): collection is P5Collection {
	return 'nftType' in collection && collection.nftType === NftType.P5JS;
}

export function isPfpCollection(collection: AdvancedCollection): collection is PfpCollection {
	return 'nftType' in collection && collection.nftType === NftType.PFP;
}

/** Deployed Helpers */

export function isCollectionDeployed(collection: Collection) {
	/** NOTE: We will at some point handle pricing contract,
	 * 	so we will probably add a status to the collection
	 * */
	return Boolean(collection.contracts?.nft?.address);
}

export function getNftContractAddress(collection: Collection) {
	return collection.contracts?.nft?.address;
}

export function getNftBaseUri(collection: Collection): PinataPinResponse['IpfsHash'] {
	return collection.contracts?.nft?.ipfs?.IpfsHash;
}

/** Pricing helpers */

export function getCollectionPrice(collection: Collection) {
	// TODO: it's not as simple as this, because each edition has it's own pricing...
	if (isSimpleCollection(collection)) {
		// find the mean price of all editions
		const meanPrice =
			collection.editions?.reduce((acc, edition) => acc + Number(edition.price), 0) /
			collection.editions?.length;
		// return 0 if NaN
		if (isNaN(meanPrice)) return 0;
		return meanPrice;
	} else if (isAdvancedCollection(collection)) {
		return collection.pricing
			? collection.pricing.price * (1 + collection.pricing.redemptionRate / 100)
			: '---';
	}
}

export function getCollectionCurrency(collection: Collection) {
	if (isSimpleCollection(collection)) return 'ETH';
	else if (isAdvancedCollection(collection)) return collection.pricing?.currency;
}

/** Total Supply Helpers */
export function getSumNftTotalSupply(collection: AdvancedCollection) {
	if (!collection.nfts?.length) return 0;
	return collection.nfts.reduce((acc, nft) => acc + Number(nft.totalSupply), 0);
}

/**
 * Random helpers
 */
export function getNftIconName(collection: Collection) {
	if (isSimpleCollection(collection)) return 'hexagon';
	else if (isAdvancedCollection(collection)) {
		if (isImageCollection(collection)) return 'imageType';
		else if (isMusicCollection(collection)) return 'musicType';
		else if (isVideoCollection(collection)) return 'videoType';
		else if (isP5Collection(collection)) return 'p5jsType';
		else if (isPfpCollection(collection)) return 'pfpType';
		else return 'hexagon';
	}
}

export function createSymbolForCollection(collection: Collection) {
	return collection.name.replace(/\s/g, '_').slice(0, 6).toUpperCase();
}

export async function loadCollection(id: string) {
	const result = await getCollectionById(id);

	if (!result) return undefined;

	const convertedCollection = convertFirebaseModel(result);
	let needUpdateCollection = false;

	if (convertedCollection?.royalty) {
		const updatedRoyaltySplit = await tryGetLatestRevenueSplit(
			convertedCollection.royalty.creator_address,
			'collectionRoyalty',
		);

		if (updatedRoyaltySplit !== convertedCollection.royalty.creator_address) {
			convertedCollection.royalty.creator_address = updatedRoyaltySplit;
			needUpdateCollection = true;
		}
	}

	if (isAdvancedCollection(convertedCollection) && convertedCollection?.pricing) {
		const updatedPayoutReceivers = await tryGetLatestRevenueSplit(
			convertedCollection.pricing.payoutReceivers,
			'collectionPricing',
		);

		if (updatedPayoutReceivers !== convertedCollection.pricing.payoutReceivers) {
			convertedCollection.pricing.payoutReceivers = updatedPayoutReceivers;
			needUpdateCollection = true;
		}
	}

	if (isSimpleCollection(convertedCollection) && convertedCollection?.payoutAddress) {
		const updatedPayoutReceivers = await tryGetLatestRevenueSplit(
			convertedCollection.payoutAddress,
			'collectionPricing',
		);

		if (updatedPayoutReceivers !== convertedCollection.payoutAddress) {
			convertedCollection.payoutAddress = updatedPayoutReceivers;
			needUpdateCollection = true;
		}
	}

	if (needUpdateCollection) {
		try {
			await updateCollection(convertedCollection);
		} catch (err) {
			// ignore this error will try next time
		}
	}

	return convertedCollection;
}

export async function getCollectionNfts(id: string) {
	const result = await getCollectionById(id);

	if (!result) return undefined;

	const convertedCollection = convertFirebaseModel(result);
	return isAdvancedCollection(convertedCollection) ? convertedCollection.nfts : [];
}
