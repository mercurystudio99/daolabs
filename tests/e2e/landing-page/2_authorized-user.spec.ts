import { test, expect } from '../../fixtures/metamask.js';
import { Header } from '../../pageObjects/Header.js';
import { LandingPage } from '../../pageObjects/LandingPage.js';
import { getTestUserShortId } from '../../lib/utils/common.js';

test.use({
	connected: true,
});

test('Connect button is not displayed', async ({ page }) => {
	test.slow();
	const landingPage = new LandingPage(page);
	const header = new Header(landingPage.page);
	await landingPage.goto();
	await expect(header.connectButton).toHaveCount(0);
	await expect(header.rightNavPanel).toContainText(getTestUserShortId());
});
