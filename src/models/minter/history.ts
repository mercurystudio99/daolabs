import type { CollectionConfig } from './collection-config';
import type { ImageNftConfig, NftConfig, NftType } from './nft-config';
import type { TokenStandard } from './token-standard';

export enum SessionStatus {
	UNFINISHED = 'Unfinished',
	DEPLOYED = 'Deployed',
}

export interface Session {
	id: string;
	type: NftType;
	nfts: NftConfig[] | ImageNftConfig[];
	collections: CollectionConfig[];
	status: SessionStatus;
	timestamp: number;
	title: string;
	standard?: TokenStandard;
	cardDisplayState: { [key: string]: boolean };
	targetSupply: number;
}
