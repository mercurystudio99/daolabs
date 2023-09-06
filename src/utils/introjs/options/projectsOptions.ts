/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const projectsOptions = {
	steps: [
		{
			title: 'Juicebox Projects',
			element: '#user-projects',
			intro:
				'Juicebox projects are shared treasuries which can issue tokens to faciliate governance, or act as a reward mechanism for early contributors.',
		},
		{
			title: 'Example Juicebox Project',
			preChange: function () {
				this.element = document.querySelector('#example-project-card');
				this.position = 'bottom';
			},
			intro:
				'This is an example juicebox project. You could see and edit project details by clicking on it.',
		},
		{
			title: 'Create Juicebox Project',
			preChange: function () {
				this.element = document.querySelector('.create');
				this.position = 'bottom';
			},
			intro: 'To create your own juicebox project click here.',
		},
	],
};
