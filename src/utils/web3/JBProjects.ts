import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from './contractMap';
import { readContractByAddress } from './contractReader';
import type { ContractPlatform } from '$constants/platform';

/**
 * JBProjects is an ERC721 token that is used a key to project ownership.
 */

/**
 * Rather than implementing `transferFrom`, we expose `safeTransferFrom` which requires the destination address to implement `ERC721Receiver` just as the minting process for the NFT during project creation requires the same.
 *
 * @param from Current NFT holder.
 * @param to Destination address.
 * @param projectId Project id, which is the same as token id of the NFT to transfer.
 * @param opts Operation options, gas, etc.
 */
export async function safeTransferFrom<T extends boolean = false>(
	platform: ContractPlatform,
	from: string,
	to: string,
	projectId: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBProjects = await contracts[platform][get(readNetwork).alias].JBProjects();
	const contract = new ethers.Contract(
		JBProjects.address,
		JBProjects.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction['safeTransferFrom(address,address,uint256)'](
			from,
			to,
			projectId,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions['safeTransferFrom(address,address,uint256)'](
		from,
		to,
		projectId,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function setMetadataOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	content: string,
	domain: number | BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBProjects = await contracts[platform][get(readNetwork).alias].JBProjects();
	const contract = new ethers.Contract(
		JBProjects.address,
		JBProjects.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setMetadataOf(
			projectId,
			{ content, domain },
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setMetadataOf(
		projectId,
		{ content, domain },
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Returns NFT metadata URI.
 *
 * @param projectId Project id, which is also the token id.
 * @param cache Option to cache the response in the environment.
 */
export async function tokenURI(
	platform: ContractPlatform,
	projectId: BigNumber,
	cache: boolean = false,
): Promise<any> {
	const JBProjects = await contracts[platform][get(readNetwork).alias].JBProjects();
	const contractAddress = JBProjects.address;
	const abi = JBProjects.abi;

	return readContractByAddress(contractAddress, abi, 'tokenURI', [projectId], cache);
}

/**
 * Returns the owner address.
 *
 * @param projectId Project id, which is also the token id.
 * @param cache Option to cache the response in the environment.
 */
export async function ownerOf(
	platform: ContractPlatform,
	projectId: BigNumber,
	cache: boolean = false,
): Promise<string> {
	const JBProjects = await contracts[platform][get(readNetwork).alias].JBProjects();
	const contractAddress = JBProjects.address;
	const abi = JBProjects.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'ownerOf',
		[projectId],
		cache,
	)) as string;
}

export async function metadataContentOf(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	domain: number | BigNumber,
	cache: boolean = false,
): Promise<string> {
	const JBProjects = await contracts[platform][get(readNetwork).alias].JBProjects();
	const contractAddress = JBProjects.address;
	const abi = JBProjects.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'metadataContentOf',
		[projectId, domain],
		cache,
	)) as string;
}
