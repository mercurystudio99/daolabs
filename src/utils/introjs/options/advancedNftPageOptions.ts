export const advancedNftPageOptions = {
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
		// Momentarily disabled as we don't show simulation to visitor
		// {
		//     title: 'Collection page',
		//     element: '.simulation',
		//     intro: 'Click here to see a table of NFTs in this collection, click each one to see details'
		// },
		{
			title: 'Collection page',
			element: '.back-icon',
			intro: 'Click here to go back to your user page',
		},
	],
	dontShowAgain: true,
};
