import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from './contractMap';
import { readContractByAddress } from './contractReader';
import { JBTOKENS_ETH } from './types';
import type { ContractPlatform } from '$constants/platform';

import type {
	JBProjectMetadata,
	JBFundingCycleData,
	JBFundingCycleMetadata,
	JBGroupedSplits,
	JBFundAccessConstraints,
} from './types';

/**
 * Creates a project for the specified owner.
 *
 * @param platform Deployment to use: 'juicebox2', 'juicebox3', 'discobox'.
 * @param owner
 * @param projectMetadata
 * @param data
 * @param metadata
 * @param mustStartAtOrAfter
 * @param groupedSplits
 * @param fundAccessConstraints
 * @param terminals
 * @param memo
 * @param opts
 */
export async function launchProjectFor<T extends boolean = false>(
	platform: ContractPlatform,
	owner: string,
	projectMetadata: JBProjectMetadata,
	data: JBFundingCycleData,
	metadata: JBFundingCycleMetadata,
	mustStartAtOrAfter: number | string,
	groupedSplits: JBGroupedSplits[],
	fundAccessConstraints: JBFundAccessConstraints[],
	terminals: string[],
	memo = '',
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contract = new ethers.Contract(
		JBController.address,
		JBController.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.launchProjectFor(
			owner,
			projectMetadata,
			data,
			metadata,
			mustStartAtOrAfter,
			groupedSplits,
			fundAccessConstraints,
			terminals,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.launchProjectFor(
		owner,
		projectMetadata,
		data,
		metadata,
		mustStartAtOrAfter,
		groupedSplits,
		fundAccessConstraints,
		terminals,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function launchFundingCyclesFor<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber | number,
	data: JBFundingCycleData,
	metadata: JBFundingCycleMetadata,
	mustStartAtOrAfter: number | string,
	groupedSplits: JBGroupedSplits[],
	fundAccessConstraints: JBFundAccessConstraints[],
	terminals: string[],
	memo = '',
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contract = new ethers.Contract(
		JBController.address,
		JBController.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.launchFundingCyclesFor(
			projectId,
			data,
			metadata,
			mustStartAtOrAfter,
			groupedSplits,
			fundAccessConstraints,
			terminals,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.launchFundingCyclesFor(
		projectId,
		data,
		metadata,
		mustStartAtOrAfter,
		groupedSplits,
		fundAccessConstraints,
		terminals,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

// v2
export async function issueTokenFor<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber | number,
	name: string,
	symbol: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contract = new ethers.Contract(
		JBController.address,
		JBController.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.issueTokenFor(
			projectId,
			name,
			symbol,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.issueTokenFor(
		projectId,
		name,
		symbol,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function distributeReservedTokensOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber | number,
	memo: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contract = new ethers.Contract(
		JBController.address,
		JBController.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.distributeReservedTokensOf(
			projectId,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.distributeReservedTokensOf(
		projectId,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function mintTokensOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	tokenAmount: number | BigNumber,
	beneficiary: string,
	memo: string,
	preferClaimedTokens: boolean,
	useReservedRate: boolean,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contract = new ethers.Contract(
		JBController.address,
		JBController.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.mintTokensOf(
			projectId,
			tokenAmount,
			beneficiary,
			memo,
			preferClaimedTokens,
			useReservedRate,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.mintTokensOf(
		projectId,
		tokenAmount,
		beneficiary,
		memo,
		preferClaimedTokens,
		useReservedRate,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function reconfigureFundingCyclesOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	data: JBFundingCycleData,
	metadata: JBFundingCycleMetadata,
	mustStartAtOrAfter: number | BigNumber,
	groupedSplits: JBGroupedSplits[],
	fundAccessConstraints: JBFundAccessConstraints[],
	memo: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contract = new ethers.Contract(
		JBController.address,
		JBController.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.reconfigureFundingCyclesOf(
			projectId,
			data,
			metadata,
			mustStartAtOrAfter,
			groupedSplits,
			fundAccessConstraints,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.reconfigureFundingCyclesOf(
		projectId,
		data,
		metadata,
		mustStartAtOrAfter,
		groupedSplits,
		fundAccessConstraints,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function queuedFundingCycleOf(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	cache: boolean = false,
): Promise<any> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contractAddress = JBController.address;
	const abi = JBController.abi;

	return readContractByAddress(contractAddress, abi, 'queuedFundingCycleOf', [projectId], cache);
}

export async function currentFundingCycleOf(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	cache: boolean = false,
): Promise<any> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contractAddress = JBController.address;
	const abi = JBController.abi;

	return readContractByAddress(contractAddress, abi, 'currentFundingCycleOf', [projectId], cache);
}

export async function reservedTokenBalanceOf(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	reservedRate: number | BigNumber,
	cache: boolean = false,
): Promise<BigNumber> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contractAddress = JBController.address;
	const abi = JBController.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'reservedTokenBalanceOf',
		[projectId, reservedRate],
		cache,
	)) as BigNumber;
}

export async function distributionLimitOf(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	configuration: number | BigNumber,
	terminalAddress?: string,
	tokenAddress: string = JBTOKENS_ETH,
	cache: boolean = false,
): Promise<[BigNumber, BigNumber]> {
	const JBController = await contracts[platform][get(readNetwork).alias].JBController();
	const contractAddress = JBController.address;
	const abi = JBController.abi;

	terminalAddress =
		terminalAddress ??
		(await contracts[platform][get(readNetwork).alias].JBETHPaymentTerminal()).address;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'distributionLimitOf',
		[projectId, configuration, terminalAddress, tokenAddress],
		cache,
	)) as [BigNumber, BigNumber];
}

export async function usedDistributionLimitOf(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	primaryTerminal: string,
	fundingCycleNumber: number | BigNumber,
	cache: boolean = false,
): Promise<BigNumber> {
	const JBSingleTokenPaymentTerminalStore = await contracts[platform][
		get(readNetwork).alias
	].JBSingleTokenPaymentTerminalStore();
	const contractAddress = JBSingleTokenPaymentTerminalStore.address;
	const abi = JBSingleTokenPaymentTerminalStore.abi;
	return (await readContractByAddress(
		contractAddress,
		abi,
		'usedDistributionLimitOf',
		[primaryTerminal, projectId, fundingCycleNumber],
		cache,
	)) as BigNumber;
}
