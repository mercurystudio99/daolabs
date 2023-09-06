import { get } from 'svelte/store';
import { readNetwork } from '$stores/web3';

import { readContractByAddress } from '../contractReader';
import { contracts } from '../contractMap';
import type { ContractPlatform } from '$constants/platform';

export async function symbol(
	platform: ContractPlatform,
	contractAddress?: string,
	cache: boolean = false,
): Promise<string> {
	const JB721TieredGovernance = await contracts[platform][
		get(readNetwork).alias
	].JB721TieredGovernance();

	contractAddress = contractAddress ?? JB721TieredGovernance.address;
	const abi = JB721TieredGovernance.abi;

	return (await readContractByAddress(contractAddress, abi, 'symbol', [], cache)) as string;
}
