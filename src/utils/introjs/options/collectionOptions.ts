/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const collectionOptions = {
	steps: [
		{
			title: 'NFT Collections',
			element: '#user-collection',
			intro: 'Profile NFT draft and deployed collections are displayed here.',
		},
		{
			title: 'Example Collections',
			preChange: function () {
				this.element = document.querySelector('#example-collection-card');
				this.position = 'bottom';
			},
			intro:
				'This is an example collection card. You could see and edit collection details by clicking on it.',
		},
		{
			title: 'Create Collections',
			preChange: function () {
				this.element = document.querySelector('.create');
				this.position = 'bottom';
			},
			intro: 'To create your own collection click here.',
		},
	],
};
