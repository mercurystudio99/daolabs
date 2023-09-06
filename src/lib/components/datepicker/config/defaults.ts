import { add } from 'date-fns';

const calendar = {
	selected: new Date(),
	start: add(new Date(), { years: -5 }),
	end: add(new Date(), { years: 15 }),
	format: 'MM/dd/yyyy',
};

export { calendar };
