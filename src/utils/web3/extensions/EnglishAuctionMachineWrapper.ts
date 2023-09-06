import { ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from '../contractMap';
import { readContractByAddress } from '../contractReader';
import type { ContractPlatform } from '$constants/platform';

export async function bid<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const EnglishAuctionMachine = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionMachine();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionMachine.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.bid(opts) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.bid(opts) as ContractWrapperTxnReturnType<T>;
}

export async function settle<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const EnglishAuctionMachine = await contracts[platform][
		get(readNetwork).alias
	].EnglishAuctionMachine();
	const contract = new ethers.Contract(
		contractAddress,
		EnglishAuctionMachine.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.settle(opts) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.settle(opts) as ContractWrapperTxnReturnType<T>;
}

export async function timeLeft(
	platform: ContractPlatform,
	contractAddress: string,
	cache: boolean = false,
) {
	const { abi } = await contracts[platform][get(readNetwork).alias].EnglishAuctionMachine();

	return readContractByAddress(contractAddress, abi, 'timeLeft', [], cache);
}

export async function currentBidder(
	platform: ContractPlatform,
	contractAddress: string,
	cache: boolean = false,
) {
	const { abi } = await contracts[platform][get(readNetwork).alias].EnglishAuctionMachine();

	return readContractByAddress(contractAddress, abi, 'currentBidder', [], cache);
}

export async function currentBid(
	platform: ContractPlatform,
	contractAddress: string,
	cache: boolean = false,
) {
	const { abi } = await contracts[platform][get(readNetwork).alias].EnglishAuctionMachine();

	return readContractByAddress(contractAddress, abi, 'currentBid', [], cache);
}

export async function currentTokenId(
	platform: ContractPlatform,
	contractAddress: string,
	cache: boolean = false,
) {
	const { abi } = await contracts[platform][get(readNetwork).alias].EnglishAuctionMachine();

	return readContractByAddress(contractAddress, abi, 'currentTokenId', [], cache);
}

export async function auctionExpiration(
	platform: ContractPlatform,
	contractAddress: string,
	cache: boolean = false,
) {
	const { abi } = await contracts[platform][get(readNetwork).alias].EnglishAuctionMachine();

	return readContractByAddress(contractAddress, abi, 'auctionExpiration', [], cache);
}

export async function token(
	platform: ContractPlatform,
	contractAddress: string,
	cache: boolean = false,
) {
	const { abi } = await contracts[platform][get(readNetwork).alias].EnglishAuctionMachine();

	return readContractByAddress(contractAddress, abi, 'token', [], cache);
}
