export const pfpNftCreationOptions = {
	steps: [
		{
			title: 'Welcome',
			intro:
				'Welcome to the pfp NFT creator. This form allows you to add layers of NFTs to your collection.',
		},
		{
			title: 'Name',
			element: '#name-wrap',
			intro: 'This is the name of your NFT, which is shown on marketplaces and wallets.',
		},
		{
			title: 'Total supply',
			element: '#totalSupply-wrap',
			intro: 'The supply is the total number of copies of your NFT which can be minted.',
		},
		{
			title: 'Add attributes',
			element: '#single-add',
			intro: 'You could upload images for each attribute of this NFT.',
		},
		{
			title: 'Add attributes',
			element: '#multi-add',
			intro:
				'Drag and drop directories of images and this will automatically set attributes name same as names of directories for this NFT.',
		},
		{
			title: 'Advanced settings',
			element: '#advanced',
			intro: 'Click here to hide advanced settings.',
		},
		{
			title: 'Confirm',
			element: '#submit',
			intro: 'Click here to finish creating your NFT.',
		},
	],
	dontShowAgain: true,
};
