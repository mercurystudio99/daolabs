import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from '../contractMap';
import { readContractByAddress } from '../contractReader';
import type { ContractPlatform } from '$constants/platform';

/**
 * Adds a role to a project.
 *
 * @param projectId Project to add the role to.
 * @param role Role name to add.
 * @param opts Operation options, gas, etc.
 */
export async function addProjectRole<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber,
	role: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const RoleManager = await contracts[platform][get(readNetwork).alias].RoleManager();
	const contract = new ethers.Contract(
		RoleManager.address,
		RoleManager.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.addProjectRole(
			projectId,
			role,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.addProjectRole(
		projectId,
		role,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Removes a role from a project. Accounts previously assigned this role will fail the confirmUserRole call.
 *
 * @param projectId Project to remove the role from.
 * @param role Role name to remove.
 * @param opts Operation options, gas, etc.
 */
export async function removeProjectRole<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber,
	role: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const RoleManager = await contracts[platform][get(readNetwork).alias].RoleManager();
	const contract = new ethers.Contract(
		RoleManager.address,
		RoleManager.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.removeProjectRole(
			projectId,
			role,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.removeProjectRole(
		projectId,
		role,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Grants a role on a project to an address. The role must already exist for this project.
 *
 * @param projectId Project id to grant a role on.
 * @param account Address to grant the role to.
 * @param role Role to grant.
 * @param opts Operation options, gas, etc.
 */
export async function grantProjectRole<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber,
	account: string,
	role: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const RoleManager = await contracts[platform][get(readNetwork).alias].RoleManager();
	const contract = new ethers.Contract(
		RoleManager.address,
		RoleManager.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.grantProjectRole(
			projectId,
			account,
			role,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.grantProjectRole(
		projectId,
		account,
		role,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Revoke a role from a user on a project. This operation will fail if the role has previously been deleted from the project.
 *
 * @param projectId Project to revoke the role on.
 * @param account Address to revoke the role from.
 * @param role Role to revoke.
 * @param opts Operation options, gas, etc.
 */
export async function revokeProjectRole<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber,
	account: string,
	role: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const RoleManager = await contracts[platform][get(readNetwork).alias].RoleManager();
	const contract = new ethers.Contract(
		RoleManager.address,
		RoleManager.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.revokeProjectRole(
			projectId,
			account,
			role,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.revokeProjectRole(
		projectId,
		account,
		role,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Returns a list of roles associated with a project.
 *
 * @param projectId Project id to query.
 * @param cache Option to cache the response in the environment.
 */
export async function listProjectRoles(
	platform: ContractPlatform,
	projectId: BigNumber,
	cache: boolean = false,
): Promise<any> {
	const { address: contractAddress, abi } = await contracts[platform][
		get(readNetwork).alias
	].RoleManager();

	return readContractByAddress(contractAddress, abi, 'listProjectRoles', [projectId], cache);
}

/**
 * Returns a list of roles for a given user for a specific project.
 *
 * @param projectId
 * @param account
 * @param cache Option to cache the response in the environment.
 */
export async function getUserRoles(
	platform: ContractPlatform,
	projectId: BigNumber,
	account: string,
	cache: boolean = false,
): Promise<any> {
	const { address: contractAddress, abi } = await contracts[platform][
		get(readNetwork).alias
	].RoleManager();

	return readContractByAddress(contractAddress, abi, 'getUserRoles', [projectId, account], cache);
}

/**
 * Returns a list of addresses with a given role on some project.
 *
 * @param projectId Project of interest.
 * @param role Role name.
 * @param cache Option to cache the response in the environment.
 */
export async function getProjectUsers(
	platform: ContractPlatform,
	projectId: BigNumber,
	role: string,
	cache: boolean = false,
): Promise<any> {
	const { address: contractAddress, abi } = await contracts[platform][
		get(readNetwork).alias
	].RoleManager();

	return readContractByAddress(contractAddress, abi, 'getProjectUsers', [projectId, role], cache);
}

/**
 * Checks if a given user has a specific role on the project.
 *
 * @param projectId
 * @param account
 * @param role
 * @param cache Option to cache the response in the environment.
 */
export async function confirmUserRole(
	platform: ContractPlatform,
	projectId: BigNumber,
	account: string,
	role: string,
	cache: boolean = false,
): Promise<any> {
	const { address: contractAddress, abi } = await contracts[platform][
		get(readNetwork).alias
	].RoleManager();

	return readContractByAddress(
		contractAddress,
		abi,
		'confirmUserRole',
		[projectId, account, role],
		cache,
	);
}
