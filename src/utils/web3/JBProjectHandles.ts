import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from './contractMap';
import type { ContractPlatform } from '$constants/platform';

export async function setEnsNamePartsFor<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	ensNameParts: string[],
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBProjects = await contracts[platform][get(readNetwork).alias].JBProjectHandles();
	const contract = new ethers.Contract(
		JBProjects.address,
		JBProjects.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setEnsNamePartsFor(
			projectId,
			ensNameParts,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}

	return contract.functions.setEnsNamePartsFor(
		projectId,
		ensNameParts,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
