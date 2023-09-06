import {
	addMonths,
	addYears,
	startOfDay,
	compareAsc,
	getYear,
	getMonth,
	getDate,
	setYear,
	setMonth,
	setDate,
} from 'date-fns';
import {
	writable,
	get as getFromStore,
	type Subscriber,
	type Unsubscriber,
	type Updater,
} from 'svelte/store';

export type DatepickerState = {
	open: boolean;
	hasChosen: boolean;
	selected: Date;
	start: Date;
	end: Date;
	shouldEnlargeDay: boolean;
	enlargeDay: boolean;
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	meridiem: string; // 'AM' | 'PM'
	activeView: string; // 'days' | 'mounths' | 'years'
	activeViewDirection: number;
	startOfWeekIndex: number;
};

const PICKER_TYPES = ['days', 'months', 'years'];

const convertMeridiemToHours = (hour: number, meridiem: string) => {
	if (meridiem === 'AM') {
		return hour === 12 ? 0 : hour;
	}
	return hour === 12 ? hour : hour + 12;
};

const convertHoursToMeridiem = (_hour: number): { hour: number; meridiem: string } => {
	let hour: number;
	let meridiem: string;

	if (_hour === 0) {
		hour = 12;
		meridiem = 'AM';
	} else if (_hour < 12) {
		hour = _hour;
		meridiem = 'AM';
	} else {
		hour = _hour - 12;
		meridiem = 'PM';
	}
	return { hour, meridiem };
};

const updateSelected =
	(value: number | string, property: string) =>
	(state: DatepickerState): DatepickerState => {
		const newState: DatepickerState = {
			...state,
			[property]: value,
		};
		const hour: number = convertMeridiemToHours(Number(newState.hour), newState.meridiem);
		return {
			...newState,
			selected: new Date(newState.year, newState.month, newState.day, hour, newState.minute),
		};
	};

const pipe =
	(...fns: ((state: DatepickerState) => DatepickerState)[]) =>
	(val: DatepickerState) =>
		fns.reduce((accum, fn) => fn(accum), val);
const zeroDay = (date: number | Date) => startOfDay(date);

export class DatepickerStore {
	_end: number | Date;

	set: (this: void, value: DatepickerState) => void;

	subscribe: (this: void, run: Subscriber<DatepickerState>, invalidate?: any) => Unsubscriber;

	update: (this: void, updater: Updater<DatepickerState>) => void;

	constructor(end: number | Date, value: DatepickerState) {
		const { set, subscribe, update } = writable(value);
		this.set = set;
		this.subscribe = subscribe;
		this.update = update;
		this._end = end;
	}

	getState() {
		return getFromStore(this);
	}

	enlargeDay(enlargeDay = true) {
		this.update((state) => ({ ...state, enlargeDay }));
	}

	getSelectableVector(date: number | Date): boolean {
		const { start: s, end: e } = this.getState();
		const result = compareAsc(date, s) * compareAsc(date, e);
		return result <= 0;
	}

	isSelectable(date: Date, clamping: string[] = []): boolean {
		const vector = this.getSelectableVector(date);
		if (vector) return true;
		if (!clamping.length) return false;
		const clamped = this.clampValue(date, clamping);
		return this.isSelectable(clamped);
	}

	clampValue(date: Date, clampable: string[]): Date {
		const vector = this.getSelectableVector(date);
		if (vector) return date;
		const boundaryKey = compareAsc(date, this._end) === 1 ? 'end' : 'start';
		const boundary: number | Date = this.getState()[boundaryKey];
		const clampableValue = clampable.length
			? clampable.reduce((day: Date, type: string) => {
					switch (type) {
						case 'year':
							return setYear(day, getYear(boundary));
						case 'month':
							return setMonth(day, getMonth(boundary));
						case 'date':
							return setDate(day, getDate(boundary));
						default:
							return day;
					}
			  }, date)
			: boundary;
		return clampableValue;
	}

	add(amount: number, unit: string, clampable: string[] = []) {
		this.update(({ month, year, day, ...state }) => {
			let d = this.clampValue(addYears(new Date(year, month, day), amount), clampable);
			if (unit === 'month') {
				d = this.clampValue(addMonths(new Date(year, month, day), amount), clampable);
			}
			return {
				...state,
				month: getMonth(d),
				year: getYear(d),
				day: getDate(d),
				selected: d,
			};
		});
	}

	setActiveView(newActiveView: string) {
		const newIndex = PICKER_TYPES.indexOf(newActiveView);
		if (newIndex === -1) return;
		this.update(({ activeView, ...state }) => ({
			...state,
			activeViewDirection: PICKER_TYPES.indexOf(activeView) > newIndex ? -1 : 1,
			activeView: newActiveView,
		}));
	}

	setYear(year: number) {
		this.update(updateSelected(year, 'year'));
	}

	setMonth(month: number) {
		this.update(updateSelected(month, 'month'));
	}

	setDay(day: Date) {
		this.update(
			pipe(
				updateSelected(day.getDate(), 'day'),
				updateSelected(day.getMonth(), 'month'),
				updateSelected(day.getFullYear(), 'year'),
			),
		);
	}

	setTime(time: { hour: number; minute: number; meridiem: string }) {
		this.update(
			pipe(
				updateSelected(time.hour, 'hour'),
				updateSelected(time.minute, 'minute'),
				updateSelected(time.meridiem, 'meridiem'),
			),
		);
	}

	close(extraState?: Partial<DatepickerState>) {
		this.update((state) => ({ ...state, ...extraState, open: false }));
	}

	selectDay() {
		this.close({ hasChosen: true });
	}

	getCalendarPage(month: number, year: number) {
		const { startOfWeekIndex: index } = this.getState();
		let last = { date: new Date(year, month, 1), outsider: false };
		const days: { date: Date; outsider: boolean }[] = [];

		while (last.date.getMonth() === month) {
			days.push(last);
			const date = new Date(last.date);
			date.setDate(last.date.getDate() + 1);
			last = { date, outsider: false };
		}

		while (days[0].date.getDay() !== index) {
			const date = new Date(days[0].date);
			date.setDate(days[0].date.getDate() - 1);
			days.unshift({
				date,
				outsider: true,
			});
		}

		last.outsider = true;
		while (days.length < 42) {
			days.push(last);
			last = { date: new Date(last.date), outsider: true };
			last.date.setDate(last.date.getDate() + 1);
		}

		return days;
	}
}

const get = ({
	selected,
	start,
	end,
	startOfWeekIndex = 0,
	shouldEnlargeDay = false,
}: {
	selected: Date;
	start: Date;
	end: Date;
	startOfWeekIndex?: number;
	shouldEnlargeDay?: boolean;
}) => {
	const { hour, meridiem } = convertHoursToMeridiem(selected.getHours());

	return new DatepickerStore(end, {
		open: false,
		hasChosen: false,
		selected,
		start: zeroDay(start),
		end: zeroDay(end),
		shouldEnlargeDay,
		enlargeDay: false,
		year: selected.getFullYear(),
		month: selected.getMonth(),
		day: selected.getDate(),
		hour,
		minute: selected.getMinutes(),
		meridiem,
		activeView: 'days',
		activeViewDirection: 1,
		startOfWeekIndex,
	});
};

export default { get };
