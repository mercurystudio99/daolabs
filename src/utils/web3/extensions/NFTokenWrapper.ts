import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from '../contractMap';
import { readContractByAddress } from '../contractReader';
import type { ContractPlatform } from '$constants/platform';

/**
 * This wrapper works for both NFToken and shared NFUToken instances. Note all calls require a contract address.
 */

/**
 * Get OpenSea-style contract metadata.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param cache Option to cache the response in the environment.
 */
export async function contractURI(
	platform: ContractPlatform,
	contractAddress: string,
	cache: boolean = false,
): Promise<any> {
	const { abi } = await contracts[platform][get(readNetwork).alias].NFToken();

	return readContractByAddress(contractAddress, abi, 'contractURI', [], cache);
}

/**
 * Returns token metadata uri.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param tokenId Token id of interest.
 * @param cache Option to cache the response in the environment.
 * @returns
 */
export async function tokenURI(
	platform: ContractPlatform,
	contractAddress: string,
	tokenId: BigNumber,
	cache: boolean = false,
): Promise<any> {
	const { abi } = await contracts[platform][get(readNetwork).alias].NFToken();

	return readContractByAddress(contractAddress, abi, 'tokenURI', [tokenId], cache);
}

/**
 * Returns royalty info for a given token id for a specific sale price.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param tokenId Token id of interest.
 * @param salePrice NFT sale price to derive royalty amount from.
 * @param cache Option to cache the response in the environment.
 */
export async function royaltyInfo(
	platform: ContractPlatform,
	contractAddress: string,
	tokenId: BigNumber,
	salePrice: string,
	cache: boolean = false,
): Promise<any> {
	const { abi } = await contracts[platform][get(readNetwork).alias].NFToken();

	return readContractByAddress(contractAddress, abi, 'tokenURI', [tokenId, salePrice], cache);
}

/**
 * Returns owner address of a given token id.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param tokenId Token id of interest.
 * @param cache Option to cache the response in the environment.
 * @returns
 */
export async function ownerOf(
	platform: ContractPlatform,
	contractAddress: string,
	tokenId: string,
	cache: boolean = false,
): Promise<any> {
	const { abi } = await contracts[platform][get(readNetwork).alias].NFToken();

	return readContractByAddress(contractAddress, abi, 'tokenURI', [tokenId], cache);
}

/**
 * Returns the mint price for a given minter address.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param minter Address of account attempting the mint operation.
 * @param cache Option to cache the response in the environment.
 * @returns
 */
export async function getMintPrice(
	platform: ContractPlatform,
	contractAddress: string,
	minter: string,
	cache: boolean = false,
): Promise<any> {
	const { abi } = await contracts[platform][get(readNetwork).alias].NFToken();

	return readContractByAddress(contractAddress, abi, 'tokenURI', [minter], cache);
}

/**
 * Mints a token to the calling account. Must be paid in Ether if price is non-zero.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param memo Juicebox memo to pass to a IJBPaymentTerminal.
 * @param metadata Juicebox metadata to pass to a IJBPaymentTerminal.
 * @param opts Operation options, gas, etc.
 */
export async function mint<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	address: string = undefined,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());
	const options = {
		gasLimit: 10000000,
		value: ethers.utils.parseEther('0.02'),
		...opts,
	};

	if (populateTxn) {
		if (address) {
			return contract.populateTransaction['mint(address)'](
				address,
				options,
			) as ContractWrapperTxnReturnType<T>;
		}
		return contract.populateTransaction['mint()'](options) as ContractWrapperTxnReturnType<T>;
	}
	if (address) {
		return contract.functions['mint(address)'](address, options) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions['mint()'](options) as ContractWrapperTxnReturnType<T>;
}

export async function mintEdition<T extends boolean = false>(
	platform: ContractPlatform,
	editionId: number,
	contractAddress: string,
	value: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFUEdition = await contracts[platform][get(readNetwork).alias].NFUEdition();
	const contract = new ethers.Contract(contractAddress, NFUEdition.abi, actualProvider.getSigner());
	const options = {
		gasLimit: 10000000,
		...opts,
		value: ethers.utils.parseEther(value),
	};

	if (populateTxn) {
		return contract.populateTransaction['mint(uint256)'](
			editionId,
			options,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions['mint(uint256)'](editionId, options) as ContractWrapperTxnReturnType<T>;
}

/**
 * Privileged operation callable by accounts with MINTER_ROLE permission to mint the next NFT id to the provided address.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param account
 * @param opts Operation options, gas, etc.
 */
export async function mintFor<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	account: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.mintFor(account, opts) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.mintFor(account, opts) as ContractWrapperTxnReturnType<T>;
}

export async function registerEdition<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	supply: number,
	price: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFUEdition = await contracts[platform][get(readNetwork).alias].NFUEdition();
	const contract = new ethers.Contract(contractAddress, NFUEdition.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.registerEdition(
			supply,
			price,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.registerEdition(supply, price, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Admin function to pause or resume minting. Does not impact other operations.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param pause Flag.
 * @param opts Operation options, gas, etc.
 */
export async function setPause<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	pause: boolean,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.setPause(pause, opts) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setPause(pause, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Grants minting privileges to a given account.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param account Account to grant privilege to.
 * @param opts Operation options, gas, etc.
 */
export async function addMinter<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	account: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.addMinter(account, opts) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.addMinter(account, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Revokes minting privileges from a given account.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param account Account to revoke privilege from.
 * @param opts Operation options, gas, etc.
 */
export async function removeMinter<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	account: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.removeMinter(
			account,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.removeMinter(account, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Grants reveal privileges to a given account. Which allows the account in question to call `setBaseURI`.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param account Account to grant privilege to.
 * @param opts Operation options, gas, etc.
 */
export async function addRevealer<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	account: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.addRevealer(
			account,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.addRevealer(account, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Revokes reveal privileges from a given account.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param account Account to revoke privilege from.
 * @param opts Operation options, gas, etc.
 */
export async function removeRevealer<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	account: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.removeRevealer(
			account,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.removeRevealer(account, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Admin function to set provenance hash. This operation can only be executed once.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param provenanceHash Hash.
 * @param opts Operation options, gas, etc.
 */
export async function setProvenanceHash<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	provenanceHash: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.setProvenanceHash(
			provenanceHash,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setProvenanceHash(
		provenanceHash,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Admin function to set metadata uri.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param contractUri Metadata uri.
 * @param opts Operation options, gas, etc.
 */
export async function setContractURI<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	contractUri: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.setContractURI(
			contractUri,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setContractURI(contractUri, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Admin function to adjust minting period.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param mintPeriodStart New minting period start.
 * @param mintPeriodEnd New minting period end.
 * @param opts Operation options, gas, etc.
 */
export async function updateMintPeriod<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	mintPeriodStart: BigNumber,
	mintPeriodEnd: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.updateMintPeriod(
			mintPeriodStart,
			mintPeriodEnd,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.updateMintPeriod(
		mintPeriodStart,
		mintPeriodEnd,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Admin function to change base mint price.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param unitPrice
 * @param opts Operation options, gas, etc.
 */
export async function updateUnitPrice<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	unitPrice: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.updateUnitPrice(
			unitPrice,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.updateUnitPrice(unitPrice, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Admin function to set a new price resolver or clear an existing one with `address(0)`.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param priceResolverAddress Price resolver contract address.
 * @param opts Operation options, gas, etc.
 */
export async function updatePriceResolver<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	priceResolverAddress: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.updatePriceResolver(
			priceResolverAddress,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.updatePriceResolver(
		priceResolverAddress,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Set NFT metadata base URI. URI must include the trailing slash.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param baseUri
 * @param reveal
 * @param opts Operation options, gas, etc.
 */
export async function setBaseURI<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	baseUri: string,
	reveal: boolean,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.setBaseURI(
			baseUri,
			reveal,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setBaseURI(baseUri, reveal, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Allows owner to transfer ERC20 balances.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param tokenAddress ERC20 token address.
 * @param to Destination address.
 * @param amount Amount to transfer.
 * @param opts Operation options, gas, etc.
 */
export async function transferTokenBalance<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	tokenAddress: string,
	to: string,
	amount: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.transferTokenBalance(
			tokenAddress,
			to,
			amount,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.transferTokenBalance(
		tokenAddress,
		to,
		amount,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Sets initial sale payout address.
 *
 * @param contractAddress Address of the NFT contract to invoke.
 * @param payoutReceiver Initial sale payout receiver.
 * @param opts Operation options, gas, etc.
 */
export async function setPayoutReceiver<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	payoutReceiver: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	// NOTE: We're using NFUToken here because it's the same ABI as NFToken, or atleast should be, and it's the only one with
	// setPayoutReceiver.
	const NFToken = await contracts[platform][get(readNetwork).alias].NFUToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.setPayoutReceiver(
			payoutReceiver,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setPayoutReceiver(
		payoutReceiver,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Sets royalty info.
 *
 * @param contractAddress Address of the NFT contract to invoke.
 * @param royaltyReceiver Payable royalties receiver.
 * @param royaltyRate Rate expressed in bps, can only be set once.
 * @param opts Operation options, gas, etc.
 */
export async function setRoyalties<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	royaltyReceiver: string,
	royaltyRate: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const NFToken = await contracts[platform][get(readNetwork).alias].NFToken();
	const contract = new ethers.Contract(contractAddress, NFToken.abi, actualProvider.getSigner());

	if (populateTxn) {
		return contract.populateTransaction.setRoyalties(
			royaltyReceiver,
			royaltyRate,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setRoyalties(
		royaltyReceiver,
		royaltyRate,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
