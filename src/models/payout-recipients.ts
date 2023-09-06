export type Recipient = {
	address: string;
	percent: number;
	name?: string;
};

export const calculateTotalPercent = (recipients: Recipient[]): number =>
	recipients?.reduce((acc, recipient) => {
		acc += recipient.percent;
		return acc;
	}, 0) ?? 0;
