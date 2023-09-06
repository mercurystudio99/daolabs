import { BigNumber, ethers, Contract, ContractFunction, ContractTransaction } from 'ethers';

export type ContractInput = {
	chainId: string;
	address: string;
	abi: any[];
	function: string;
	args: any[];
};

export class StatusError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

const networks = {
	1: 'mainnet',
	5: 'goerli',
};

type Network = 'mainnet' | 'goerli';

export function getRpcUrl(chainId: number): string {
	const networkName = networks[Number(chainId)] as Network;
	return `https://${networkName}.infura.io/v3/${process.env.INFURA_ID}`;
}

type ContractResponseData =
	| string
	| boolean
	| number
	| BigNumber
	| { [key: string]: unknown }
	| unknown[];

type ExtendedBigNumber = BigNumber & { hex: string };

export function parseContractResponse(data: unknown): ContractResponseData {
	if (['string', 'boolean', 'number'].includes(typeof data)) {
		return data as string | boolean | number;
	} else if (Array.isArray(data)) {
		const isObject = Object.keys(data).find((key) => key.match(/[^\d]/));
		if (isObject) {
			return parseContractResponse({ ...(data as unknown[]) });
		}
		return (data as unknown[]).map(parseContractResponse);
	} else if (data instanceof BigNumber || (data as BigNumber)._isBigNumber) {
		return BigNumber.from((data as ExtendedBigNumber).hex || (data as BigNumber)._hex);
	} else if (typeof data === 'object') {
		return Object.keys(data).reduce((acc: Record<string, unknown>, key: string) => {
			acc[key] = parseContractResponse((data as Record<string, unknown>)[key]);
			return acc;
		}, {});
	}
	return data as ContractResponseData;
}

export function validateContractInput(data: ContractInput): boolean {
	const { chainId, address, abi, function: fn, args } = data;
	return Boolean(chainId && address && abi && fn && args);
}

export async function handleContractWrite(data: ContractInput) {
	const { chainId, address, abi, function: fn, args } = data;
	try {
		const provider = new ethers.providers.JsonRpcProvider(getRpcUrl(Number(chainId)));
		const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
		const contract = new Contract(address, abi, provider).connect(wallet);
		const options = {
			gasLimit: 1000000,
		};
		const funcArgs = [...(args as unknown[]), options];
		const contractFn = contract[fn] as ContractFunction;
		const contractResponse = (await contractFn(...funcArgs)) as ContractTransaction;
		const receipt = await contractResponse.wait();
		// TODO: I guess we should create a notification here to user that the transaction has either succeeded or failed
		return receipt;
	} catch (error) {
		throw new StatusError((error as Error).message, 500);
	}
}
