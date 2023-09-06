import { BigNumber } from 'ethers';

import {
	type BaseProjectEntity,
	type BaseProjectEntityJson,
	parseBaseProjectEntityJson,
} from '$models/subgraph-entities/base/base-project-entity';

export interface Participant extends BaseProjectEntity {
	pv: string;
	address: string;
	wallet: string;
	totalPaid: BigNumber;
	balance: BigNumber;
	stakedBalance: BigNumber;
	unstakedBalance: BigNumber;
	lastPaidTimestamp: number;
}

export type ParticipantJson = Partial<Record<keyof Participant, string> & BaseProjectEntityJson>;

export const parseParticipantJson = (j: ParticipantJson): Partial<Participant> => ({
	...parseBaseProjectEntityJson(j),
	address: j.address,
	wallet: j.wallet,
	totalPaid: j.totalPaid ? BigNumber.from(j.totalPaid) : undefined,
	balance: j.balance ? BigNumber.from(j.balance) : undefined,
	stakedBalance: j.stakedBalance ? BigNumber.from(j.stakedBalance) : undefined,
	unstakedBalance: j.unstakedBalance ? BigNumber.from(j.unstakedBalance) : undefined,
	lastPaidTimestamp: j.lastPaidTimestamp ? parseInt(j.lastPaidTimestamp) : undefined,
});
