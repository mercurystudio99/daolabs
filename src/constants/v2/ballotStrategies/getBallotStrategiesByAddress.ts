import { readNetwork } from '$stores/web3';
import { createCustomStrategy } from '$utils/ballot';

import { ballotStrategies } from '.';

// Put in separate files because lingui.js t macro was not working on ballot strategies
export const getBallotStrategyByAddress = (address: string) => {
	const strategies =
		ballotStrategies(readNetwork.get().alias).find(
			(s: { address: string }) => s.address.toLowerCase() === address.toLowerCase(),
		) ?? createCustomStrategy(address);
	return strategies;
};
