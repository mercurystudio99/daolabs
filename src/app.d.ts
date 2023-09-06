/// <reference types="@sveltejs/kit" />

import type Store from '$utils/Store';
import type { BigNumber, ContractTransaction, PopulatedTransaction, providers } from 'ethers';

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare global {
	type Address = `0x${string}`;
	type Any = any;
	type ProjectType = 'default' | 'membership';
	namespace svelteHTML {
		interface HTMLAttributes<HTMLDivElement> {
			onshowPopover?: (e: CustomEvent) => void;
			onhidePopover?: (e: CustomEvent) => void;
			onclickOutside?: (e: CustomEvent) => void;
		}
	}

	interface ContractWrapperTxnOpts<T> {
		populateTxn?: T;
		actualProvider?: providers.Web3Provider;
		value?: BigNumber;
		gasLimit?: number;
		gasPrice?: BigNumber;
	}

	type ContractWrapperTxnReturnType<T> = Promise<
		T extends false ? ContractTransaction : PopulatedTransaction
	>;
}

export {};
export interface NFTTier {
	price: BigNumber;
	maxSupply: number;
	file: string;
	name: string;
	link: string;
	description: string;
}

// How the reward tiers are stored in the contracts
export type ContractNftRewardTier = {
	contributionFloor: BigNumber; //uint128
	remainingQuantity: BigNumber; //uint64
	initialQuantity: BigNumber; //uint64
	tokenUri: string; // full link to IPFS
	votingUnits: BigNumber;
	reservedRate: BigNumber;
};

export type DeepDaoData = {
	isActive: boolean;
	isSmartContract: boolean;
	score: number;
	votes: number;
	proposals: number;
	rank: number;
	relativeScore: number;
};

export type Dirty = {
	showDirty: Store<boolean>;
	check: (
		initialState?: {
			[x: string]: any;
		},
		currentState?: {
			[x: string]: any;
		},
	) => void;
};
