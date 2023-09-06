import { BigNumber, ethers, type BytesLike } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from './contractMap';
import { JBCURRENCIES_ETH, JBTOKENS_ETH } from './types';
import type { ContractPlatform } from '$constants/platform';

export async function pay<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	amount: number | BigNumber,
	token: string,
	beneficiary: string,
	minReturnedTokens: number | BigNumber,
	preferClaimedTokens: boolean,
	memo: string,
	metadata: BytesLike,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBETHPaymentTerminal = await contracts[platform][
		get(readNetwork).alias
	].JBETHPaymentTerminal();
	const contract = new ethers.Contract(
		JBETHPaymentTerminal.address,
		JBETHPaymentTerminal.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.pay(
			projectId,
			amount,
			token,
			beneficiary,
			minReturnedTokens,
			preferClaimedTokens,
			memo,
			metadata,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.pay(
		projectId,
		amount,
		token,
		beneficiary,
		minReturnedTokens,
		preferClaimedTokens,
		memo,
		metadata,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function addToBalanceOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	amount: number | BigNumber,
	token = JBTOKENS_ETH,
	memo: string = '',
	metadata: BytesLike = '',
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBETHPaymentTerminal = await contracts[platform][
		get(readNetwork).alias
	].JBETHPaymentTerminal();
	const contract = new ethers.Contract(
		JBETHPaymentTerminal.address,
		JBETHPaymentTerminal.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.addToBalanceOf(
			projectId,
			amount,
			token,
			memo,
			metadata,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.addToBalanceOf(
		projectId,
		amount,
		token,
		memo,
		metadata,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function redeemTokensOf<T extends boolean = false>(
	platform: ContractPlatform,
	holder: string,
	projectId: number | BigNumber,
	tokenAmount: number | BigNumber,
	token: string,
	minReturnedTokens: number | BigNumber,
	beneficiary: string,
	memo: string = '',
	metadata: BytesLike = '',
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBETHPaymentTerminal = await contracts[platform][
		get(readNetwork).alias
	].JBETHPaymentTerminal();
	const contract = new ethers.Contract(
		JBETHPaymentTerminal.address,
		JBETHPaymentTerminal.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.redeemTokensOf(
			holder,
			projectId,
			tokenAmount,
			token,
			minReturnedTokens,
			beneficiary,
			memo,
			metadata,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.redeemTokensOf(
		holder,
		projectId,
		tokenAmount,
		token,
		minReturnedTokens,
		beneficiary,
		memo,
		metadata,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function distributePayoutsOf<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	amount: number | BigNumber,
	minReturnedTokens: number | BigNumber,
	currency: number = JBCURRENCIES_ETH,
	token: string = JBTOKENS_ETH,
	memo: string = '',
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBETHPaymentTerminal = await contracts[platform][
		get(readNetwork).alias
	].JBETHPaymentTerminal();
	const contract = new ethers.Contract(
		JBETHPaymentTerminal.address,
		JBETHPaymentTerminal.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.distributePayoutsOf(
			projectId,
			amount,
			currency,
			token,
			minReturnedTokens,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.distributePayoutsOf(
		projectId,
		amount,
		currency,
		token,
		minReturnedTokens,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
