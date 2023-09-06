export const pfpNftCreationAdvancedOptions = {
	steps: [
		{
			title: 'Description',
			element: '#description-wrap',
			intro:
				"This is your NFT's description. Here, you can describe or add context to your NFT. This will be displayed in marketplaces and wallets.",
		},
		{
			title: 'External link',
			element: '#externalLink-wrap',
			intro:
				"You can specify a link for this NFT. Link to your project's website, social media profile, or community.",
		},
		{
			title: 'Color settings',
			element: '#pallette-wrap',
			intro:
				'The color settings allow you to designate a default background color pallette for this NFT.',
		},
		{
			title: 'Additional settings',
			element: '#additional-settings-wrap',
			intro:
				'The additional settings allow you to specify is this NFT has unlockable, explicit, or sensitive content, or to freeze this NFTs metadata.',
		},
	],
	dontShowAgain: true,
};
