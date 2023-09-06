export interface NftContract {
	id: string;
	type: string;
	name: string;
	symbol: string;
	address: string;
	maxSupply: number;
	totalSupply: number;
	tokens: NftToken[];
}

export interface NftToken {
	id: string;
	symbol: string;
	tokenId: string;
	tokenUri: string;
	createdAt: number;
	mintReceiver: string;
	owner: string;
	contract: NftContract;
	contractAddress: string;
	price: string;
}

export interface NftHolder {
	id: string;
	address: string;
	tokens: NftToken[];
}

export const parseNftContractJson = (j: Partial<NftContract>): NftContract => ({
	id: j.id,
	type: j.type,
	name: j.name,
	symbol: j.symbol,
	address: j.address,
	maxSupply: j.maxSupply,
	totalSupply: j.totalSupply,
	tokens: j.tokens,
});

export const parseNftTokenJson = (j: Partial<NftToken>): NftToken => ({
	id: j.id,
	symbol: j.symbol,
	tokenId: j.tokenId,
	tokenUri: j.tokenUri,
	createdAt: j.createdAt,
	mintReceiver: j.mintReceiver,
	owner: j.owner,
	contractAddress: j.contractAddress,
	contract: j.contract,
	price: j.price,
});

export const parseNftHolderJson = (j: Partial<NftHolder>): NftHolder => ({
	id: j.id,
	address: j.address,
	tokens: j.tokens,
});
