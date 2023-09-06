import { BigNumber, ethers } from 'ethers';
import { readNetwork, web3Provider as provider } from '$stores/web3';
import { contracts } from '../contractMap';
import { readContractByAddress } from '../contractReader';
import type { ContractPlatform } from '$constants/platform';

/**
 * Returns the pending funds for the address.
 * @param contractAddress Revenue split contract address.
 * @param receiverAddress Receiver address.
 * @param cached Option to cache response in the environment.
 * @returns Pending funds for address.
 */
export async function pendingForAddress(
	contractAddress: string,
	receiverAddress: string,
	platform: ContractPlatform = 'daolabs',
	cached: boolean = false,
): Promise<BigNumber> {
	const { abi } = await contracts[platform][readNetwork.get().alias].MixedPaymentSplitter();

	return BigNumber.from(
		await readContractByAddress(
			contractAddress,
			abi,
			'pending(address)',
			[receiverAddress],
			cached,
		),
	);
}

/**
 * Returns the pending funds for the project.
 * @param contractAddress Revenue split contract address.
 * @param projectId Project identifier.
 * @param cached Option to cache response in the environment.
 * @returns Pending funds for project.
 */
export async function pendingForProject(
	contractAddress: string,
	projectId: number,
	platform: ContractPlatform = 'daolabs',
	cached: boolean = false,
): Promise<BigNumber> {
	const { abi } = await contracts[platform][readNetwork.get().alias].MixedPaymentSplitter();

	return BigNumber.from(
		await readContractByAddress(contractAddress, abi, 'pending(uint256)', [projectId], cached),
	);
}

/**
 * Distribute funds to the address.
 * @param contractAddress Revenue split contract address
 * @param receiverAddress Receiver address.
 * @returns Contract transaction.
 */
export async function distributeToAddress<T extends boolean = false>(
	contractAddress: string,
	receiverAddress: string,
	platform: ContractPlatform = 'daolabs',
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const MixedPaymentSplitter = await contracts[platform][
		readNetwork.get().alias
	].MixedPaymentSplitter();
	const contract = new ethers.Contract(
		contractAddress,
		MixedPaymentSplitter.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction['distribute(address)'](
			receiverAddress,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions['distribute(address)'](
		receiverAddress,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Distribute funds to the project.
 * @param contractAddress Revenue split contract address
 * @param projectId Receiver project identifier.
 * @returns Contract transaction.
 */
export async function distributeToProject<T extends boolean = false>(
	contractAddress: string,
	projectId: number,
	platform: ContractPlatform = 'daolabs',
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const MixedPaymentSplitter = await contracts[platform][
		readNetwork.get().alias
	].MixedPaymentSplitter();
	const contract = new ethers.Contract(
		contractAddress,
		MixedPaymentSplitter.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction['distribute(uint256)'](
			projectId,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions['distribute(uint256)'](
		projectId,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
