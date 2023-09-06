import { Locator, Page } from '@playwright/test';
import { selectFile } from '../../lib/utils/common.js';
import { DatePicker } from '../components/DatePicker.js';
import { EditionForm } from '../interfaces/EditionForm.js';

export class EditionFormPage {
	readonly page: Page;

	readonly collectionNameInput: Locator;

	readonly collectionSymbolInput: Locator;

	readonly collectionDescriptionInput: Locator;

	readonly collectionPriceInput: Locator;

	readonly collectionSupplyInput: Locator;

	readonly collectionStartDateIcon: Locator;

	readonly collectionEndDateIcon: Locator;

	readonly collectionAddRoyaltiesButton: Locator;

	readonly collectionRoyaltiesRecipientInput: Locator;

	readonly collectionRoyaltyPercentageInput: Locator;

	readonly collectionRoyaltyDoneButton: Locator;

	readonly collectionPayoutAddReceiverButton: Locator;

	readonly collectionPayoutAddressInput: Locator;

	readonly collectionPayoutAddressButton: Locator;

	readonly payoutDropdownCreateNewJuiceboxOption: Locator;

	readonly payoutDropdownEnterJuiceboxOption: Locator;

	readonly collectionRefreshPayoutAddressButton: Locator;

	readonly uploadFileZone: Locator;

	readonly addEditionButton: Locator;

	readonly createEditionButton: Locator;

	readonly addPayoutReceiverButton: Locator;

	readonly royaltiesAddReceiverButton: Locator;

	readonly royaltiesRecipientAddress: Locator;

	readonly royaltyPercentage: Locator;

	readonly royaltiesDoneButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.collectionNameInput = page.locator('#name');
		this.collectionSymbolInput = page.locator('#symbol');
		this.collectionDescriptionInput = page.locator('#description-wrap textarea');
		this.uploadFileZone = page.locator('.upload-zone');
		this.addEditionButton = page.getByRole('button', { name: 'Add Edition' });
		this.collectionPriceInput = page.locator('#edition-price input');
		this.collectionSupplyInput = page.locator('#edition-supply input');
		this.collectionStartDateIcon = page.locator('.calendar-icon').nth(0);
		this.collectionEndDateIcon = page.locator('.calendar-icon').nth(1);
		this.addPayoutReceiverButton = page.getByRole('button', {
			name: 'Add payout receiver',
		});

		// Royalties
		this.collectionAddRoyaltiesButton = page
			.locator('#edition-royalties')
			.getByRole('button', { name: 'Add' });
		this.royaltiesAddReceiverButton = page
			.locator('form')
			.getByRole('button', { name: 'Add receiver' });
		this.royaltiesRecipientAddress = page.locator('input#address');
		this.royaltyPercentage = page.locator('#royalty-wrap input');
		this.royaltiesDoneButton = page.getByRole('button', { name: 'Done' });

		// Payout address
		this.collectionPayoutAddReceiverButton = page
			.locator('#edition-payouts')
			.getByRole('button', { name: 'Add receiver' });
		this.collectionPayoutAddressInput = page.locator('input#address');
		this.collectionPayoutAddressButton = page.locator('.opener');
		this.payoutDropdownCreateNewJuiceboxOption = page.locator('.dropdown > div').nth(0);
		this.payoutDropdownEnterJuiceboxOption = page.locator('.dropdown > div').nth(1);

		this.collectionRefreshPayoutAddressButton = page.getByRole('button', {
			name: 'Refresh Payout Addresses',
		});

		this.createEditionButton = page.getByRole('button', { name: 'Create Edition' });
	}

	async fillAndSubmitEditionCollectionForm(details: EditionForm) {
		await this.collectionNameInput.fill(details.collectionName);
		await this.addEditionButton.click();
		details.symbol && (await this.collectionSymbolInput.fill(details.symbol));
		details.description && (await this.collectionDescriptionInput.fill(details.description));
		await selectFile(this.page, this.uploadFileZone, details.pathToFile);
		details.price && (await this.collectionPriceInput.fill(details.price.toString()));
		details.supply && (await this.collectionSupplyInput.fill(details.supply.toString()));

		const datePicker = new DatePicker(this.page);
		if (details.startTime) {
			const { daysFromToday, time } = details.startTime;
			await this.collectionStartDateIcon.click();
			await datePicker.selectDateAndTime(daysFromToday, time);
		}
		if (details.endTime) {
			const { daysFromToday, time } = details.endTime;
			await this.collectionEndDateIcon.click();
			await datePicker.selectDateAndTime(daysFromToday, time);
		}

		if (details.royalties) {
			const { royaltiesRecipientAddress, royaltyPercentage } = details.royalties;
			await this.collectionAddRoyaltiesButton.click();
			await this.royaltiesAddReceiverButton.click();

			await this.royaltiesRecipientAddress.fill(royaltiesRecipientAddress);
			await this.addPayoutReceiverButton.click();

			await this.royaltyPercentage.fill(royaltyPercentage.toString());
			await this.royaltiesDoneButton.click();
		}

		if (details.payoutAddress) {
			await this.collectionPayoutAddReceiverButton.click();
			await this.collectionPayoutAddressInput.fill(details.payoutAddress);
			await this.addPayoutReceiverButton.click();
		}

		await this.createEditionButton.click();
	}
}
