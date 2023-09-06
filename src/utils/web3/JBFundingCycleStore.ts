import { readNetwork } from '$stores/web3';

import { contracts } from './contractMap';
import { readContractByAddress } from './contractReader';
import type { BigNumber } from 'ethers';
import type { V2FundingCycle } from '$models/v2/fundingCycle';
import type { ContractPlatform } from '$constants/platform';

export async function get(
	platform: ContractPlatform,
	projectId: BigNumber,
	configuration: BigNumber,
	cache: boolean = false,
): Promise<V2FundingCycle> {
	const JBFundingCycleStore = await contracts[platform][
		readNetwork.get().alias
	].JBFundingCycleStore();
	const contractAddress = JBFundingCycleStore.address;
	const abi = JBFundingCycleStore.abi;

	return (await readContractByAddress(
		contractAddress,
		abi,
		'get',
		[projectId, configuration],
		cache,
	)) as V2FundingCycle;
}
