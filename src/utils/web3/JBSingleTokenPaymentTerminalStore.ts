import { readNetwork } from '$stores/web3';
import { contracts } from './contractMap';
import { readContractByAddress } from './contractReader';
import type { BigNumber } from 'ethers';
import type { ContractPlatform } from '$constants/platform';

export async function currentOverflowOf(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	terminalAddress: string,
	cache: boolean = false,
): Promise<BigNumber> {
	const JBSingleTokenPaymentTerminalStore = await contracts[platform][
		readNetwork.get().alias
	].JBSingleTokenPaymentTerminalStore();
	const contractAddress = JBSingleTokenPaymentTerminalStore.address;
	const abi = JBSingleTokenPaymentTerminalStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'currentOverflowOf',
		[terminalAddress, projectId],
		cache,
	)) as BigNumber;
}

export async function balanceOf(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	terminalAddress: string,
	cache: boolean = false,
): Promise<BigNumber> {
	const JBSingleTokenPaymentTerminalStore = await contracts[platform][
		readNetwork.get().alias
	].JBSingleTokenPaymentTerminalStore();
	const contractAddress = JBSingleTokenPaymentTerminalStore.address;
	const abi = JBSingleTokenPaymentTerminalStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'balanceOf',
		[terminalAddress, projectId],
		cache,
	)) as BigNumber;
}
