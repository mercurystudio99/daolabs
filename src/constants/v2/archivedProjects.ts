import { readNetwork } from '$stores/web3';
import { NetworkName } from '$models/network-name';
import { V2_PROJECT_IDS } from './projectIds';

const { SUSTAIN_DAO_A, SUSTAIN_DAO_B, JUS_DAO, ELONS_GAMES, INVESTORS_EDGE_DAO } = V2_PROJECT_IDS;

const V2ArchivedProjectIdsByNetwork: Partial<Record<NetworkName, number[]>> = {
	[NetworkName.mainnet]: [SUSTAIN_DAO_A, SUSTAIN_DAO_B, JUS_DAO, ELONS_GAMES, INVESTORS_EDGE_DAO],
	[NetworkName.goerli]: [
		//
	],
};

export const V2ArchivedProjectIds = () =>
	V2ArchivedProjectIdsByNetwork[readNetwork.get().alias] ?? [];
