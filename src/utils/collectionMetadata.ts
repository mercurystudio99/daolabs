import {
	type P5NftConfig,
	BoostType,
	PlaybackType,
	type BasicNftConfig,
} from '$models/minter/nft-config';
import { isRevenueSplit } from '$models/user/revenue-splits';
import { getPreviewUrlForTokenId, getRandomGeneratorForPopulation } from './p5js';
import { cidFromUrl } from './ipfs';
import { getPFPLayerings, type ShuffledNft } from './pfp';
import {
	isImageCollection,
	isMusicCollection,
	isVideoCollection,
	isP5Collection,
	isPfpCollection,
	isSimpleCollection,
} from './collectionHelpers';
import type {
	AdvancedCollection,
	Collection,
	ImageCollection,
	MusicCollection,
	P5Collection,
	PfpCollection,
	SimpleCollection,
	VideoCollection,
} from '$models/minter/collection-config';
import type { Attribute } from '$models/minter/project-config';

export type OpenseaMetadata = {
	name: string;
	attributes?: Attribute[];
	description: string;
	external_url: string;
	animation_url: string;
	background_color: string;
	image: string;
};

function getAttributesFromConfig(nft: BasicNftConfig): Attribute[] {
	const attributes = nft.attributes?.properties?.map((attr) => ({
		trait_type: attr.name,
		value: attr.value,
	}));
	const levels = nft.attributes?.levels?.map((attr) => ({
		trait_type: attr.name,
		value: attr.value,
	}));
	const stats = nft.attributes?.stats?.map((attr) => ({
		display_type: 'number',
		trait_type: attr.name,
		value: attr.value,
	}));
	const boosts = nft.attributes?.boosts?.map((attr) => ({
		display_type: attr.type === BoostType.number ? 'boost_number' : 'boost_percentage',
		trait_type: attr.name,
		value: attr.value,
	}));

	return [...(attributes || []), ...(levels || []), ...(stats || []), ...(boosts || [])];
}

function parseOutputResolution(outputResolution: string) {
	if (!outputResolution || !outputResolution.includes('x')) return {};
	const [width, height] = outputResolution.split('x');
	return {
		width: parseInt(width),
		height: parseInt(height),
	};
}

export function getOpenseaMetadataJson(collection: AdvancedCollection) {
	const values = {
		name: collection.name,
		description: collection.description,
		image: collection.logo,
		// TODO external link extract from links, don't assume first.
		external_link: collection.links ? collection.links[0] : '',
		seller_fee_basis_points: 0,
		fee_recipient: '',
	};

	if (collection.royalty?.creator_address) {
		values.seller_fee_basis_points = collection.royalty.royalty * 100;
		values.fee_recipient = isRevenueSplit(collection.royalty.creator_address)
			? collection.royalty.creator_address.address
			: collection.royalty.creator_address;
	}

	return JSON.stringify(values, null, 2);
}

export function pickRandomItem<T>(items: T[]) {
	return items[Math.floor(Math.random() * items.length)];
}

export function getCommonPfpMetadataJson(collection: PfpCollection, nftIndex: number) {
	/**
	 * For PFP NFTs, we need to generate a metadata.json file that contains the
	 * nft name, collection description, etc. These value are shared across all
	 * in nft and effectively the only thing that changes is the image and id.
	 */
	const nft = collection.nfts[nftIndex];
	const values = {
		name: nft.name,
		description: nft.description,
		external_url: nft.externalLink,
		// TODO fill in animation url, maybe assume card for the moment? As we don't have a UI for this yet.
		animation_url: '',
		background_color: pickRandomItem(nft.defaultColors || collection.defaultColors || []),
		image: '',
	};
	return values;
}

export function getPfpTokenIdMetadataJson(
	collection: PfpCollection,
	nftIndex: number,
	tokenIndex: number,
	characters: ShuffledNft[] = [],
) {
	const commonMetadata = getCommonPfpMetadataJson(collection, nftIndex);
	const nft = collection.nfts[nftIndex];
	let attributes = [];

	if (characters.length) {
		const character = characters[tokenIndex];
		attributes = Object.keys(character).map((key) => {
			return {
				trait_type: key,
				value: String(character[key].name),
			};
		});
	}
	// TODO: should this be ipfsCidUrl...? I feel like no?
	// const image = ipfsCidUrl(`${String(nft.ipfs.IpfsHash)}/${tokenIndex}`);
	const image = `ipfs://${String(nft.ipfs.IpfsHash)}/${tokenIndex}`;
	const name = `${nft.name} #${tokenIndex + 1}`.trim();
	return { ...commonMetadata, attributes, image, name };
}

export function getPfpMetadaFiles(collection: PfpCollection) {
	const files: File[] = [];
	let tokenId = 1;
	collection.nfts.forEach((nft, nftIndex) => {
		const characters = getPFPLayerings(collection, nftIndex);
		for (let i = 0; i < Number(nft.totalSupply); i++) {
			const tokenIdMetadata = getPfpTokenIdMetadataJson(collection, nftIndex, i, characters);
			const tokenIdMetadataJson = JSON.stringify(tokenIdMetadata, null, 2);
			// Create a file with the tokenId as the name, and the metadata as the content.
			const file = new File([tokenIdMetadataJson], `${tokenId}`, {
				type: 'application/json',
			});
			files.push(file);
			tokenId++;
		}
	});
	return files;
}

export function getImageTokenIdMetadataJson(
	collection: ImageCollection,
	nftIndex: number,
	tokenIndex: number,
) {
	const nft = collection.nfts[nftIndex];

	const name = `${nft.name || collection.name} #${tokenIndex + 1}`;

	const attributes = getAttributesFromConfig(nft);
	return {
		name,
		attributes,
		description: nft.description,
		animation_url: '',
		external_url: nft.externalLink,
		background_color: nft.defaultColor || pickRandomItem(collection.defaultColors || []),
		image: nft.file,
	};
}

export function getSimpleMetadaFiles(collection: SimpleCollection) {
	const files: File[] = [];
	for (let i = 0; i < collection.editions.length; i++) {
		const edition = collection.editions[i];
		const metadata = {
			name: edition.name || `${collection.name} #${i + 1}`,
			description: edition.description || collection.description,
			external_url: edition.externalLink,
			image: edition.file,
			attributes: getAttributesFromConfig(edition),
		};
		const metadataJson = JSON.stringify(metadata, null, 2);
		const file = new File([metadataJson], String(i), {
			type: 'application/json',
		});
		files.push(file);
	}
	return files;
}

export function getImageMetadaFiles(collection: ImageCollection) {
	const files: File[] = [];
	const nfts = collection.nfts;
	let currentTokenId = 1;
	nfts.forEach((nft, nftIndex) => {
		for (let i = 0; i < nft.totalSupply; i++) {
			const tokenIdMetadata = getImageTokenIdMetadataJson(collection, nftIndex, currentTokenId - 1);
			const tokenIdMetadataJson = JSON.stringify(tokenIdMetadata, null, 2);
			const file = new File([tokenIdMetadataJson], `${currentTokenId}`, {
				type: 'application/json',
			});
			currentTokenId += 1;
			files.push(file);
		}
	});
	return files;
}

export function getMusicTokenIdMetadataJson(
	collection: MusicCollection,
	nftIndex: number,
	tokenIndex: number,
) {
	const nft = collection.nfts[nftIndex];

	// TODO: potentially do tracks as attributes, maybe ask user
	const attributes = getAttributesFromConfig(nft);

	let animationUrl = '';
	if (nft.ipfs) {
		const baseUrl = (import.meta.env.VITE_ANIMATION_URL ||
			'https://animation-url.on.fleek.co') as string;
		animationUrl = `${baseUrl}/music?cid=${nft.ipfs.IpfsHash}`;
	}
	return {
		name: `${nft.name || collection.name} #${tokenIndex + 1}`,
		description: nft.description,
		attributes,
		animation_url: animationUrl,
		external_url: nft.externalLink,
		background_color: nft.defaultColor || pickRandomItem(collection.defaultColors || []),
		image: nft.albums[0].cover,
	};
}

export function getMusicMetadaFiles(collection: MusicCollection) {
	const files: File[] = [];
	let currentTokenId = 1;
	const nfts = collection.nfts;
	nfts.forEach((nft, nftIndex) => {
		for (let i = 0; i < nft.totalSupply; i++) {
			const tokenIdMetadata = getMusicTokenIdMetadataJson(collection, nftIndex, currentTokenId - 1);
			const tokenIdMetadataJson = JSON.stringify(tokenIdMetadata, null, 2);
			const file = new File([tokenIdMetadataJson], `${currentTokenId}`, {
				type: 'application/json',
			});
			currentTokenId += 1;
			files.push(file);
		}
	});

	return files;
}

export function getVideoTokenIdMetadataJson(
	collection: VideoCollection,
	nftIndex: number,
	tokenIndex: number,
) {
	const nft = collection.nfts[nftIndex];
	let animationUrl = '';
	const backgroundColor = nft.defaultColor || pickRandomItem(collection.defaultColors || []);

	if (nft.file) {
		const baseUrl = (import.meta.env.VITE_ANIMATION_URL ||
			'https://animation-url.on.fleek.co') as string;

		const { width, height } = parseOutputResolution(nft.outputResolution);
		const defaultConfig = {
			width: width || undefined,
			height: height || undefined,
			loop: nft.playback.type === PlaybackType.REPEAT,
			times: nft.playback.type === PlaybackType.TIMES ? nft.playback.value : undefined,
			playerBgColor: backgroundColor,
		};

		const configParam = window.btoa(JSON.stringify(defaultConfig));
		animationUrl = `${baseUrl}/video?video=${nft.file}&config=${configParam}`;
	}
	const attributes = getAttributesFromConfig(nft);
	return {
		name: `${nft.name || collection.name} #${tokenIndex + 1}`,
		attributes,
		description: nft.description,
		animation_url: animationUrl,
		external_url: nft.externalLink,
		background_color: backgroundColor,
		image: nft.cover,
	};
}

export function getVideoMetadaFiles(collection: VideoCollection) {
	const files: File[] = [];
	let currentTokenId = 1;
	const nfts = collection.nfts;
	nfts.forEach((nft, nftIndex) => {
		for (let i = 0; i < nft.totalSupply; i++) {
			const tokenIdMetadata = getVideoTokenIdMetadataJson(collection, nftIndex, currentTokenId - 1);
			const tokenIdMetadataJson = JSON.stringify(tokenIdMetadata, null, 2);
			const file = new File([tokenIdMetadataJson], `${currentTokenId}`, {
				type: 'application/json',
			});
			currentTokenId += 1;
			files.push(file);
		}
	});

	return files;
}

export function getP5jsTokenIdMetadataJson(
	collection: P5Collection,
	nftIndex: number,
	tokenIndex: number,
	seed?: number,
) {
	const nft = collection.nfts[nftIndex];
	const backgroundColor = nft.defaultColor || pickRandomItem(collection.defaultColors || []);

	let name = `${nft.name}`;
	if (nft.totalSupply > 1) {
		name += ` #${tokenIndex + 1}`;
	}

	let animationUrl = '';
	if (nft.script) {
		const { width, height } = parseOutputResolution(nft.outputResolution);
		const defaultConfig = {
			seed,
			fullscreen: !(width && height),
			width: width ? `${width}px` : undefined,
			height: height ? `${height}px` : undefined,
			respectAspectRatio: true,
			background: backgroundColor,
		};
		const configParam = window.btoa(JSON.stringify(defaultConfig));
		const scriptCID = cidFromUrl(nft.script);
		const baseUrl = (import.meta.env.VITE_ANIMATION_URL ||
			'https://animation-url.on.fleek.co') as string;
		animationUrl = `${baseUrl}/p5js?script=${scriptCID}&config=${configParam}`;
	}
	const attributes = getAttributesFromConfig(nft);

	return {
		name,
		attributes,
		description: nft.description,
		animation_url: animationUrl,
		external_url: nft.externalLink,
		background_color: backgroundColor,
		image: getPreviewUrlForTokenId(nft, tokenIndex + 1),
	};
}

export function getP5jsMetadaFiles(collection: P5Collection) {
	const files: File[] = [];
	let tokenId = 1;
	const nfts = collection.nfts;
	nfts.forEach((_, nftIndex) => {
		const nft = collection.nfts[nftIndex] as unknown as P5NftConfig;
		const rand = getRandomGeneratorForPopulation(nft);
		for (let i = 0; i < nft.totalSupply; i++) {
			const seed = rand();
			const tokenIdMetadata = getP5jsTokenIdMetadataJson(collection, nftIndex, i, seed);
			const tokenIdMetadataJson = JSON.stringify(tokenIdMetadata, null, 2);
			const file = new File([tokenIdMetadataJson], `${tokenId}`, {
				type: 'application/json',
			});
			files.push(file);
			tokenId++;
		}
	});

	return files;
}

export function getNftMetadataFiles(collection: Collection) {
	if (isSimpleCollection(collection)) {
		return getSimpleMetadaFiles(collection);
	}
	const advancedCollection = collection as AdvancedCollection;
	if (!advancedCollection.nfts || advancedCollection.nfts.length === 0) return;

	if (isImageCollection(advancedCollection)) {
		return getImageMetadaFiles(advancedCollection);
	} else if (isPfpCollection(advancedCollection)) {
		return getPfpMetadaFiles(advancedCollection);
	} else if (isMusicCollection(advancedCollection)) {
		return getMusicMetadaFiles(advancedCollection);
	} else if (isVideoCollection(advancedCollection)) {
		return getVideoMetadaFiles(advancedCollection);
	} else if (isP5Collection(advancedCollection)) {
		return getP5jsMetadaFiles(advancedCollection);
	}
}
