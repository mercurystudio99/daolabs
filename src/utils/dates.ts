export const getCurrentDateForInput = (): string => {
	const today = new Date();
	const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

	return date;
};

export const getCurrentDate = (): string => new Date(new Date().setHours(0, 0, 0, 0)).toJSON();

export const englishOrdinalSuffix = (dt: Date): string => {
	const monthArr = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	const [date, year, month] = [dt.getDate(), dt.getFullYear(), dt.getMonth()];
	return `${monthArr[month]} ${date}${
		date % 10 == 1 && date != 11
			? 'st'
			: date % 10 == 2 && date != 12
			? 'nd'
			: date % 10 == 3 && date != 13
			? 'rd'
			: 'th'
	}, ${year}`;
};

export const formatDateForMinter = (date: Date): string => {
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	const hours = `${date.getHours()}`.padStart(2, '0');
	const minutes = `${date.getMinutes()}`.padStart(2, '0');
	const seconds = `${date.getSeconds()}`.padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}-${hours}.${minutes}.${seconds}`;
};
