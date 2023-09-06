import type { BlockchainType, NftType } from './nft-config';

export interface Attribute {
	trait_type: string;
	value: string;
	display_type?: string;
}
export interface Level extends Attribute {
	max?: string; // ?
}
export interface Royalty {
	artist_address?: string; // ?
	artist_percentage?: string;
	additional_payee?: string; // ?
	additional_payee_percentage?: string; // ?
}
export interface OpenSea {
	name: string;
	description: string;
	image: string;
	external_link: string;
	seller_fee_basis_points?: number; // ?
	fee_recipient?: string; // ?
}
export interface ProjectConfig {
	name: string;
	metadata_outputs: BlockchainType[];
	project_type: NftType;
	metadata_input: {
		name: string;
		description?: string;
		birthdate?: string; // ?
		background_colors: string[];
		minter?: string; // ?
		creators?: string[]; // ?
		publishers?: string[]; // ?
		genres: string[]; // ?
		tags: string[]; // ?
		drop_date?: string;
		more_info_link?: string;
		animation_url?: string; // temp
		royalties: Royalty[];
		rights?: string; // ?
		decimals?: number; // ?
		generation?: number; // ?
		edition?: number; // ?
		populations: {
			name: string;
			population_size: string;
			description?: string;
			symbol: string;
			attributes?: Attribute[];
			levels?: Level[];
			stats?: Level[];
			boosts?: Attribute[];
			background_color: string;
			native_size?: string;
			path: string;
		}[];
		opensea: OpenSea;
	};
}
