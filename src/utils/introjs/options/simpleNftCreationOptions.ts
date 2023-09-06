export const simpleNftCreationOptions = {
	steps: [
		{
			title: 'Edition Collection',
			intro:
				'Welcome to the edition collection creator.  This form distills the most essential NFT collection features into a single form.',
		},
		{
			title: 'Edition name',
			element: '#edition-name',
			intro:
				'This is the name of your NFT collection. Marketplaces and wallets use this name to identify your collection.',
		},
		{
			title: 'Edition symbol',
			element: '#edition-symbol',
			intro:
				"This is your NFT collection's symbol. Symbols are generally a 3-6 character long acronym or abbreviation. If your symbol is left blank, one will be created for you.",
		},
		{
			title: 'Edition description',
			element: '#edition-description',
			intro:
				"This is your NFT collection's description. Here, you can describe or add context to your NFT. This will be displayed in marketplaces and wallets.",
		},
		{
			title: 'File upload',
			element: '.dropzone',
			intro:
				"Drag and drop your NFT collection's content here. This could be an image, an svg, a video file, an audio file, or a 3D model. Each edition collection is limited to 1 file.",
			dontShowAgain: false,
		},
		{
			title: 'Price per NFT',
			element: '#edition-price',
			intro:
				'Enter the ETH price per NFT in your collection here. If your price is zero, buyers will only pay a gas fee to mint from your collection.',
		},
		{
			title: 'Supply',
			element: '#edition-supply',
			intro:
				'The supply is the total number of copies of your NFT which can be minted. Enter 0 for unlimited mints.',
		},
		{
			title: 'Duration',
			element: '#edition-duration',
			intro: 'Minting will be possible between the start and end time defined here.',
		},
		{
			title: 'Royalties',
			element: '#edition-royalties',
			intro:
				'The royalty menu allows you to set a royalty percentage, which allows you to collect a fee when a user re-sells NFTs in your collection.',
		},
		{
			title: 'Payout Addresses',
			element: '#edition-payouts',
			intro:
				"The Ethereum address or Juicebox project you enter here will receive the collection's revenues.",
		},
		{
			title: 'Edition Preview',
			intro:
				'As you populate the form, you will see a real-time preview of your NFT collection page here.',
			element: '.preview',
		},
	],
	dontShowAgain: true,
};
