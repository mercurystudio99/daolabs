import type { BigNumber } from 'ethers';

export type Split = {
	beneficiary: string; // address
	percent: BigNumber | number | string;
	preferClaimed: boolean;
	preferAddToBalance: boolean;
	lockedUntil: BigNumber | number;
	projectId: BigNumber | number;
	allocator: string; // address, If an allocator is specified, funds will be sent to the allocator contract along with the projectId, beneficiary, preferClaimed properties.
};

export const defaultSplit = {
	beneficiary: undefined,
	percent: 0,
	preferClaimed: undefined,
	lockedUntil: undefined,
	projectId: undefined,
	allocator: undefined,
};

export type ETHPayoutSplitGroup = 1;
export type ReservedTokensSplitGroup = 2;
export type SplitGroup = ETHPayoutSplitGroup | ReservedTokensSplitGroup;

export interface GroupedSplits<G> {
	group: G;
	splits: Split[];
}

export type ETHPayoutGroupedSplits = GroupedSplits<ETHPayoutSplitGroup>;
export type ReservedTokensGroupedSplits = GroupedSplits<ReservedTokensSplitGroup>;
