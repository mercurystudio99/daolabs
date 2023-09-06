export const getFileSizeString = (size: number) => {
	let units = 'bytes';
	let result = size;
	if (result / 1000 > 1) {
		result /= 1000;
		units = 'kb';
		if (result / 1000 > 1) {
			result /= 1000;
			units = 'mb';
		}
		if (result / 1000 > 1) {
			result /= 1000;
			units = 'gb';
		}
	}
	return `${result.toFixed(2)}${units}`;
};
