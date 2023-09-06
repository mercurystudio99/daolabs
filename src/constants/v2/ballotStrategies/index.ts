import { constants } from 'ethers';

import { readNetwork } from '$stores/web3';

export type BallotStrategy = {
	name: string;
	description?: string;
	address: string;
};

const BALLOT_ADDRESSES: { [key: string]: { goerli: string; mainnet: string } } = {
	ONE_DAY: {
		goerli: '0xaf80eB05752aD2370eb9a595db5aE1Faec969d5F',
		mainnet: '',
	},
	THREE_DAY: {
		goerli: '0xA0939DE2b5fD91d41e1Dd9eE0aCE7CCBe12Bc2a8',
		mainnet: '0x4b9f876c7Fc5f6DEF8991fDe639b2C812a85Fb12',
	},
	SEVEN_DAY: {
		goerli: '0x687dC20Ff362C3A1E55c29851Cd0c14655b4DBb3',
		mainnet: '0x642EFF5259624FD09D021AB764a4b47d1DbD5770',
	},
};

export function ballotStrategies(
	networkAlias: 'goerli' | 'mainnet',
): { name: string; description: string; address: string }[] {
	return [
		{
			name: 'No strategy',
			description:
				'Any reconfiguration to an upcoming funding cycle will take effect once the current cycle ends. A project with no strategy may be vulnerable to being rug-pulled by its owner.',
			address: constants.AddressZero,
		},
		{
			name: '1-day delay',
			description:
				'A reconfiguration to an upcoming funding cycle must be submitted at least 1 day before it starts.',
			address: BALLOT_ADDRESSES.ONE_DAY[networkAlias],
		},
		{
			name: '3-day delay',
			description:
				'A reconfiguration to an upcoming funding cycle must be submitted at least 3 days before it starts.',
			address: BALLOT_ADDRESSES.THREE_DAY[networkAlias],
		},
		{
			name: '7-day delay',
			description:
				'A reconfiguration to an upcoming funding cycle must be submitted at least 7 days before it starts.',
			address: BALLOT_ADDRESSES.SEVEN_DAY[networkAlias],
		},
	];
}

export const getDefaultBallotStrategy = (): BallotStrategy =>
	ballotStrategies(readNetwork.get().alias)[1];
