import { blocknativeNetworks } from '$constants/networks';
import type { ContractMap } from './types';

function toContractMapObject(map: Record<string, () => Promise<unknown>>) {
	const result = Object.fromEntries(blocknativeNetworks.map((net) => [net.alias, {}]));
	for (const relativePath in map) {
		const contractName = relativePath.match(/.*\/(\w+).json/)?.[1];
		for (const network in result) {
			result[network][contractName] = async () => {
				const module = (await map[relativePath]()) as Record<string, string | []>;
				return { address: module[network], abi: module.abi };
			};
		}
	}
	return result;
}

export const contracts: ContractMap = {
	juicebox2: toContractMapObject(import.meta.glob('../../deployments/juicebox2/*.json')),
	juicebox3: toContractMapObject(import.meta.glob('../../deployments/juicebox3/*.json')),
	daolabs: toContractMapObject(import.meta.glob('../../deployments/daolabs/*.json')),
};

// async function test(name: string, map: typeof contracts) {
// 	const result: Record<string, Record<string, Record<string, {}>>> = {};
// 	for (const platform in map) {
// 		result[platform] = {};
// 		for (const net in map[platform]) {
// 			result[platform][net] = {};
// 			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
// 			for (const contractName in map[platform][net]) {
// 				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
// 				result[platform][net][contractName] = (await map[platform][net][
// 					contractName
// 				]?.()) as unknown;
// 			}
// 		}
// 	}
// 	console.log(`${name}:`);
// 	console.log(result);
// 	console.log(contracts[name]);
// }

// void test('contracts', contracts);
// // setInterval(test, 1000, 'contracts', contracts);
