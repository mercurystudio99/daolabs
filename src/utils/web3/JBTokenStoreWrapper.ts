import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import ERC20ContractAbi from '$constants/ERC20ContractAbi';
import { contracts } from './contractMap';
import { readContractByAddress } from './contractReader';
import type { ContractPlatform } from '$constants/platform';

export async function claimFor<T extends boolean = false>(
	platform: ContractPlatform,
	account: string,
	projectId: BigNumber | number,
	amount: BigNumber | number,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBTokenStore = await contracts[platform][get(readNetwork).alias].JBTokenStore();
	const contract = new ethers.Contract(
		JBTokenStore.address,
		JBTokenStore.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.claimFor(
			account,
			projectId,
			amount,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.claimFor(
		account,
		projectId,
		amount,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function transferFrom<T extends boolean = false>(
	platform: ContractPlatform,
	source: string,
	projectId: BigNumber | number,
	amount: BigNumber | number,
	destination: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBTokenStore = await contracts[platform][get(readNetwork).alias].JBTokenStore();
	const contract = new ethers.Contract(
		JBTokenStore.address,
		JBTokenStore.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.transferFrom(
			source,
			projectId,
			destination,
			amount,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.transferFrom(
		source,
		projectId,
		destination,
		amount,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

export async function tokenOf(
	platform: ContractPlatform,
	projectId: BigNumber,
	cache: boolean = false,
): Promise<string> {
	const JBTokenStore = await contracts[platform][get(readNetwork).alias].JBTokenStore();
	const contractAddress = JBTokenStore.address;
	const abi = JBTokenStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'tokenOf',
		[projectId],
		cache,
	)) as string;
}

export async function balanceOf(
	platform: ContractPlatform,
	projectId: BigNumber,
	account: string,
	cache: boolean = false,
): Promise<any> {
	const JBTokenStore = await contracts[platform][get(readNetwork).alias].JBTokenStore();
	const contractAddress = JBTokenStore.address;
	const abi = JBTokenStore.abi;

	return readContractByAddress(contractAddress, abi, 'balanceOf', [account, projectId], cache);
}

export async function claimedBalanceOf(
	platform: ContractPlatform,
	tokenAddress: string,
	account: string,
	cache: boolean = false,
): Promise<any> {
	const contractAddress = tokenAddress;
	const abi = ERC20ContractAbi;

	return readContractByAddress(contractAddress, abi, 'balanceOf', [account], cache);
}

export async function unclaimedBalanceOf(
	platform: ContractPlatform,
	projectId: BigNumber,
	account: string,
	cache: boolean = false,
): Promise<any> {
	const JBTokenStore = await contracts[platform][get(readNetwork).alias].JBTokenStore();
	const contractAddress = JBTokenStore.address;
	const abi = JBTokenStore.abi;

	return readContractByAddress(
		contractAddress,
		abi,
		'unclaimedBalanceOf',
		[account, projectId],
		cache,
	);
}

export async function totalSupplyOf(
	platform: ContractPlatform,
	projectId: BigNumber,
	cache: boolean = false,
): Promise<BigNumber> {
	const JBTokenStore = await contracts[platform][get(readNetwork).alias].JBTokenStore();
	const contractAddress = JBTokenStore.address;
	const abi = JBTokenStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'totalSupplyOf',
		[projectId],
		cache,
	)) as BigNumber;
}

export async function unclaimedTotalSupplyOf(
	platform: ContractPlatform,
	projectId: BigNumber,
	cache: boolean = false,
): Promise<BigNumber> {
	const JBTokenStore = await contracts[platform][get(readNetwork).alias].JBTokenStore();
	const contractAddress = JBTokenStore.address;
	const abi = JBTokenStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'unclaimedTotalSupplyOf',
		[projectId],
		cache,
	)) as BigNumber;
}

// v3
export async function issueFor<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber | number,
	name: string,
	symbol: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const JBTokenStore = await contracts[platform][get(readNetwork).alias].JBTokenStore();
	const contract = new ethers.Contract(
		JBTokenStore.address,
		JBTokenStore.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.issueFor(
			projectId,
			name,
			symbol,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.issueFor(
		projectId,
		name,
		symbol,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

// export async function unclaimedBalanceOf(
// 	platform: ContractPlatform,
// 	projectId: number | BigNumber,
// 	accountAddress: string,
// 	cache: boolean = false,
// ): Promise<BigNumber> {
// 	const contractAddress = contracts[platform][readNetwork.get().alias].JBTokenStore.address;
// 	const abi = contracts[platform][readNetwork.get().alias].JBTokenStore.abi;

// 	return (await readContractByAddress(
// 		contractAddress,
// 		abi,
// 		'unclaimedBalanceOf',
// 		[accountAddress, projectId],
// 		cache,
// 	)) as BigNumber;
// }

// export async function balanceOf(
// 	platform: ContractPlatform,
// 	projectId: number | BigNumber,
// 	accountAddress: string,
// 	cache: boolean = false,
// ): Promise<BigNumber> {
// 	const contractAddress = contracts[platform][readNetwork.get().alias].JBTokenStore.address;
// 	const abi = contracts[platform][readNetwork.get().alias].JBTokenStore.abi;

// 	return (await readContractByAddress(
// 		contractAddress,
// 		abi,
// 		'balanceOf',
// 		[accountAddress, projectId],
// 		cache,
// 	)) as BigNumber;
// }
