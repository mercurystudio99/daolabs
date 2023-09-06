import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from '../contractMap';
import { readContractByAddress } from '../contractReader';
import type { ContractPlatform } from '$constants/platform';

/**
 * Admin operation to mint an NFT to a given account.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param account Account to mint the token to.
 * @param opts Operation options, gas, etc.
 */
export async function mint<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	account: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFTRewardDataSourceDelegate = await contracts[platform][
		get(readNetwork).alias
	].NFTRewardDataSourceDelegate();
	const contract = new ethers.Contract(
		contractAddress,
		NFTRewardDataSourceDelegate.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.mint(account, opts) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.mint(account, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Allows the admin to disable or reenable NFT transferability on a NFTRewardDataSourceDelegate instance.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param transferrable
 * @param opts Operation options, gas, etc.
 */
export async function setTransferrable<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	transferrable: boolean,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFTRewardDataSourceDelegate = await contracts[platform][
		get(readNetwork).alias
	].NFTRewardDataSourceDelegate();
	const contract = new ethers.Contract(
		contractAddress,
		NFTRewardDataSourceDelegate.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setTransferrable(
			transferrable,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setTransferrable(
		transferrable,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * This function is intended to allow NFT management for non-transferrable NFTs where the holder is unable to perform any action on the token, so we let the admin of the contract burn them.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param account
 * @param tokenId
 * @param opts Operation options, gas, etc.
 */
export async function burn<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	account: string,
	tokenId: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFTRewardDataSourceDelegate = await contracts[platform][
		get(readNetwork).alias
	].NFTRewardDataSourceDelegate();
	const contract = new ethers.Contract(
		contractAddress,
		NFTRewardDataSourceDelegate.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.burn(
			account,
			tokenId,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.burn(account, tokenId, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Set OpenSea-style contract metadata uri.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param uri Metadata uri to assign.
 * @param opts Operation options, gas, etc.
 */
export async function setContractUri<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	uri: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFTRewardDataSourceDelegate = await contracts[platform][
		get(readNetwork).alias
	].NFTRewardDataSourceDelegate();
	const contract = new ethers.Contract(
		contractAddress,
		NFTRewardDataSourceDelegate.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setContractUri(
			uri,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setContractUri(uri, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Set NFT base uri.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param uri Metadata uri to assign.
 * @param opts Operation options, gas, etc.
 */
export async function setTokenUri<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	uri: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFTRewardDataSourceDelegate = await contracts[platform][
		get(readNetwork).alias
	].NFTRewardDataSourceDelegate();
	const contract = new ethers.Contract(
		contractAddress,
		NFTRewardDataSourceDelegate.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setTokenUri(uri, opts) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setTokenUri(uri, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Set TokenUriResolver address. Instances of this contract can be custom or be created by `DeployerWrapper.deployOpenTieredTokenUriResolver`
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param tokenUriResolverAddress TokenUriResolver address to assign.
 * @param opts Operation options, gas, etc.
 */
export async function setTokenUriResolver<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	tokenUriResolverAddress: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFTRewardDataSourceDelegate = await contracts[platform][
		get(readNetwork).alias
	].NFTRewardDataSourceDelegate();
	const contract = new ethers.Contract(
		contractAddress,
		NFTRewardDataSourceDelegate.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setTokenUriResolver(
			tokenUriResolverAddress,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setTokenUriResolver(
		tokenUriResolverAddress,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Returns the token metadata uri for a given token id.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param tokenId Token id of interest.
 * @param cache Option to cache the response in the environment.
 */
export async function tokenURI(
	platform: ContractPlatform,
	contractAddress: string,
	tokenId: BigNumber,
	cache: boolean = false,
): Promise<any> {
	const { abi } = await contracts[platform][get(readNetwork).alias].NFTRewardDataSourceDelegate();

	return readContractByAddress(contractAddress, abi, 'tokenURI', [tokenId], cache);
}

/**
 * Returns the contract metadata uri, which is expected to contain OpenSea-style data.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param cache Option to cache the response in the environment.
 */
export async function contractURI(
	platform: ContractPlatform,
	contractAddress: string,
	cache: boolean = false,
): Promise<any> {
	const { abi } = await contracts[platform][get(readNetwork).alias].NFTRewardDataSourceDelegate();

	return readContractByAddress(contractAddress, abi, 'contractURI', [], cache);
}

/**
 * ERC721 approve function.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param spender Account to assign rights to.
 * @param tokenId Token id to assign rights on.
 * @param opts Operation options, gas, etc.
 */
export async function approve<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	spender: string,
	tokenId: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFTRewardDataSourceDelegate = await contracts[platform][
		get(readNetwork).alias
	].NFTRewardDataSourceDelegate();
	const contract = new ethers.Contract(
		contractAddress,
		NFTRewardDataSourceDelegate.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.approve(
			spender,
			tokenId,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.approve(spender, tokenId, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * ERC721 transfer function.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param destination Destination address.
 * @param tokenId Token id to send.
 * @param opts Operation options, gas, etc.
 */
export async function transfer<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	destination: string,
	tokenId: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFTRewardDataSourceDelegate = await contracts[platform][
		get(readNetwork).alias
	].NFTRewardDataSourceDelegate();
	const contract = new ethers.Contract(
		contractAddress,
		NFTRewardDataSourceDelegate.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.transfer(
			destination,
			tokenId,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.transfer(destination, tokenId, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * ERC721 tranferFrom function.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param source Address of the current token owner.
 * @param destination Address to send the token to.
 * @param tokenId Token id to send.
 * @param opts Operation options, gas, etc.
 */
export async function transferFrom<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	source: string,
	destination: string,
	tokenId: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFTRewardDataSourceDelegate = await contracts[platform][
		get(readNetwork).alias
	].NFTRewardDataSourceDelegate();
	const contract = new ethers.Contract(
		contractAddress,
		NFTRewardDataSourceDelegate.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.transferFrom(
			source,
			destination,
			tokenId,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.transferFrom(
		source,
		destination,
		tokenId,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * ERC721 isOwner function. Confirms ownership of a given token id by specified account.
 *
 * @param contractAddress NFTRewardDataSourceDelegate contract address.
 * @param account Expected owner account address.
 * @param tokenId Token id in question.
 * @param cache Option to cache the response in the environment.
 */
export async function isOwner(
	platform: ContractPlatform,
	contractAddress: string,
	account: string,
	tokenId: BigNumber,
	cache: boolean = false,
): Promise<any> {
	const { abi } = await contracts[platform][get(readNetwork).alias].NFTRewardDataSourceDelegate();

	return readContractByAddress(contractAddress, abi, 'isOwner', [account, tokenId], cache);
}
