export const projectCreationOptions = {
	steps: [
		{
			title: 'Welcome',
			intro:
				'You can enter information on the left side of your screen—the right side is a preview. <br/>You could get detailed guide <a href="https://youtu.be/pJszOKMxYNE" alt="youtube video" target="_blank">here</a>',
			scrollToElement: false,
		},
		{
			title: 'Preview',
			element: '.preview',
			intro: 'This is preview section',
			scrollToElement: false,
		},
		{
			title: 'Required fields',
			element: '#name-wrap',
			intro: 'Enter project name here',
		},
		{
			title: 'Optional fields',
			element: '#description-wrap',
			intro: 'Enter project description',
		},
		{
			title: 'Optional fields',
			element: '#icon-wrap',
			intro: 'You can upload a logo here',
		},
		{
			title: 'Optional fields',
			element: '#infoUri-wrap',
			intro: 'External link for project information',
		},
		{
			title: 'Optional fields',
			element: '#twitter-wrap',
			intro: 'Link to twitter',
		},
		{
			title: 'Optional fields',
			element: '#discord-wrap',
			intro: 'Link to discord',
		},
		{
			title: 'Optional fields',
			element: '#telegram-wrap',
			intro: 'Link to telegram',
		},
		{
			title: 'Optional fields',
			element: '#payButton-wrap',
			intro: 'You can change text on "pay" button',
		},
		{
			title: 'Optional fields',
			element: '#payDisclosure-wrap',
			intro: 'And describe pay desclosure',
		},
		{
			title: 'Confirm',
			element: '#next',
			intro: 'Click here to proceed',
		},
	],
	dontShowAgain: true,
};
