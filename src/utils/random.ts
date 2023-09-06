export const getRandomInt = (max: number): number => Math.floor(Math.random() * Math.floor(max));

export const getRandomColor = (colors: string[]) => {
	if (!colors || colors.length === 0) {
		return 'var(--background-l1)';
	}
	const index = Math.floor(Math.random() * colors.length);
	return colors[index];
};
