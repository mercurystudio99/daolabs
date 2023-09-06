import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from '../contractMap';
import { readContractByAddress } from '../contractReader';
import type { JBSplit } from '../types';
import type { ContractPlatform } from '$constants/platform';

/**
 * Creates an English auction.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id to auction.
 * @param startingPrice Auction starting price.
 * @param reservePrice Auction reserve price, can be 0 to disable reserve.
 * @param duration Auction duration in seconds from the block in which it's included.
 * @param saleSplits Splits to send proceeds to, if empty, proceeds go to owner after fees if any.
 * @param memo String to include in the auction creation event, can be blank.
 * @param opts Operation options, gas, etc.
 */
export async function create<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	collectionAddress: string,
	item: BigNumber,
	startingPrice: BigNumber,
	reservePrice: BigNumber,
	duration: BigNumber,
	saleSplits: JBSplit[],
	memo: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.create(
			collectionAddress,
			item,
			startingPrice,
			reservePrice,
			duration,
			saleSplits,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.create(
		collectionAddress,
		item,
		startingPrice,
		reservePrice,
		duration,
		saleSplits,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Places a bid on an existing auction.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 * @param memo String to include in the bid event, can be blank.
 * @param opts Operation options, gas, etc.
 */
export async function bid<T extends boolean = false>(
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
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.bid(
			collectionAddress,
			item,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.bid(
		collectionAddress,
		item,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Settles the auction if duration has elapsed. This action only transfers the token on sale to the bidder or back to the seller. To additionally transfer auction proceeds, call `distributeProceeds`.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 * @param memo String to include in the settle event, can be blank.
 * @param opts Operation options, gas, etc.
 */
export async function settle<T extends boolean = false>(
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
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.settle(
			collectionAddress,
			item,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.settle(
		collectionAddress,
		item,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Transfers auction proceeds if any to the seller or splits defined by the auction. Optionally transfers to token if `settle` operation has not been executed yet. This operation will purge the auction from contract storage.
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
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
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
 * Returns the number of seconds until auction completion.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 * @param cache Option to cache the response in the environment.
 */
export async function timeLeft(
	platform: ContractPlatform,
	contractAddress: string,
	collectionAddress: string,
	item: BigNumber,
	cache: boolean = false,
) {
	const { abi } = await contracts[platform][get(readNetwork).alias].EnglishAuctionHouse();

	return readContractByAddress(contractAddress, abi, 'timeLeft', [collectionAddress, item], cache);
}

/**
 * Returns the current price for a given auction.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 * @param cache Option to cache the response in the environment.
 */
export async function currentPrice(
	platform: ContractPlatform,
	contractAddress: string,
	collectionAddress: string,
	item: BigNumber,
	cache: boolean = false,
) {
	const { abi } = await contracts[platform][get(readNetwork).alias].EnglishAuctionHouse();

	return readContractByAddress(
		contractAddress,
		abi,
		'currentPrice',
		[collectionAddress, item],
		cache,
	);
}

/**
 * Updates splits on an existing auction. Set to empty array in order to send proceeds to the seller account only after fees.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param collectionAddress ERC721 contract address.
 * @param item Token id.
 * @param saleSplits Splits collection.
 * @param opts Operation options, gas, etc.
 */
export async function updateAuctionSplits<T extends boolean = false>(
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
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.updateAuctionSplits(
			collectionAddress,
			item,
			saleSplits,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.updateAuctionSplits(
		collectionAddress,
		item,
		saleSplits,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Admin operation to set auction fee retained by the platform on successful auction completion. Admin account is determined by the "owner" field.
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
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
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
 * Enable or disable auction creation by accounts not explicitly registered via `addAuthorizedSeller`.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param allowPublicAuctions Flag.
 * @param opts Operation options, gas, etc.
 */
export async function setAllowPublicAuctions<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	allowPublicAuctions: boolean,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.setAllowPublicAuctions(
			allowPublicAuctions,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setAllowPublicAuctions(
		allowPublicAuctions,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Sets the Juicebox terminal address that should receive collected auction fees.
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
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
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
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
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
	const EnglishAuctionHouse = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionHouse();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionHouse.abi,
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
