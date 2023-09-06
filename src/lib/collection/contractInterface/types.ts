export type AbiType = {
	type: string;
	name: string;
	constant: boolean;
	stateMutability: string;
	inputs: {
		name: string;
		type: string;
	}[];
	outputs?: {
		name: string;
		type: string;
	}[];
	payable: boolean;
};
