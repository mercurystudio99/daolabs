export const nftCreationNextOptions = {
	steps: [
		{
			title: 'Congratulations!',
			intro: 'Your NFT is ready. Now you can change advanced settings or add another NFT',
		},
		{
			title: 'Add another',
			intro: 'Click here to add another NFT',
			element: '#add-another',
		},
		{
			title: 'Additional settings',
			intro: 'You can set target supply for collection here',
			element: '#target-supply',
		},
		{
			title: 'Additional settings',
			intro: 'Check here if you want this collection to be randomized',
			element: '#randomize',
		},
		{
			title: 'Additional settings',
			intro: 'Check here set a reveal date',
			element: '#reveal',
		},
		{
			title: 'Confirm',
			intro: 'Click here to finish NFT creation',
			element: '#review',
		},
	],
	dontShowAgain: true,
};
