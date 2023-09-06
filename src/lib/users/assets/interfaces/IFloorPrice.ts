export interface IFloorPrice {
	floorPrice?: number;
	priceCurrency?: string;
	collectionUrl?: string;
	retrievedAt?: string;
	error?: string;
}

export interface IFloorPriceMarketplace {
	openSea: IFloorPrice;
}
