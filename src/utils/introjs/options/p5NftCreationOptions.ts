export const p5NftCreationOptions = {
	steps: [
		{
			title: 'Welcome',
			intro: 'Welcome to the p5.js NFT creator. Your NFT must be a .js file.',
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
			element: '#script-upload-wrap',
			intro: "Drag and drop your NFT's content here. This should be a .js file.",
		},
		{
			title: 'Manual enter',
			element: '#script-wrap',
			intro: 'Optionally, you can paste or manually enter your script here.',
		},
		{
			title: 'Editor',
			element: '#editor',
			intro: 'Click this button to open an editor with syntax highlighting and script testing.',
		},
		{
			title: 'Clear',
			element: '#clear',
			intro: 'Click this button to clear your input.',
		},
		{
			title: 'Play',
			element: '#play',
			intro: 'Click here to populate the preview section with your script.',
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
