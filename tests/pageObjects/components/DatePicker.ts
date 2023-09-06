import { Locator, Page } from '@playwright/test';
import { addDays, elementExists } from '../../lib/utils/common.js';
import { monthNames } from '../../lib/utils/constants.js';

export class DatePicker {
	readonly calendarLeftButton: Locator;

	readonly calendarCenterButton: Locator;

	readonly calendarRightButton: Locator;

	readonly calendarGridYears: Locator;

	readonly calendarGridMonths: Locator;

	readonly calendarGridDays: Locator;

	readonly calendarTimeButton: Locator;

	constructor(page: Page) {
		this.calendarLeftButton = page.locator('.calendar .controls :nth-child(1)').first();
		this.calendarCenterButton = page.locator('.calendar .controls :nth-child(2)');
		this.calendarRightButton = page.locator('.calendar .controls :nth-child(3)');
		this.calendarGridYears = page.locator(
			'.calendar [style="transform: translateY(0px);"] [href="#year"]',
		);
		this.calendarGridMonths = page.locator(
			'.calendar [style="transform: translateY(0px);"] [href="#selectMonth"]',
		);
		this.calendarGridDays = page.locator(
			'.calendar [style="transform: translateY(0px);"] [href="#pickday"]',
		);
		this.calendarTimeButton = page.locator('.timepicker span');
	}

	async selectDateAndTime(daysFromToday: number, time: string) {
		const date = addDays(+daysFromToday);
		const day = date.getDate();
		const monthName = monthNames[date.getMonth()];
		const monthShortName = monthName.slice(0, 3);
		const year = date.getFullYear();
		const defaultMonthYear = await this.calendarCenterButton.textContent();
		const [defaultMonth, defaultYear] = defaultMonthYear.split(' ');
		if (year !== +defaultYear) {
			await this.calendarCenterButton.click();
			const chevronButton =
				+defaultYear < year ? this.calendarRightButton : this.calendarLeftButton;
			const yearButton = this.calendarGridYears.getByText(year.toString());
			while (!(await elementExists(yearButton))) {
				await chevronButton.click();
			}
			await yearButton.click();
			await this.calendarGridMonths.getByText(monthShortName).click();
		} else if (monthName !== defaultMonth) {
			await this.calendarCenterButton.click();
			await this.calendarGridMonths.getByText(monthShortName).click();
		}
		await this.calendarGridDays.locator(`text="${day}"`).first().click();
		const timeButton = this.calendarTimeButton.getByText(time, { exact: true });
		await timeButton.click();
	}
}
