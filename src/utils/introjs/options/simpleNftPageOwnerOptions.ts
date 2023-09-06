export const simpleNftPageOwnerOptions = {
	steps: [
		{
			title: 'Welcome',
			intro: 'This is collection page guide',
		},
		{
			title: 'Collection page',
			element: '.mint-info',
			intro: 'Here you can see the mint information',
		},
		{
			title: 'Collection page',
			element: '.mint-configuration',
			intro:
				'Here you can see mint preview, click plus and minus button to select number of items to mint',
		},
		{
			title: 'Collection page',
			element: '#mint',
			intro: 'Click here to start minting. You will need to connect your wallet first',
		},
		{
			title: 'Collection page',
			element: '.minter-list-wrap',
			intro: 'Here you will see recent mints of this collection',
		},
		{
			title: 'Collection page',
			element: '#tools',
			intro: 'Here you can withdraw the funds from this collection',
		},
		{
			title: 'Edit collection',
			element: '#settings',
			intro: 'Click here to open a tool to edit collection or export collection configuration',
		},
		{
			title: 'Collection page',
			element: '.back-icon',
			intro: 'Click here to go back to your user page',
		},
	],
	dontShowAgain: true,
};
