import type { BigNumber } from 'ethers';

export type RevenueSplitCreator = 'user' | 'collectionPricing' | 'collectionRoyalty';

export type RevenueRecipient = {
	address: string;
	percent: number;
	displayName?: string;
	shareAmount?: BigNumber;
};

export type RevenueSplit = {
	id: string;
	firebaseId?: string;

	name: string;
	recipients: RevenueRecipient[];

	creator: string;
	createdBy: RevenueSplitCreator;
	createdAt?: number;

	controllingAddress?: string;
	address?: string;
	network?: string;
	deployedAt?: number;
};

export const initialRevenueSplit: RevenueSplit = {
	id: '',
	creator: '',
	name: '',
	recipients: [],
	controllingAddress: null,
	address: '',
	network: '',
	createdBy: 'user',
};

export function isRevenueSplit(item: any | RevenueSplit): item is RevenueSplit {
	return item && typeof item === 'object' && 'recipients' in item;
}
