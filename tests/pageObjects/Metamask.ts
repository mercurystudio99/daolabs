import { Locator, Page } from '@playwright/test';

const phrase = 'filter unveil print account fan suspect tumble general fire toss goat join';
const password = 'Password1!';

export class Metamask {
	readonly page: Page;

	readonly getStartedButton: Locator;

	readonly noThanksButton: Locator;

	readonly importWalletButton: Locator;

	readonly passwordInput: Locator;

	readonly confirmPasswordInput: Locator;

	readonly acceptTermsCheckbox: Locator;

	readonly importButton: Locator;

	readonly allDoneButton: Locator;

	readonly nextButton: Locator;

	readonly connectButton: Locator;

	readonly signButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.getStartedButton = page.locator('text="Get started"');
		this.noThanksButton = page.locator('text="No thanks"');
		this.importWalletButton = page.locator('text="Import wallet"');
		this.passwordInput = page.locator('id=password');
		this.confirmPasswordInput = page.locator('id=confirm-password');
		this.acceptTermsCheckbox = page.locator('id=create-new-vault__terms-checkbox');
		this.importButton = page.locator('text="Import"');
		this.allDoneButton = page.locator('text="All done"');
		this.nextButton = page.locator('text="Next"');
		this.connectButton = page.locator('text="Connect"');
		this.signButton = page.locator('text="Sign"');
	}

	async goto() {
		await this.page.goto('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html');
		await this.page.bringToFront();
	}

	async authToWallet() {
		const phraseArr = phrase.split(' ');

		await this.getStartedButton.click();
		await this.noThanksButton.click();
		await this.importWalletButton.click();
		for (let i = 0; i < phraseArr.length; i++) {
			await this.page.locator(`id=import-srp__srp-word-${i}`).fill(phraseArr[i]);
		}
		await this.passwordInput.fill(password);
		await this.confirmPasswordInput.fill(password);
		await this.acceptTermsCheckbox.click();
		await this.importButton.click();
		await this.allDoneButton.click();
	}
}
