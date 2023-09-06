// Helper class to wrap OpenSea API calls
export class OpenSea {
	private static readonly API_URL = 'https://api.opensea.io/api/v1';

	static async getAssetsForOwner(contractAddress: string, ownerAddress: string): Promise<any> {
		const url = `${this.API_URL}/assets?owner=${ownerAddress}&asset_contract_address=${contractAddress}&order_direction=desc&offset=0&limit=20`;
		const response = await fetch(url);
		const json = (await response.json()) as { assets: unknown };
		return json.assets;
	}

	static async getContractInfo(contractAddress: string): Promise<any> {
		const url = `${this.API_URL}/asset_contract/${contractAddress}`;
		const response: Response = await fetch(url);
		const json = (await response.json()) as OpenSeaAssetContract;
		return json;
	}

	static async getCollectionStats(collectionSlug: string): Promise<any> {
		/**
		 * Note that we need to get the slug from the contract address with getContractInfo.
		 */
		const url = `${this.API_URL}/collection/${collectionSlug}/stats`;
		const response = await fetch(url);
		const json = (await response.json()) as object;
		return json;
	}
}

/**
 * The basis point values of each type of fee
 */
interface OpenSeaFees {
	// Fee for OpenSea levied on sellers
	opensea_seller_fee_basis_points: number;
	// Fee for OpenSea levied on buyers
	opensea_buyer_fee_basis_points: number;
	// Fee for the collection owner levied on sellers
	dev_seller_fee_basis_points: number;
	// Fee for the collection owner levied on buyers
	dev_buyer_fee_basis_points: number;
}

/**
 * Types of asset contracts
 * Given by the asset_contract_type in the OpenSea API
 */
export enum AssetContractType {
	Fungible = 'fungible',
	SemiFungible = 'semi-fungible',
	NonFungible = 'non-fungible',
	Unknown = 'unknown',
}

// Wyvern Schemas (see https://github.com/ProjectOpenSea/wyvern-schemas)
export enum WyvernSchemaName {
	ERC20 = 'ERC20',
	ERC721 = 'ERC721',
	ERC721v3 = 'ERC721v3',
	ERC1155 = 'ERC1155',
	LegacyEnjin = 'Enjin',
	ENSShortNameAuction = 'ENSShortNameAuction',
	// CryptoPunks = 'CryptoPunks'
}

/**
 * Full annotated Fungible Token spec with OpenSea metadata
 */
export interface OpenSeaFungibleToken {
	image_url?: string;
	eth_price?: string;
	usd_price?: string;
}

interface NumericalTraitStats {
	min: number;
	max: number;
}

interface StringTraitStats {
	[key: string]: number;
}

export interface OpenSeaTraitStats {
	[traitName: string]: NumericalTraitStats | StringTraitStats;
}

// Collection fees mapping recipient address to basis points
export interface Fees {
	opensea_fees: Map<string, number>;
	seller_fees: Map<string, number>;
}

/**
 * Annotated collection with OpenSea metadata
 */
export interface OpenSeaCollection extends OpenSeaFees {
	// Name of the collection
	name: string;
	// Slug, used in URL
	slug: string;
	// Accounts allowed to edit this collection
	editors: string[];
	// Whether this collection is hidden from the homepage
	hidden: boolean;
	// Whether this collection is featured
	featured: boolean;
	// Date collection was created
	created_date: Date;

	// Description of the collection
	description: string;
	// Image for the collection
	image_url: string;
	// Image for the collection, large
	large_image_url: string;
	// Image for the collection when featured
	featured_image_url: string;
	// Object with stats about the collection
	stats: object;
	// Data about displaying cards
	display_data: object;
	// Tokens allowed for this collection
	payment_tokens: OpenSeaFungibleToken[];
	// Address for dev fee payouts
	payout_address?: string;
	// Array of trait types for the collection
	trait_stats: OpenSeaTraitStats;
	// Link to the collection's main website
	external_link?: string;
	// Link to the collection's wiki, if available
	wiki_link?: string;
	// Map of collection fees holding OpenSea and seller fees
	fees?: Fees | null;

	instagram_username?: string;
	twitter_username?: string;
	medium_username?: string;
	discord_url?: string;
	telegram_url?: string;
}

/**
 * Annotated asset contract with OpenSea metadata
 */
export interface OpenSeaAssetContract extends OpenSeaFees {
	collection: OpenSeaCollection;

	// Name of the asset's contract
	name: string;
	// Address of this contract
	address: string;
	// Type of token (fungible/NFT)
	type: AssetContractType;
	// Wyvern Schema Name for this contract
	schema_name: WyvernSchemaName;

	// Total fee levied on sellers by this contract, in basis points
	seller_fee_basis_points: number;
	// Total fee levied on buyers by this contract, in basis points
	buyer_fee_basis_points: number;

	// Description of the contract
	description: string;
	// Contract's Etherscan / OpenSea symbol
	token_symbol: string;
	// Image for the contract
	image_url: string;
	// Object with stats about the contract
	stats?: object;
	// Array of trait types for the contract
	traits?: object[];
	// Link to the contract's main website
	external_link?: string;
	// Link to the contract's wiki, if available
	wiki_link?: string;
}
