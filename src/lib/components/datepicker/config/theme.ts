const light = {
	calendar: {
		width: '700px',
		maxWidth: '100vw',
		legend: {
			height: '45px',
		},
		shadow: '0px 10px 26px rgba(0, 0, 0, 0.25)',
		colors: {
			text: {
				primary: 'var(--text-primary)',
				highlight: 'var(--text-over-brand-primary)',
			},
			background: {
				primary: 'var(--background-l0)',
				highlight: 'var(--background-action-primary)',
				hover: 'var(--background-disabled)',
			},
			border: 'var(--background-disabled)',
		},
		font: {
			regular: '16px',
			large: '37em',
		},
		grid: {
			disabledOpacity: '.35',
			outsiderOpacity: '.6',
		},
	},
};

const dark = {
	calendar: {
		width: '700px',
		maxWidth: '100vw',
		legend: {
			height: '45px',
		},
		shadow: '0px 10px 26px rgba(0, 0, 0, 0.25)',
		colors: {
			text: {
				primary: 'var(--text-primary)',
				highlight: 'var(--text-over-brand-primary)',
			},
			background: {
				primary: 'var(--background-l0)',
				highlight: 'var(--background-action-primary)',
				hover: 'var(--background-disabled)',
			},
			border: 'var(--background-disabled)',
		},
		font: {
			regular: '16px',
			large: '37em',
		},
		grid: {
			disabledOpacity: '.5',
			outsiderOpacity: '.7',
		},
	},
};

export { light, dark };
