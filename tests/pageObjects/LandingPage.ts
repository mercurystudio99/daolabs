import { Locator, Page } from '@playwright/test';

export class LandingPage {
	readonly page: Page;

	readonly launchYourProjectButton: Locator;

	readonly createTokensButton: Locator;

	readonly startRaisingFundsButton: Locator;

	readonly designYourProgectButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.launchYourProjectButton = page
			.getByRole('button', { name: 'Launch your project' })
			.first();
		this.createTokensButton = page.getByRole('button', { name: 'Create Tokens' }).first();
		this.startRaisingFundsButton = page.getByRole('button', { name: 'Start raising funds' });
		this.designYourProgectButton = page.getByRole('button', { name: 'Design your project' });
	}

	async goto() {
		await this.page.goto('/');
	}
}
