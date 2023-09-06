import { Locator, Page, expect } from '@playwright/test';
import { clearAndFillInput, getOffsetDate, selectFile } from '../../lib/utils/common.js';
import { DatePicker } from '../components/DatePicker.js';
import { EditionForm } from '../interfaces/EditionForm.js';

export class CollectionSettingsPane {
	readonly page: Page;

	readonly nameInput: Locator;

	readonly symbolInput: Locator;

	readonly descriptionInput: Locator;

	readonly priceInput: Locator;

	readonly supplyInput: Locator;

	readonly startDateLabel: Locator;

	readonly startDateIcon: Locator;

	readonly endDateLabel: Locator;

	readonly endDateIcon: Locator;

	readonly addRoyaltiesButton: Locator;

	readonly editRoyaltiesButton: Locator;

	readonly payoutAddress: Locator;

	readonly royaltiesRecipientInput: Locator;

	readonly royaltiesPercentageInput: Locator;

	readonly royaltiesEditButton: Locator;

	readonly payoutAddressInput: Locator;

	readonly payoutAddressButton: Locator;

	readonly payoutDropdownCreateNewJuiceboxOption: Locator;

	readonly payoutDropdownEnterJuiceboxOption: Locator;

	readonly refreshPayoutAddressButton: Locator;

	readonly uploadFileZone: Locator;

	readonly image: Locator;

	readonly deleteImageButton: Locator;

	readonly clearAdressButton: Locator;

	readonly royaltiesAddReceiverButton: Locator;

	readonly royaltiesPopupRecipientAddress: Locator;

	readonly addPayoutReceiverButton: Locator;

	readonly royaltyPopupPercentage: Locator;

	readonly royaltiesPopupDoneButton: Locator;

	readonly saveChangesButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.nameInput = page.locator('#name');
		this.symbolInput = page.locator('#symbol');
		this.descriptionInput = page.locator('#edition-description textarea').first();
		this.uploadFileZone = page.locator('.upload-zone');
		this.image = page.locator('img.preview');
		this.deleteImageButton = page.locator('.dropzone .close');
		this.priceInput = page.locator('.currency-input input');
		this.supplyInput = page.locator('#supply');
		this.startDateLabel = page.locator('.combined .input').nth(0);
		this.startDateIcon = page.locator('.calendar-icon').nth(0);
		this.endDateLabel = page.locator('.combined .input').nth(1);
		this.endDateIcon = page.locator('.calendar-icon').nth(1);

		// Royalties
		this.addRoyaltiesButton = page
			.locator('#edition-royalties')
			.getByRole('button', { name: 'Add' });
		this.editRoyaltiesButton = page.getByRole('button', { name: 'Edit' });
		this.royaltiesPercentageInput = page.locator('.royalty-input input');
		this.royaltiesRecipientInput = page.locator('.address-input input');
		this.royaltiesEditButton = page.getByRole('button', { name: 'Edit' });
		this.clearAdressButton = page.locator('div.delete');
		this.royaltiesAddReceiverButton = page.getByRole('button', { name: 'Add receiver' });
		this.royaltiesPopupRecipientAddress = page.locator('input#address').nth(1);
		this.addPayoutReceiverButton = page.getByRole('button', {
			name: 'Add payout receiver',
		});
		this.royaltyPopupPercentage = page.locator('#royalty-wrap input');
		this.royaltiesPopupDoneButton = page.getByRole('button', { name: 'Done' });

		// Payout address
		this.payoutAddressInput = page.locator('input#address').nth(0);
		this.payoutAddressButton = page.locator('.opener');
		this.payoutDropdownCreateNewJuiceboxOption = page.locator('.dropdown > div').nth(0);
		this.payoutDropdownEnterJuiceboxOption = page.locator('.dropdown > div').nth(1);
		this.refreshPayoutAddressButton = page.getByRole('button', {
			name: 'Refresh Payout Addresses',
		});
		this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });
	}

	async fillAndSubmitEditionCollectionForm(details: EditionForm) {
		details.collectionName && (await clearAndFillInput(this.nameInput, details.collectionName));
		details.symbol && (await clearAndFillInput(this.symbolInput, details.symbol));
		details.description && (await clearAndFillInput(this.descriptionInput, details.description));
		if (details.pathToFile) {
			//	await this.deleteImageButton.click();

			await selectFile(this.page, this.uploadFileZone, details.pathToFile);
		}
		details.price && (await clearAndFillInput(this.priceInput, details.price.toString()));
		details.supply && (await clearAndFillInput(this.supplyInput, details.supply.toString()));

		const datePicker = new DatePicker(this.page);
		if (details.startTime) {
			const { daysFromToday, time } = details.startTime;
			await this.startDateIcon.click();
			await datePicker.selectDateAndTime(daysFromToday, time);
		}
		if (details.endTime) {
			const { daysFromToday, time } = details.endTime;
			await this.endDateIcon.click();
			await datePicker.selectDateAndTime(daysFromToday, time);
		}

		if (details.royalties) {
			const { royaltiesRecipientAddress, royaltyPercentage } = details.royalties;
			await this.editRoyaltiesButton.click();

			await this.clearAdressButton.click();
			await this.royaltiesAddReceiverButton.click();

			await this.royaltiesPopupRecipientAddress.fill(royaltiesRecipientAddress);
			await this.addPayoutReceiverButton.click();

			await clearAndFillInput(this.royaltyPopupPercentage, royaltyPercentage.toString());

			await this.royaltiesPopupDoneButton.click();
		}

		details.payoutAddress &&
			(await clearAndFillInput(this.payoutAddressInput, details.payoutAddress));
		await this.saveChangesButton.click();

		await this.page.locator('.back-icon').click();
		details.collectionName &&
			expect
				.soft(await this.page.locator('h2').first().textContent())
				.toContain(details.collectionName);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async verifyCollectionData(details: EditionForm, screenshot: string) {
		details.collectionName &&
			expect.soft(await this.nameInput.inputValue()).toContain(details.collectionName);
		details.description &&
			expect.soft(await this.descriptionInput.inputValue()).toContain(details.description);
		//details.pathToFile && (await expect.soft(this.image).toHaveScreenshot(screenshot) /*FIXME: screenshots are platform dependent*/);
		details.price &&
			expect.soft(await this.priceInput.inputValue()).toContain(details.price.toString());
		details.supply &&
			expect.soft(await this.supplyInput.inputValue()).toContainEqual(details.supply);
		if (details.startTime) {
			const startDate = getOffsetDate(+details.startTime.daysFromToday);
			await expect
				.soft(this.startDateLabel)
				.toContainText(`${startDate} ${details.startTime.time.replace(' ', '')}`);
		}
		if (details.endTime) {
			const endDate = getOffsetDate(+details.endTime.daysFromToday);
			await expect
				.soft(this.endDateLabel)
				.toContainText(`${endDate} ${details.endTime.time.replace(' ', '')}`);
		}
		if (details.royalties) {
			expect
				.soft(await this.royaltiesPercentageInput.inputValue())
				.toContain(details.royalties.royaltyPercentage.toString());
			expect
				.soft(await this.royaltiesRecipientInput.inputValue())
				.toContain(details.royalties.royaltiesRecipientAddress);
		}
		if (details.payoutAddress !== undefined) {
			details.payoutAddress &&
				(await expect(this.page.locator('div.recipient span#wrapper').first()).toContainText(
					details.payoutAddress,
				));
		}
	}
}
