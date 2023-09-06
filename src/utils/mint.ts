export const mintDateCheck = (startDate: number, endDate: number) => {
	const now = new Date().getTime();
	if (startDate > now || (endDate > 0 && endDate < now)) {
		return false;
	}
	return true;
};
