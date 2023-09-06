import { ethers, type BigNumber } from 'ethers';
import { readNetwork, web3Provider as provider } from '$stores/web3';

import { contracts } from './contractMap';
import { readContractByAddress } from './contractReader';
import type { ContractPlatform } from '$constants/platform';

export async function hasPermissions(
	platform: ContractPlatform,
	operatorAddress: string,
	accountAddress: string,
	domain: BigNumber,
	permissionIndexes: (BigNumber | number)[],
	cache: boolean = false,
): Promise<boolean> {
	const JBOperatorStore = await contracts[platform][readNetwork.get().alias].JBOperatorStore();
	const contractAddress = JBOperatorStore.address;
	const abi = JBOperatorStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'hasPermissions',
		[operatorAddress, accountAddress, domain, permissionIndexes],
		cache,
	)) as boolean;
}

export async function setOperator<T extends boolean = false>(
	platform: ContractPlatform,
	operatorAddress: string,
	domain: BigNumber,
	permissionIndexes: (BigNumber | number)[],
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBOperatorStore = await contracts[platform][readNetwork.get().alias].JBOperatorStore();
	const contractAddress = JBOperatorStore.address;
	const abi = JBOperatorStore.abi;

	const contract = new ethers.Contract(contractAddress, abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.setOperator(
			{
				operator: operatorAddress,
				domain,
				permissionIndexes,
			},
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setOperator(
		{
			operator: operatorAddress,
			domain,
			permissionIndexes,
		},
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
