import { readNetwork } from '$stores/web3';
import { contracts } from './contractMap';
import { readContractByAddress } from './contractReader';
import type { BigNumber } from 'ethers';
import type { ContractPlatform } from '$constants/platform';

interface SplitReturnValue {
	percent: BigNumber;
	lockedUntil: BigNumber;
	projectId: BigNumber;
	beneficiary: string;
	allocator: string;
	preferClaimed: boolean;
	preferAddToBalance: boolean;
}

export async function splitsOf(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	configuration: number | BigNumber,
	payoutSplitGroup: number,
	cache: boolean = false,
): Promise<SplitReturnValue[]> {
	const JBSplitsStore = await contracts[platform][readNetwork.get().alias].JBSplitsStore();
	const contractAddress = JBSplitsStore.address;
	const abi = JBSplitsStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'splitsOf',
		[projectId, configuration, payoutSplitGroup],
		cache,
	)) as SplitReturnValue[];
}
