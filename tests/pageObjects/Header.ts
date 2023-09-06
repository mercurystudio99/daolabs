import { Locator, Page } from '@playwright/test';
import { elementExists } from '../lib/utils/common.js';

export class Header {
	readonly page: Page;

	readonly rightNavPanel: Locator;

	readonly connectButton: Locator;

	readonly walletsModal: Locator;

	readonly coinbaseButton: Locator;

	readonly metamaskButton: Locator;

	readonly walletConnectButton: Locator;

	readonly ledgerButton: Locator;

	readonly trezorButton: Locator;

	readonly gnosisSafeButton: Locator;

	readonly walletsPopupCloseButton: Locator;

	readonly userProfileButton: Locator;

	readonly dropdownUserShortId: Locator;

	readonly dropdownMyProjects: Locator;

	readonly dropdownMyCollections: Locator;

	readonly dropdownSwitchNetwork: Locator;

	readonly dropdownMainnet: Locator;

	readonly dropdownGoerliTestnet: Locator;

	readonly dropdownDisconnect: Locator;

	constructor(page: Page) {
		this.page = page;
		this.rightNavPanel = page.locator('.right-nav');
		this.connectButton = page.getByRole('button', { name: 'Connect' }).first();

		// Wallets popup
		this.walletsModal = this.page.locator('.modal');
		this.coinbaseButton = page.getByRole('button', { name: 'Coinbase' });
		this.metamaskButton = page.getByRole('button', { name: 'MetaMask' });
		this.walletConnectButton = page.getByRole('button', { name: 'WalletConnect' });
		this.ledgerButton = page.getByRole('button', { name: 'Ledger' });
		this.trezorButton = page.getByRole('button', { name: 'Trezor' });
		this.gnosisSafeButton = page.getByRole('button', { name: 'Gnosis Safe' });
		this.walletsPopupCloseButton = page.locator('.close-button');

		// User profile dropdown
		this.userProfileButton = page.locator('.right-nav > div').nth(3);
		this.dropdownUserShortId = page.locator('.ant-dropdown-menu > li').nth(0);
		this.dropdownMyProjects = page.locator('li:has-text("My Projects")');
		this.dropdownMyCollections = page.locator('li:has-text("My Collections")');
		this.dropdownSwitchNetwork = page.locator('li:has-text("Switch Network")');
		this.dropdownMainnet = page.locator('li:has-text("Mainnet")');
		this.dropdownGoerliTestnet = page.locator('li:has-text("Goerli Testnet")');
		this.dropdownDisconnect = page.locator('li:has-text("Disconnect")');
	}

	get defaultWallets() {
		return [
			this.coinbaseButton,
			this.walletConnectButton,
			this.ledgerButton,
			this.trezorButton,
			this.gnosisSafeButton,
		];
	}

	async clickConnectButton() {
		let counter = 0;
		while (!(await elementExists(this.walletsModal))) {
			if (counter === 3) break;
			await this.connectButton.click();
			await this.page.waitForTimeout(1_500);
			counter++;
		}
	}
}
