import { Locator, Page } from '@playwright/test';

export class CreateProjectPage {
	readonly page: Page;

	readonly pageHeader: Locator;

	constructor(page: Page) {
		this.page = page;
		this.pageHeader = page.locator('div#create > h1');
	}
}
