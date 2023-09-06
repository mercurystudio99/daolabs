import { test, expect } from '../../fixtures/metamask.js';
import { UserPage } from '../../pageObjects/UserPage/UserPage.js';
import { elementExists, getTestUserShortId } from '../../lib/utils/common.js';
import { editionDetails } from '../../_test-data/create-edition-collection.js';
import { CollectionEditionPage } from '../../pageObjects/CollectionEditionPage/CollectionEditionPage.js';
import { CollectionSettingsPane } from '../../pageObjects/CollectionEditionPage/CollectionSettingsPane.js';
import { EditionForm } from '../../pageObjects/interfaces/EditionForm.js';

test.describe.serial('Collection CRUD', () => {
	let userPage: UserPage;

	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 1000 });
		userPage = new UserPage(page);
		await userPage.goto();
		await userPage.waitForPageToLoadUser(getTestUserShortId());
		await userPage.collectionsButton.click();
		if (await elementExists(userPage.collectionsFooter, 3_000)) {
			await userPage.collectionsFooter.waitFor({ state: 'visible' });
		} else {
			await userPage.collectionsExampleFooter.waitFor({ state: 'visible' });
		}
	});

	editionDetails.forEach((details) => {
		test(`Create Edition Collection ${details.testSuffix}`, async () => {
			test.slow();
			const countBefore = await userPage.getTabCollectionCount();
			await userPage.createEditionCollection(details);
			await userPage.closeConfirmationSuccessButton.click();
			await expect
				.soft(userPage.collectionsButton)
				.toHaveText(`${countBefore + 1} COLLECTIONS`, { timeout: 3_000 });
			await userPage.findPageWithCollection(details.collectionName);
			await expect.soft(userPage.collectionCard.getByText(details.collectionName)).toHaveCount(1);
		});

		test(`Created collection contains provided data ${details.testSuffix}`, async () => {
			await userPage.findPageWithCollection(details.collectionName);
			await userPage.verifyCollectionCard(details, 'cardImage.png');

			await userPage.getCollectionByName(details.collectionName).click();
			const collectionEditionPage = new CollectionEditionPage(userPage.page);
			await collectionEditionPage.verifyCollectionData(details, 'editionPageImage.png');

			await collectionEditionPage.gearButton.click();
			const collectionSettingsPane = new CollectionSettingsPane(userPage.page);
			await collectionSettingsPane.verifyCollectionData(details, 'editionSettingsImage.png');
		});

		if (details.testSuffix === 'All fields') {
			test(`Edit collection All fields`, async () => {
				await userPage.findPageWithCollection(details.collectionName);
				await userPage.getCollectionByName(details.collectionName).click();
				const newDetails: EditionForm = {
					collectionName: `New Name ${Date.now()}`,
					description: 'New Description',
					symbol: 'NewSymbol',
					pathToFile: 'tests/files/frog.jpg',
					price: 2345,
					// The address should be VALID, otherwise the Settings pane fails to Save&Close !
					// payoutAddress:'0xfB542c76680b5d7F2eA0B5161276a304dCDE9bF3',
				};
				details = { ...details, ...newDetails };
				await userPage.editEditionCollection(newDetails);
			});

			test(`Edited collection contains provided data All fields`, async () => {
				await userPage.findPageWithCollection(details.collectionName);
				await userPage.verifyCollectionCard(details, 'newCardImage.png');

				await userPage.getCollectionByName(details.collectionName).click();
				const collectionEditionPage = new CollectionEditionPage(userPage.page);
				await collectionEditionPage.verifyCollectionData(details, 'newEditionPageImage.png');

				await collectionEditionPage.gearButton.click();
				const collectionSettingsPane = new CollectionSettingsPane(userPage.page);
				await collectionSettingsPane.verifyCollectionData(details, 'newEditionSettingsImage.png');
			});
		}

		test(`Delete Edition Collection ${details.testSuffix}`, async () => {
			await userPage.findPageWithCollection(details.collectionName);
			const countBefore = await userPage.getTabCollectionCount();
			await userPage.deleteCollection(details.collectionName);
			await expect.soft(userPage.collectionCard.getByText(details.collectionName)).toHaveCount(0);
			await expect.soft(userPage.collectionsButton).toHaveText(`${countBefore - 1} COLLECTIONS`);
		});
	});
});
