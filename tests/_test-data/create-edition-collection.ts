import { EditionForm } from '../pageObjects/interfaces/EditionForm.js';

export const editionDetails: EditionForm[] = [
	{
		testSuffix: 'Required fields',
		collectionName: `Edition Required ${Date.now()}`,
		pathToFile: 'tests/files/fox.jpg',
	},
	{
		testSuffix: 'All fields',
		collectionName: `Edition All ${Date.now()}`,
		symbol: '$SMB&',
		description: 'Edition collection testing',
		pathToFile: 'tests/files/fox.jpg',
		price: 4000,
		supply: 0,
		startTime: {
			daysFromToday: 0,
			time: '2:00 AM',
		},
		endTime: {
			daysFromToday: 0,
			time: '11:45 PM',
		},
		royalties: {
			royaltiesRecipientAddress: process.env.METAMASK_TEST_ACCOUNT,
			royaltyPercentage: 14,
		},
		payoutAddress: process.env.METAMASK_TEST_ACCOUNT,
	},
];
