export const imageNftCreationOptions = {
	steps: [
		{
			title: 'Welcome',
			intro:
				'Welcome to the image NFT creator. This form allows you to add image NFTs to your collection.',
		},
		{
			title: 'NFT name',
			element: '#name-wrap',
			intro: 'This is the name of your NFT which is shown on marketplaces and wallets.',
		},
		{
			title: 'Total supply',
			element: '#totalSupply-wrap',
			intro: 'The supply is the total number of copies of your NFT which can be minted.',
		},
		{
			title: 'File upload',
			element: '#image-wrap',
			intro:
				"Drag and drop your NFT's content here. This could be an image, a .svg file, and a 3d model. For an animated NFT, upload a .gif file.",
		},
		{
			title: 'Optional fields',
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
