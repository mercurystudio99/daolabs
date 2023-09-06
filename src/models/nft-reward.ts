export enum ThresholdType {
	SUPPORTERS = 'supporters',
	AMOUNT = 'amount',
}

export type NftReward = {
	thresholdType: ThresholdType;
	threshold: number;
	supply: number;
	file: string;
	name: string;
	link: string;
	description: string;
};
