import { readNetwork } from '$stores/web3';
import { readContractByAddress } from './contractReader';
import { contracts } from './contractMap';
import type { BigNumber } from 'ethers';
import type { ContractPlatform } from '$constants/platform';

export async function loadHandle(
	platform: ContractPlatform,
	projectId: number | BigNumber,
	cache: boolean = false,
): Promise<any> {
	try {
		const JBProjectHandles = await contracts[platform][readNetwork.get().alias].JBProjectHandles();
		const contractAddress = JBProjectHandles.address;
		const abi = JBProjectHandles.abi;

		return <unknown>(
			await readContractByAddress(contractAddress, abi, 'ensNamePartsOf', [projectId], cache)
		);
	} catch (error) {
		console.log('error loading handle');
	}
}
