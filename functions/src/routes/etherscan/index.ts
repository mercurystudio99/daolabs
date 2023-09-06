import { providers } from 'ethers';
import { whatsabi } from '@shazow/whatsabi';
import { Request, Response } from 'express';
import { ABIFunction } from '@shazow/whatsabi/lib/abi';
import fetch from 'cross-fetch';

export async function getContractSourceCode(address: string) {
	const response = await fetch(
		`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`,
	);
	const data = (await response.json()) as {
		status: string;
		message: string;
		result: {
			SourceCode: string;
			ABI: string;
			ContractName: string;
			CompilerVersion: string;
			OptimizationUsed: string;
			Runs: number;
			ConstructorArguments: string;
			EVMVersion: string;
			Library: string;
			LicenseType: string;
			Proxy: string;
			Implementation: string;
			SwarmSource: string;
		}[];
	};
	if (!data.result[0].SourceCode) {
		return null;
	}
	return data.result[0];
}

const abiCache: Record<
	string,
	{
		SourceCode: string;
		ABI: any;
		ContractName: string;
		CompilerVersion: string;
		OptimizationUsed: string;
		Runs: number;
		ConstructorArguments: string;
		EVMVersion: string;
		Library: string;
		LicenseType: string;
		Proxy: string;
		Implementation: string;
		SwarmSource: string;
	}
> = {};

const networks: Record<string, string> = {
	'1': 'homestead',
	'5': 'goerli',
};

export async function getContractAbi(req: Request, response: Response) {
	const { network } = req.query;
	const { address } = req.params || {};

	if (abiCache[address]) {
		response.json(abiCache[address]);
		return;
	}

	const contract = await getContractSourceCode(address);
	if (contract) {
		abiCache[address] = contract;
		response.json(contract);
		return;
	}

	if (!networks[String(network)]) {
		throw new Error('Unsupported network');
	}
	const chain: string = networks[String(network)];

	const provider = new providers.AlchemyProvider(chain, process.env.ALCHEMY_API_KEY);
	const code = await provider.getCode(address);

	const abi = whatsabi.abiFromBytecode(code);

	const signatureLookup = new whatsabi.loaders.SamczunSignatureLookup();
	const functions = abi.filter((f) => f.type === 'function') as ABIFunction[];

	const ABI = [];
	for (const func of functions) {
		const [fn] = await signatureLookup.loadFunctions(func?.selector);
		const ab = {
			inputs: [],
			name: '',
			outputs: [],
			stateMutability: '',
			type: '',
		};

		if (fn) {
			const regex = /.*\((.*)\)/gm;
			const regexName = /[\s\S]*?(?=\()/gm;
			const [name] = regexName.exec(fn);

			ab.name = name;
			ab.type = 'function';

			const m = regex.exec(fn);

			if (m) {
				const inputType = m.at(1);
				if (inputType) {
					ab.inputs.push({
						internalType: inputType,
						name: '',
						type: inputType,
					});
				}
			}
			ABI.push(ab);
		}
	}

	abiCache[address] = {
		SourceCode: '',
		ABI: ABI,
		ContractName: '',
		CompilerVersion: '',
		OptimizationUsed: '',
		Runs: 0,
		ConstructorArguments: '',
		EVMVersion: '',
		Library: '',
		LicenseType: '',
		Proxy: '',
		Implementation: '',
		SwarmSource: '',
	};

	response.json(abiCache[address]);
	return;
}
