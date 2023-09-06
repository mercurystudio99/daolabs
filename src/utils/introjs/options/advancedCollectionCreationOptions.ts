export const advancedCollectionCreationOptions = {
	steps: [
		{
			title: 'Welcome',
			intro:
				'Welcome to the advanced collection creator. This form creates a collection page, where you can add NFTs later.',
		},
		{
			title: 'Collection name',
			element: '#advanced-name',
			intro:
				'This is the name of your NFT collection. Marketplaces and wallets use this name to identify your collection.',
		},
		{
			title: 'Collection category',
			element: '#advanced-category',
			intro:
				"This is your collection's category. Categories help users find your collection. Pick the option which best describes your collection.",
		},
		{
			title: 'Collection description',
			element: '#advanced-description',
			intro:
				"This is your collection's description. Here, you can describe or add context to your NFT. This will be displayed in marketplaces and wallets.",
		},
		{
			title: 'Collection images',
			element: '#advanced-images',
			intro:
				'Within the images menu, you can add a logo, a feature image, and a banner image to your NFT collection.',
		},
		{
			title: 'Collection links',
			element: '#advanced-links',
			intro:
				"Within the links menu, you can add any amount of links to your collection's page. Add any social media profiles, chats, forums, or other websites related to your project.",
		},
		{
			title: 'Collection royalties',
			element: '#advanced-royalties',
			intro:
				'The royalty menu allows you to set a royalty percentage, which allows you to collect a fee when a user re-sells NFTs in your collection.',
		},
		{
			title: 'Collection customization',
			element: '#advanced-customization',
			intro:
				'The customization menu allows you to choose the color displayed while loading your collection on marketplaces.',
		},
		{
			title: 'Preview',
			intro:
				'As you populate the form, you will see a real-time preview of your NFT collection page here.',
			element: '.preview',
		},
		{
			title: 'Preview',
			element: '#preview',
			intro: 'Click here to open a fullscreen preview of your collection.',
		},
		{
			title: 'Confirm',
			element: '#submit',
			intro:
				"Click here to finish creating your collection. To create NFTs for your collection, visit your collection's page.",
		},
		{
			title: 'Advanced settings',
			element: '.advanced-icon',
			intro: 'Click here to hide advanced settings.',
		},
	],
	dontShowAgain: true,
};
