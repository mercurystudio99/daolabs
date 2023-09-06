import { Locator, Page, expect } from '@playwright/test';
import { formatNumer, getOffsetDate, getTestUserShortId } from '../../lib/utils/common.js';
import { EditionForm } from '../interfaces/EditionForm.js';

export class CollectionEditionPage {
	readonly page: Page;

	readonly backButton: Locator;

	readonly shareButton: Locator;

	readonly showTipsButton: Locator;

	readonly wrenchButton: Locator;

	readonly gearButton: Locator;

	readonly title: Locator;

	readonly owner: Locator;

	readonly symbol: Locator;

	readonly totalSupply: Locator;

	readonly totalEarned: Locator;

	readonly startDate: Locator;

	readonly endDate: Locator;

	readonly mintImage: Locator;

	readonly mintAmount: Locator;

	readonly mintPrice: Locator;

	readonly mintButton: Locator;

	readonly settingsEditionTab: Locator;

	readonly settingsExportTab: Locator;

	readonly settingNameInput: Locator;

	readonly settingSymbolInput: Locator;

	readonly settingsDescriptionInput: Locator;

	readonly settingsFile: Locator;

	readonly settingsProfilePictureAddButton: Locator;

	readonly settingsBannerAddButton: Locator;

	readonly settingsPriceInput: Locator;

	readonly settingSupplyInput: Locator;

	readonly settingStartDate: Locator;

	readonly settingsEndDate: Locator;

	readonly settingsRoyaltiesAddButton: Locator;

	readonly settingsPayoutAddressInput: Locator;

	readonly settingsRefreshPayoutAddressButton: Locator;

	readonly settingsSaveChangesButton: Locator;

	readonly settingsExportButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.backButton = page.locator('.back-icon');
		this.shareButton = page.locator('.settings > span').nth(0);
		this.showTipsButton = page.locator('.settings > span').nth(1);
		this.wrenchButton = page.locator('.settings > span').nth(2);
		this.gearButton = page.locator('.settings > span').nth(3);
		this.title = page.locator('.collection-info h2');
		this.owner = page.locator('.owner');
		this.symbol = page.locator('.symbol');
		this.totalSupply = page.locator('.mint-info > span').nth(0);
		this.totalEarned = page.locator('.mint-info > span').nth(1);
		this.startDate = page.locator('.mint-info > span').nth(2);
		this.endDate = page.locator('.mint-info > span').nth(3);
		this.mintImage = page.locator('.mint-configuration img');
		this.mintAmount = page.locator('.amount > span').nth(0);
		this.mintPrice = page.locator('.amount > span').nth(1);
		this.mintButton = page.getByRole('button', { name: 'Mint' });

		// Settings pane
		this.settingsEditionTab = page.getByRole('button', { name: 'Edition' });
		this.settingsExportTab = page.getByRole('button', { name: 'Export' }).nth(0);

		this.settingNameInput = page.locator('#name');
		this.settingSymbolInput = page.locator('#symbol');
		this.settingsDescriptionInput = page.locator('#description-wrap textarea');
		this.settingsFile = page.locator('.preview img');
		this.settingsProfilePictureAddButton = page.locator('.banner-wrap button').nth(0);
		this.settingsBannerAddButton = page.locator('.banner-wrap button').nth(1);
		this.settingsPriceInput = page.locator('.currency-input input');
		this.settingSupplyInput = page.locator('.currency-input input');
		this.settingStartDate = page.locator('.combined .input').nth(0);
		this.settingsEndDate = page.locator('.combined .input').nth(1);
		this.settingsRoyaltiesAddButton = page.locator('.modal-button button');
		this.settingsPayoutAddressInput = page.locator('#address');
		this.settingsRefreshPayoutAddressButton = page.getByRole('button', {
			name: 'Refresh Payout Addresses',
		});
		this.settingsSaveChangesButton = page.getByRole('button', { name: 'Save Changes' });

		this.settingsExportButton = page.getByRole('button', { name: 'Export' }).nth(1);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async verifyCollectionData(details: EditionForm, screenshot: string) {
		await expect.soft(this.title).toContainText(details.collectionName);
		await expect.soft(this.owner).toContainText(getTestUserShortId());
		details.symbol && (await expect.soft(this.symbol).toContainText(details.symbol));
		details.supply &&
			(await expect.soft(this.totalSupply).toContainText(`Total Supply: ${details.supply}`));
		if (details.startTime) {
			const startDate = getOffsetDate(+details.startTime.daysFromToday);
			await expect
				.soft(this.startDate)
				.toContainText(`${startDate} ${details.startTime.time.replace(' ', '')}`);
		}
		if (details.endTime) {
			const endDate = getOffsetDate(+details.endTime.daysFromToday);
			await expect
				.soft(this.endDate)
				.toContainText(`${endDate} ${details.endTime.time.replace(' ', '')}`);
		}
		// details.price &&
		// 	(await expect.soft(this.mintPrice).toHaveText(`Ξ ${formatNumer(+details.price)}`));
		await this.page.waitForTimeout(2_000);
		//await expect.soft(this.mintImage).toHaveScreenshot(screenshot) /*FIXME: screenshots are platform dependent*/;
	}
}
