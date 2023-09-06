import { Locator, Page, expect } from '@playwright/test';
import { elementExists, getTestUserShortId } from '../../lib/utils/common.js';
import { CollectionEditionPage } from '../CollectionEditionPage/CollectionEditionPage.js';
import { CollectionSettingsPane } from '../CollectionEditionPage/CollectionSettingsPane.js';
import { EditionForm } from '../interfaces/EditionForm.js';
import { EditionFormPage } from './EditionFormPage.js';

export class UserPage {
	readonly page: Page;

	readonly userId: Locator;

	readonly assetsButton: Locator;

	readonly collectionsButton: Locator;

	readonly revenueSplitButton: Locator;

	readonly juiceboxesButton: Locator;

	readonly tokensTab: Locator;

	readonly nftTab: Locator;

	readonly tokensBalance: Locator;

	readonly tokensPerformance: Locator;

	readonly assetsOther: Locator;

	readonly tokensTable: Locator;

	readonly transactionsTable: Locator;

	readonly totalFloorPrice: Locator;

	readonly exampleCollectionCard: Locator;

	readonly collectionsExampleFooter: Locator;

	readonly collectionsFooter: Locator;

	readonly exampleRevenueSplitCard: Locator;

	readonly revenueSplitFooter: Locator;

	readonly exampleJuiceboxCard: Locator;

	readonly juiceboxesFooter: Locator;

	readonly createButton: Locator;

	readonly contractTypePopup: Locator;

	readonly closeConfirmationSuccessButton: Locator;

	readonly editionsContractButton: Locator;

	readonly generativeContractButton: Locator;

	readonly advancedContractButton: Locator;

	readonly importContractButton: Locator;

	readonly confirmDeleteButton: Locator;

	readonly collectionCard: Locator;

	readonly paginatorLeftButton: Locator;

	readonly paginatorRightButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.userId = page.locator('div.info span#wrapper').first();
		this.assetsButton = page.locator('#user-assets');
		this.collectionsButton = page.locator('#user-collection');
		this.tokensTab = page.locator('div.tabs').getByText('Tokens');
		this.nftTab = page.locator('div.tabs').getByText('Nft');
		this.revenueSplitButton = page.locator('#user-revenue');
		this.juiceboxesButton = page.locator('#user-projects');
		this.createButton = page.getByRole('button', { name: 'Create' }).first();

		// ASSETS
		this.tokensBalance = page.locator('.stats  section > div[slot=right]').nth(0);
		this.tokensPerformance = page.locator('.stats  section > div[slot=right]').nth(1);
		this.assetsOther = page.locator('.stats  section > div[slot=right]').nth(2);
		this.tokensTable = page.locator('section.leftColumn');
		this.transactionsTable = page.locator('main > section').nth(1);
		this.totalFloorPrice = page.locator('.totalFloorPrice h1');

		// COLLECTIONS
		this.exampleCollectionCard = page.locator('#example-collection-card');
		this.collectionsExampleFooter = page.locator('.example-card > p');
		this.collectionsFooter = page.getByText('Collection(s) you have created.');
		this.collectionCard = page.locator('.collection');

		// REVENUE SPLIT
		this.exampleRevenueSplitCard = page.locator('#example-revenue-split');
		this.revenueSplitFooter = page.locator('section > p');

		// JUICEBOXES
		this.exampleJuiceboxCard = page.locator('#example-project-card');
		this.juiceboxesFooter = page.locator('section > p');

		// Contract type popup
		this.editionsContractButton = page.getByRole('button', { name: 'Editions' });
		this.generativeContractButton = page.getByRole('button', {
			name: 'Generative',
		});
		this.advancedContractButton = page.getByRole('button', { name: 'Advanced' });
		this.importContractButton = page.getByRole('button', { name: 'Import' });

		// Confirmation popup
		this.closeConfirmationSuccessButton = page.getByRole('button', { name: 'Close' }).first();

		// Confirm Delete collection popup
		this.confirmDeleteButton = page.getByRole('button', { name: 'Delete' });

		// Paginator
		this.paginatorLeftButton = page.locator('.chevron:nth-child(1)');
		this.paginatorRightButton = page.locator('.chevron:nth-child(3)');
	}

	async goto() {
		await this.page.goto('/user', { timeout: 15000 });
	}

	async waitForPageToLoadUser(userShortId: string) {
		await expect(this.userId).toContainText(userShortId, { timeout: 20000 });
	}

	async getTabCollectionCount() {
		const tabText = await this.collectionsButton.textContent();
		return +tabText.split(' ')[0];
	}

	async createEditionCollection(details: EditionForm) {
		const editionForm = new EditionFormPage(this.page);
		await this.createButton.click();
		await this.editionsContractButton.click();
		await editionForm.fillAndSubmitEditionCollectionForm(details);
	}

	async editEditionCollection(details: EditionForm) {
		await new CollectionEditionPage(this.page).gearButton.click();
		await new CollectionSettingsPane(this.page).fillAndSubmitEditionCollectionForm(details);
	}

	getCollectionByName(collectionName: string) {
		return this.page.locator(`//div[*/div[*/h3[contains(text(), '${collectionName}')]]]`);
	}

	async findPageWithCollection(collectionName: string) {
		const collectionLocator = this.getCollectionByName(collectionName);
		while (!(await elementExists(collectionLocator))) {
			if (!(await elementExists(this.paginatorRightButton))) throw Error('Collection not found');
			await this.paginatorRightButton.click();
		}
	}

	async deleteCollection(collectionName: string) {
		await this.findPageWithCollection(collectionName);
		const collectionCard = this.getCollectionByName(collectionName);
		await collectionCard.locator('.close').click({ force: true });
		await this.confirmDeleteButton.click();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async verifyCollectionCard(details: EditionForm, screenshot: string) {
		const collection = this.getCollectionByName(details.collectionName);
		await this.page.waitForTimeout(2_000);
		//await expect.soft(collection.locator('img')).toHaveScreenshot(screenshot) /*FIXME: screenshots are platform dependent*/;
		await expect.soft(collection.locator('.creator')).toContainText(getTestUserShortId());
		if (details.symbol !== undefined) {
			await expect(collection.locator('.list > span').nth(0)).toContainText(details.symbol);
		}
		await expect.soft(collection.locator('.network')).toContainText('Mainnet');
		// if (details.description !== undefined) {
		// 	await expect(collection.locator('.description')).toContainText(details.description);
		// }
	}
}
