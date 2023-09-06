export interface EditionForm {
	testSuffix?: string;
	collectionName?: string;
	symbol?: string;
	description?: string;
	pathToFile?: string;
	price?: number | string;
	supply?: number | string;
	startTime?: {
		daysFromToday: number;
		time: string;
	};
	endTime?: {
		daysFromToday: number;
		time: string;
	};
	royalties?: {
		royaltiesRecipientAddress: string;
		royaltyPercentage: number | string;
	};
	payoutAddress?: string;
}
