export const musicNftCreationOptions = {
	steps: [
		{
			title: 'Welcome',
			intro: 'Welcome to the music NFT creator.',
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
			title: 'Album name',
			element: '#album-name-wrap',
			intro: 'The name of the album, which is a group of individual music files.',
		},
		{
			title: 'File upload',
			element: '#track-wrap',
			intro:
				"Drag and drop your NFT's content here. This could be an .mp3, a .sunvox, a .wav, or an .ogg.",
		},
		{
			title: 'Track name',
			element: '#track-name-wrap',
			intro:
				'By default, the name of your track will be read from the file metadata. You can manually set the name by entering information here.',
		},
		{
			title: 'Artist name',
			element: '#artist-name-wrap',
			intro:
				'By default, the artist name will be read from the file metadata. You can manually set the artist name by entering information here.',
		},
		{
			title: 'Playback',
			element: '#playback-wrap',
			intro:
				'Playback options control playback behaviour for wallets and marketplaces. You can select the amount of times the track should be played.',
		},
		{
			title: 'Confirm track',
			element: '#confirm-track',
			intro: 'Click here to finish creating your track or to add another track to this album.',
		},
		{
			title: 'Confirm album',
			element: '#confirm-album',
			intro: 'Click here to finish creating your album or to add another album to this NFT.',
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
