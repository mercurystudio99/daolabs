import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from './contractMap';
import { readContractByAddress } from './contractReader';
import type { ContractPlatform } from '$constants/platform';

/**
 * Sets a controller address. This is a privileged operation. Project controller has some amount of control over the project, but less so than owner.
 *
 * @param projectId Project id.
 * @param controller Controller address.
 * @param opts Operation options, gas, etc.
 */
export async function setControllerOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber,
	controller: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBDirectory = await contracts[platform][get(readNetwork).alias].JBDirectory();
	const contract = new ethers.Contract(
		JBDirectory.address,
		JBDirectory.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setControllerOf(
			projectId,
			controller,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setControllerOf(
		projectId,
		controller,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Sets a list of terminals for a given project. Terminal contracts must implement `IJBPaymentTerminal`.
 *
 * @param projectId
 * @param terminals IJBPaymentTerminal
 * @param opts Operation options, gas, etc.
 */
export async function setTerminalsOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber,
	terminals: string[],
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBDirectory = await contracts[platform][get(readNetwork).alias].JBDirectory();
	const contract = new ethers.Contract(
		JBDirectory.address,
		JBDirectory.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setTerminalsOf(
			projectId,
			terminals,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setTerminalsOf(
		projectId,
		terminals,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Sets a primary terminal for a given project/token pair. This is necessary if a project expects to receive funds in some ERC20 token that JBX doesn't support by default. It can also be used to override the general Ether terminal. Use token address `0x000000000000000000000000000000000000EEEe` for Ether. The terminal contract must implement `IJBPaymentTerminal`.
 *
 * @param projectId
 * @param token
 * @param terminal
 * @param opts Operation options, gas, etc.
 */
export async function setPrimaryTerminalOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber,
	token: string,
	terminal: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBDirectory = await contracts[platform][get(readNetwork).alias].JBDirectory();
	const contract = new ethers.Contract(
		JBDirectory.address,
		JBDirectory.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setPrimaryTerminalOf(
			projectId,
			token,
			terminal,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setPrimaryTerminalOf(
		projectId,
		token,
		terminal,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Returns the controller address.
 *
 * @param projectId
 * @param cache Option to cache the response in the environment.
 */
export async function controllerOf(
	platform: ContractPlatform,
	projectId: BigNumber,
	cache: boolean = false,
): Promise<any> {
	const RoleManager = await contracts[platform][get(readNetwork).alias].RoleManager();
	const contractAddress = RoleManager.address;
	const abi = RoleManager.abi;

	return readContractByAddress(contractAddress, abi, 'controllerOf', [projectId], cache);
}

/**
 * Returns the project terminal for handling deposits in a given token.
 *
 * @param projectId
 * @param cache Option to cache the response in the environment.
 */
export async function primaryTerminalOf(
	platform: ContractPlatform,
	projectId: BigNumber,
	token: string,
	cache: boolean = false,
): Promise<any> {
	const RoleManager = await contracts[platform][get(readNetwork).alias].RoleManager();
	const contractAddress = RoleManager.address;
	const abi = RoleManager.abi;

	return readContractByAddress(
		contractAddress,
		abi,
		'primaryTerminalOf',
		[projectId, token],
		cache,
	);
}

/**
 * Returns all terminals for a given project.
 *
 * @param projectId
 * @param cache Option to cache the response in the environment.
 */
export async function terminalsOf(
	platform: ContractPlatform,
	projectId: BigNumber,
	cache: boolean = false,
): Promise<string[]> {
	const JBDirectory = await contracts[platform][get(readNetwork).alias].JBDirectory();
	const contractAddress = JBDirectory.address;
	const abi = JBDirectory.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'terminalsOf',
		[projectId],
		cache,
	)) as string[];
}
