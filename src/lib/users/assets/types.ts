import type { Token, Price } from '@uniswap/sdk-core';
import type { Token as SushiToken } from '@sushiswap/sdk';
import type { FloorPriceMarketplace } from 'alchemy-sdk';
import type { Token as ZoraToken, TokenContract } from '@zoralabs/zdk/dist/queries/queries-sdk';
import type { IFloorPrice } from './interfaces/IFloorPrice';

export type GeckoTokenMetadata = {
	chainId: number;
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	logoURI: string;
};

export type TokenMetadataSimple = {
	contractAddress: string;
	name: string;
	symbol: string;
	sketchy: boolean;
	tokenBalance: number;
};

export type UniswapPricing = {
	tokenSymbol: string;
	projectTokenPrice: Price<Token, Token>;
	WETHPrice: Price<Token, Token>;
	liquidity: string;
};

export type SushiswapPricing = {
	tokenSymbol: string;
	midPrice: Price<SushiToken, SushiToken>;
};

export type TokenPrice = {
	ethBalance?: number;
	uni?: string;
	sushi?: string;
};

export type Sorting = 'Minted descend' | 'Minted ascend' | 'Price descend' | 'Price ascend';
// export type Filter = 'collection';
export type View = 'group' | 'list';

export type FloorPrice = Record<string, IFloorPrice>;

export type Collection = TokenContract & {
	logo?: string;
	contractMetadata?: {
		openSea?: {
			floorPrice: number;
		};
	};
	contract?: {
		address?: string;
	};
	nfts: ZoraToken[];
	timeLastUpdated: string;
};
