import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from '../contractMap';
import { readContractByAddress } from '../contractReader';
import type { JBSplit } from '../types';
import type { ContractPlatform } from '$constants/platform';

/**
 * Creates an fixed price sale.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id to sell.
 * @param price Sale price.
 * @param duration Sale duration in seconds from the block in which it's included.
 * @param saleSplits Splits to send proceeds to, if empty, proceeds go to owner after fees if any.
 * @param memo String to include in the sale creation event, can be blank.
 * @param opts Operation options, gas, etc.
 */
export async function create<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	collectionAddress: string,
	item: number | BigNumber,
	price: number | BigNumber,
	duration: number | BigNumber,
	saleSplits: JBSplit[],
	memo: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	const contract = new ethers.Contract(
		contractAddress,
		FixedPriceSale.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.create(
			collectionAddress,
			item,
			price,
			duration,
			saleSplits,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.create(
		collectionAddress,
		item,
		price,
		duration,
		saleSplits,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Settles the sale if duration has not elapsed and the price is met. This action only transfers the token on sale to the buyer. To transfer sale proceeds, call `distributeProceeds`.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 * @param memo String to include in the settle event, can be blank.
 * @param opts Operation options, gas, etc.
 */
export async function takeOffer<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	collectionAddress: string,
	item: BigNumber,
	memo: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	const contract = new ethers.Contract(
		contractAddress,
		FixedPriceSale.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.takeOffer(
			collectionAddress,
			item,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.takeOffer(
		collectionAddress,
		item,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Transfers sale proceeds if any to the seller or splits defined by the sale. This operation will purge the sale from contract storage.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 * @param opts Operation options, gas, etc.
 */
export async function distributeProceeds<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	collectionAddress: string,
	item: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	const contract = new ethers.Contract(
		contractAddress,
		FixedPriceSale.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.distributeProceeds(
			collectionAddress,
			item,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.distributeProceeds(
		collectionAddress,
		item,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Returns the number of seconds until sale completion.
 *
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 
 * @param cache Option to cache the response in the environment.
 */
export async function timeLeft(
	platform: ContractPlatform,
	collectionAddress: string,
	item: number | BigNumber,
	contractAddress?: string,
	cache: boolean = false,
) {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	contractAddress = contractAddress ?? FixedPriceSale.address;
	const abi = FixedPriceSale.abi;

	return readContractByAddress(contractAddress, abi, 'timeLeft', [collectionAddress, item], cache);
}

/**
 * Returns the current price for a given sale.
 *
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 * @param contractAddress FixedPriceSale contract address to invoke.
 * @param cache Option to cache the response in the environment.
 */
export async function currentPrice(
	platform: ContractPlatform,
	collectionAddress: string,
	item: number | BigNumber,
	contractAddress?: string,
	cache: boolean = false,
) {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	contractAddress = contractAddress ?? FixedPriceSale.address;

	const abi = FixedPriceSale.abi;

	return readContractByAddress(
		contractAddress,
		abi,
		'currentPrice',
		[collectionAddress, item],
		cache,
	);
}

/**
 * Updates splits on an existing sale. Set to empty array in order to send proceeds to the seller account only after fees.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 * @param saleSplits Splits collection.
 * @param opts Operation options, gas, etc.
 */
export async function updateSaleSplits<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	collectionAddress: string,
	item: BigNumber,
	saleSplits: JBSplit[],
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	const contract = new ethers.Contract(
		contractAddress,
		FixedPriceSale.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.updateSaleSplits(
			collectionAddress,
			item,
			saleSplits,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.updateSaleSplits(
		collectionAddress,
		item,
		saleSplits,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Admin operation to set sale fee retained by the platform on successful sale completion. Admin account is determined by the "owner" field.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param feeRate Fee rate in bps.
 * @param opts Operation options, gas, etc.
 */
export async function setFeeRate<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	feeRate: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	const contract = new ethers.Contract(
		contractAddress,
		FixedPriceSale.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setFeeRate(
			feeRate,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setFeeRate(feeRate, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Enable or disable sale creation by accounts not explicitly registered via `addAuthorizedSeller`.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param allowPublicSales Flag.
 * @param opts Operation options, gas, etc.
 */
export async function setAllowPublicSales<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	allowPublicSales: boolean,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	const contract = new ethers.Contract(
		contractAddress,
		FixedPriceSale.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setAllowPublicSales(
			allowPublicSales,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setAllowPublicSales(
		allowPublicSales,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Sets the Juicebox terminal address that should receive collected sale fees.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param feeReceiverTerminalAddress Juicebox terminal address.
 * @param opts Operation options, gas, etc.
 */
export async function setFeeReceiver<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	feeReceiverTerminalAddress: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	const contract = new ethers.Contract(
		contractAddress,
		FixedPriceSale.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setFeeReceiver(
			feeReceiverTerminalAddress,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setFeeReceiver(
		feeReceiverTerminalAddress,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Adds an account to an explicit seller list.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param sellerAddress Account to add.
 * @param opts Operation options, gas, etc.
 */
export async function addAuthorizedSeller<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	sellerAddress: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	const contract = new ethers.Contract(
		contractAddress,
		FixedPriceSale.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.addAuthorizedSeller(
			sellerAddress,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.addAuthorizedSeller(
		sellerAddress,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Removes an account to an explicit seller list.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param sellerAddress Account to remove.
 * @param opts Operation options, gas, etc.
 */
export async function removeAuthorizedSeller<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	sellerAddress: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const FixedPriceSale = await contracts[platform][get(readNetwork).alias].FixedPriceSale();
	const contract = new ethers.Contract(
		contractAddress,
		FixedPriceSale.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.removeAuthorizedSeller(
			sellerAddress,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.removeAuthorizedSeller(
		sellerAddress,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
