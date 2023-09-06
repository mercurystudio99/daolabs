export const videoNftCreationOptions = {
	steps: [
		{
			title: 'Welcome',
			intro: 'Welcome to the video NFT creator. Your NFT can be a .mp4 or a .webm file.',
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
			title: 'File upload',
			element: '#video-wrap',
			intro: "Drag and drop your NFT's content here. This could be a .mp4 or a .webm file.",
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
