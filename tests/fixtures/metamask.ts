import { test as base, chromium, BrowserContext, expect as baseExpect } from '@playwright/test';
import { connectMetamask } from '../lib/utils/common.js';

type WorkerContextFixture = {
	globalContext: BrowserContext;
	connected: boolean;
};

export const test = base.extend<{}, WorkerContextFixture>({
	connected: [true, { option: true, scope: 'worker' }],
	globalContext: [
		async ({ connected }, use, info) => {
			const userDataDir = `${process.env.TEST_DATA_DIR}/worker-${info.workerIndex}`;
			const context = await chromium.launchPersistentContext(userDataDir, {
				args: [
					`--headless=new`,
					`--disable-extensions-except=${process.env.PATH_TO_METAMASK}`,
					`--load-extension=${process.env.PATH_TO_METAMASK}`,
					`--window-size={width: 1200, height:1000}`,
				],
			});
			connected && (await connectMetamask(context));
			await use(context);
			await context.close();
		},
		{ scope: 'worker' },
	],

	page: async ({ globalContext }, use) => {
		const page = await globalContext.newPage();
		await use(page);
		await page.close();
	},
});

export const expect = baseExpect;
