import { BigNumber, ethers, type BytesLike } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from './contractMap';
import type { ContractPlatform } from '$constants/platform';

export async function deployProjectPayer<T extends boolean = false>(
	platform: ContractPlatform,
	defaultProjectId: number | BigNumber,
	defaultBeneficiary: string,
	defaultPreferClaimedTokens: boolean,
	defaultMemo: string,
	defaultMetadata: BytesLike,
	defaultPreferAddToBalance: boolean,
	owner: string,
	directory?: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	directory =
		directory ?? (await contracts[platform][get(readNetwork).alias].JBDirectory()).address;

	const JBETHERC20ProjectPayerDeployer = await contracts[platform][
		get(readNetwork).alias
	].JBETHERC20ProjectPayerDeployer();

	const contract = new ethers.Contract(
		JBETHERC20ProjectPayerDeployer.address,
		JBETHERC20ProjectPayerDeployer.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployProjectPayer(
			defaultProjectId,
			defaultBeneficiary,
			defaultPreferClaimedTokens,
			defaultMemo,
			defaultMetadata,
			defaultPreferAddToBalance,
			owner,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployProjectPayer(
		defaultProjectId,
		defaultBeneficiary,
		defaultPreferClaimedTokens,
		defaultMemo,
		defaultMetadata,
		defaultPreferAddToBalance,
		owner,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
