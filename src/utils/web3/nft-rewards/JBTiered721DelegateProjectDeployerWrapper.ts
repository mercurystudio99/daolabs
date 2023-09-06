import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from '../contractMap';
import type {
	JBDeployTiered721DelegateData,
	JBLaunchFundingCyclesData,
	JBLaunchProjectData,
	JBReconfigureFundingCyclesData,
} from '../types';
import type { ContractPlatform } from '$constants/platform';

export async function launchProjectFor<T extends boolean = false>(
	platform: ContractPlatform,
	owner: string,
	deployTiered721DelegateData: JBDeployTiered721DelegateData,
	launchProjectData: JBLaunchProjectData,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBTiered721DelegateProjectDeployer = await contracts[platform][
		get(readNetwork).alias
	].JBTiered721DelegateProjectDeployer();
	const contract = new ethers.Contract(
		JBTiered721DelegateProjectDeployer.address,
		JBTiered721DelegateProjectDeployer.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.launchProjectFor(
			owner,
			deployTiered721DelegateData,
			launchProjectData,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.launchProjectFor(
		owner,
		deployTiered721DelegateData,
		launchProjectData,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function launchFundingCyclesFor<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	deployTiered721DelegateData: JBDeployTiered721DelegateData,
	launchFundingCyclesData: JBLaunchFundingCyclesData,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBTiered721DelegateProjectDeployer = await contracts[platform][
		get(readNetwork).alias
	].JBTiered721DelegateProjectDeployer();
	const contract = new ethers.Contract(
		JBTiered721DelegateProjectDeployer.address,
		JBTiered721DelegateProjectDeployer.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.launchFundingCyclesFor(
			projectId,
			deployTiered721DelegateData,
			launchFundingCyclesData,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.launchFundingCyclesFor(
		projectId,
		deployTiered721DelegateData,
		launchFundingCyclesData,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function reconfigureFundingCyclesOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	deployTiered721DelegateData: JBDeployTiered721DelegateData,
	reconfigureFundingCyclesData: JBReconfigureFundingCyclesData,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBTiered721DelegateProjectDeployer = await contracts[platform][
		get(readNetwork).alias
	].JBTiered721DelegateProjectDeployer();
	const contract = new ethers.Contract(
		JBTiered721DelegateProjectDeployer.address,
		JBTiered721DelegateProjectDeployer.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.reconfigureFundingCyclesOf(
			projectId,
			deployTiered721DelegateData,
			reconfigureFundingCyclesData,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.reconfigureFundingCyclesOf(
		projectId,
		deployTiered721DelegateData,
		reconfigureFundingCyclesData,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
