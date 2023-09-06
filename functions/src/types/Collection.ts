import { NftConfig } from './NftConfig';

enum CollectionType {
	SIMPLE,
	ADVANCED,
	GENERATIVE,
}

export type Collection = {
	id: string;
	contractAddress?: string;
	banner: string;
	creator: string;
	description: string;
	file: string;
	name: string;
	network: string;
	payoutAddress: string;
	price: any;
	start: number;
	end: number;
	supply: number;
	symbol: string;
	firebaseId?: string;
	airdrops?: string;
	logo?: string;
	links: string[];
	type?: CollectionType;
	nfts?: NftConfig[];
	default_colors?: string[];
	default_image?: string;
	randomize?: boolean;
	reveal?: boolean;
	revealValue?: string;
	preRevealImage?: string;
	auction?: boolean;
	category?: string;
};
