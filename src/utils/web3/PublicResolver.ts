import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from './contractMap';
import type { ContractPlatform } from '$constants/platform';

export async function setText<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	node: string,
	projectHandleENSTextRecordKey: string = 'juicebox_project_id',
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBProjects = await contracts[platform][get(readNetwork).alias].PublicResolver();
	const contract = new ethers.Contract(
		JBProjects.address,
		JBProjects.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setText(
			node,
			projectHandleENSTextRecordKey,
			projectId,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setText(
		node,
		projectHandleENSTextRecordKey,
		projectId,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
