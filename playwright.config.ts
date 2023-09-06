import type { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test.local' });

const config: PlaywrightTestConfig = {
	testDir: 'tests/e2e',
	webServer: {
		command: 'npm run preview',
		url: 'http://localhost:4173',
	},
	use: {
		baseURL: 'http://localhost:4173',
		viewport: null,
		trace: 'retain-on-failure',
		headless: true,
		permissions: ['notifications'],
	},
	globalSetup: 'tests/global-setup.ts',
	snapshotPathTemplate: 'tests/snapshots/{testFileName}/{arg}{ext}',
	workers: '50%',
	reporter: [
		[process.env.CI ? 'dot': 'list'],
		['html', { open: 'never', outputFolder: "playwright-report" }],
	],
	retries: 2,
	timeout: 60_000,
	expect: {
		timeout: 60_000,
	}
};

export default config;
