/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const revenueSplitOptions = {
	steps: [
		{
			title: 'Revenue splits',
			element: '#user-revenue',
			intro:
				'Revenue splits are custom Ethereum contracts which allow you to create a single address which always splits the incoming Ethereum based on the percentages you provide.',
		},
		{
			title: 'Example Revenue split',
			preChange: function () {
				this.element = document.querySelector('#example-revenue-split');
				this.position = 'bottom';
			},
			intro:
				"Enumerate the components of the first revenue split contract.  If the user hasn't created one, then display a default splitter with 80% opacity as an example.",
		},
		{
			title: 'Create Revenue Split',
			preChange: function () {
				this.element = document.querySelector('.create');
				this.position = 'bottom';
			},
			intro: 'To create your own revenue split click here.',
		},
	],
};
