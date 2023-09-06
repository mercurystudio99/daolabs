import { isAddress } from 'ethers/lib/utils';
import { NetworkName } from '$models/network-name';
import { isRevenueSplit, type RevenueSplit } from '$models/user/revenue-splits';
import { TokenStandard } from './token-standard';
import type {
	NftType,
	NftConfig,
	ImageNftConfig,
	VideoNftConfig,
	MusicNftConfig,
	P5NftConfig,
	PfpNftConfig,
	EditionConfig,
} from '$models/minter/nft-config';
import type { CurrencyName } from '$constants/currency';
import type { PinataPinResponse } from 'pinata_ipfs_sdk';

export enum CollectionStatus {
	UNFINISHED,
	SAVED,
}

export enum RevealType {
	DATE,
	BLOCK,
}

export enum CollectionType {
	SIMPLE,
	ADVANCED,
	GENERATIVE,
}

export interface Royalty {
	creator_address: string | RevenueSplit;
	royalty: number;
}

export function getRoyaltyAddresses(item: Royalty): string[] {
	if (!item) return [];

	if (isRevenueSplit(item.creator_address)) {
		return item.creator_address.recipients.map((r) =>
			isAddress(r.address) ? r.address : r.displayName,
		);
	} else {
		return [item.creator_address];
	}
}

export interface Contract {
	name: string;
	address: string;
	creator: string;
	standard?: TokenStandard;
	ipfs?: PinataPinResponse; // i.e. the baseURI
}

export interface Contracts {
	pricing?: Contract;
	nft?: Contract;
}

export type Reveal = {
	preRevealImage?: string;
	revealType?: RevealType;
	revealValue?: string;
};

export type Collection = {
	id: string;
	firebaseId?: string;
	network: string;
	type?: CollectionType;
	standard?: TokenStandard;

	banner: string;
	defaultImage?: string;
	logo?: string;

	creator: string;
	description: string;
	name: string;
	symbol: string;

	/**
	 * how does having a start/end date for a collection differ from having a start/end date for pricing?
	 * right now, we don't use the pricing contracts at all... but may be good to think about when we do
	 * */
	mintStart: number;
	mintEnd: number;

	/**
	 * I would have thought airdrops is a potentially recurring thing, or is this something
	 * set on creation and never changed?
	 */
	airdrops?: string;
	contracts?: Contracts;
	ipfsMetadata?: PinataPinResponse;
	royalty?: Royalty;
};

export type SimpleCollection = Collection & {
	file: string;
	payoutAddress: string | RevenueSplit;
	price: number;
	totalSupply: number;
	editions?: EditionConfig[];
};

export type AdvancedCollection = Collection & {
	category?: string;
	defaultColors?: string[];
	/**
	 * We need to know what the externalLink is specifically, atm assuming first in links array
	 * should links be an array of objects with a label and a link? or maybe just use util getLinkIconProps
	 * and if globe returned it's externalLink
	 */
	links: string[];
	nftType?: NftType;
	nfts?: NftConfig[];
	pricing?: CollectionPricing;
	/**
	 * I've forgotten how we do randomize, something about pinning out of order...
	 * so not in the order shown in in the simulation
	 */
	randomize?: boolean;
	/**
	 * I guess - when adding reveal, we need to pin all the assets and pass it to a contract,
	 * as well as the pre_reveal_image CID...
	 * TODO: handle the prereveal image if reveal is set
	 * */
	reveal?: Reveal;
};

// NOTE: I can't seem to achieve what I want with a type so it's an interface
// tried; type P5Collection = AdvancedCollection & { nfts: P5NftConfig[] };
export interface ImageCollection extends AdvancedCollection {
	nfts: ImageNftConfig[];
}

export interface MusicCollection extends AdvancedCollection {
	nfts: MusicNftConfig[];
}

export interface PfpCollection extends AdvancedCollection {
	nfts: PfpNftConfig[];
}

export interface VideoCollection extends AdvancedCollection {
	nfts: VideoNftConfig[];
}

export interface P5Collection extends AdvancedCollection {
	nfts: P5NftConfig[];
}

export const initialCollectionConfig: Collection = {
	id: '',
	banner: '',
	creator: '',
	defaultImage: '',
	description: '',
	logo: '',
	name: '',
	network: NetworkName.mainnet,
	mintStart: 0,
	mintEnd: 0,
	symbol: '',
	standard: TokenStandard.ERC721,
	contracts: {
		// NOTE: must be null here, else firebase will throw error
		// TODO: I know we do something hacky for contracts somewhere in advanced collection.
		pricing: null,
		nft: null,
	},
};

export const initialSimpleCollectionConfig: SimpleCollection = {
	...initialCollectionConfig,
	editions: [],
	file: '',
	payoutAddress: '',
	price: 0,
	totalSupply: 1,
	type: CollectionType.SIMPLE,
};

export const initialAdvancedCollectionConfig: AdvancedCollection = {
	...initialCollectionConfig,
	category: '',
	defaultColors: [],
	links: [],
	randomize: false,
	type: CollectionType.ADVANCED,
};

export const initialRevealConfig: Reveal = {
	revealType: RevealType.DATE,
	revealValue: '',
	preRevealImage: '',
};

export interface PayoutReceiver {
	label?: string;
	address: string;
	percent: number;
	lockedUntil: number;
}

export function isPayoutReceiver(item: PayoutReceiver | RevenueSplit): item is PayoutReceiver {
	// TODO: temporary fix for legacy receiver, remove at later date
	if (
		Array.isArray(item) &&
		item.length === 1 &&
		typeof item[0] === 'object' &&
		'lockedUntil' in item[0]
	) {
		return true;
	}

	return item && 'lockedUntil' in item;
}

export function isJbProjectPayoutReceiver(item: PayoutReceiver): boolean {
	return typeof item.address === 'number';
}

export interface CollectionPricing {
	price: number;
	currency: CurrencyName;
	payoutReceivers: PayoutReceiver | RevenueSplit;
	redemptionRate: number;
	method?: 'fixed' | 'highest' | 'declining';
	service?: string;
	startingDate?: string;
	endingDate?: string;
	startingTime?: string;
	endingTime?: string;
	duration?: string;
	reservePrice?: number;
	buyer?: string;
	includeBuyer?: boolean;
	includeReserve?: boolean;
}

export const initialCollectionPricing: CollectionPricing = {
	price: 0.01,
	currency: 'ETH' as CurrencyName,
	payoutReceivers: null,
	redemptionRate: 100,
	service: 'juicebox',
	startingDate: null,
	endingDate: null,
	startingTime: null,
	endingTime: null,
	duration: null,
	reservePrice: 0,
	method: 'fixed',
	buyer: null,
	includeBuyer: false,
	includeReserve: false,
};

export const initialCollectionContract: Contract = {
	name: '',
	address: '',
	creator: '',
	standard: TokenStandard.ERC721,
	ipfs: undefined,
};

export const initialCollectionContracts: Contracts = {
	pricing: initialCollectionContract,
	nft: initialCollectionContract,
};
