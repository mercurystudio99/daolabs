import { get } from 'svelte/store';
import { readNetwork } from '$stores/web3';

import { readContractByAddress } from '../contractReader';
import { contracts } from '../contractMap';
import type { BigNumber } from 'ethers';
import type { ContractPlatform } from '$constants/platform';

type Tier = {
	allowManualMint: boolean;
	contributionFloor: BigNumber;
	encodedIPFSUri: string;
	id: BigNumber;
	initialQuantity: BigNumber;
	lockedUntil: BigNumber;
	remainingQuantity: BigNumber;
	reservedRate: BigNumber;
	reservedTokenBeneficiary: string;
	transfersPausable: boolean;
	votingUnits: BigNumber;
};

/**
 *
 * @param platform Platform deployment to read, juicebox3, daolabs, etc.
 * @param nftRewardAddress Address of the reward NFT contract.
 * @param startTier Tier to start reading from, should be 0 for most cases.
 * @param tierCount Number of tiers to read.
 * @param contractAddress JBTiered721DelegateStore contract address, defaulted to known address based on platform and network name.
 * @param cache Option to cache the response in the environment.
 */
export async function tiers(
	platform: ContractPlatform,
	nftRewardAddress: string,
	startTier: number,
	tierCount: number,
	contractAddress?: string,
	cache: boolean = false,
): Promise<Tier[]> {
	const JBTiered721DelegateStore = await contracts[platform][
		get(readNetwork).alias
	].JBTiered721DelegateStore();
	contractAddress = contractAddress ?? JBTiered721DelegateStore.address;
	const abi = JBTiered721DelegateStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'tiers',
		[nftRewardAddress, startTier, tierCount],
		cache,
	)) as Tier[];
}

/**
 *
 * @param platform Platform deployment to read, juicebox3, daolabs, etc.
 * @param nftRewardAddress Address of the reward NFT contract.
 * @param contractAddress JBTiered721DelegateStore contract address, defaulted to known address based on platform and network name.
 * @param cache Option to cache the response in the environment.
 */
export async function totalSupply(
	platform: ContractPlatform,
	nftRewardAddress: string,
	contractAddress?: string,
	cache: boolean = false,
): Promise<any> {
	const JBTiered721DelegateStore = await contracts[platform][
		get(readNetwork).alias
	].JBTiered721DelegateStore();

	contractAddress = contractAddress ?? JBTiered721DelegateStore.address;
	const abi = JBTiered721DelegateStore.abi;

	return readContractByAddress(contractAddress, abi, 'totalSupply', [nftRewardAddress], cache);
}

/**
 *
 * @param platform Platform deployment to read, juicebox3, daolabs, etc.
 * @param nftRewardAddress Address of the reward NFT contract.
 * @param tokenId Token id in question.
 * @param contractAddress JBTiered721DelegateStore contract address, defaulted to known address based on platform and network name.
 * @param cache Option to cache the response in the environment.
 */
export async function encodedTierIPFSUriOf(
	platform: ContractPlatform,
	nftRewardAddress: string,
	tokenId: number | BigNumber,
	contractAddress?: string,
	cache: boolean = false,
): Promise<any> {
	const JBTiered721DelegateStore = await contracts[platform][
		get(readNetwork).alias
	].JBTiered721DelegateStore();

	contractAddress = contractAddress ?? JBTiered721DelegateStore.address;
	const abi = JBTiered721DelegateStore.abi;

	return readContractByAddress(
		contractAddress,
		abi,
		'encodedTierIPFSUriOf',
		[nftRewardAddress, tokenId],
		cache,
	);
}

export async function contractUriOf(
	platform: ContractPlatform,
	dataSource: string,
	contractAddress?: string,
	cache: boolean = false,
): Promise<string> {
	const JBTiered721DelegateStore = await contracts[platform][
		get(readNetwork).alias
	].JBTiered721DelegateStore();

	contractAddress = contractAddress ?? JBTiered721DelegateStore.address;
	const abi = JBTiered721DelegateStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'contractUriOf',
		[dataSource],
		cache,
	)) as string;
}
