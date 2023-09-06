import { expect, test } from '@playwright/test';

test.describe('Landing page header', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test.afterEach(async ({ page }) => {
		await page.close();
	});

	test('Exists title text', async ({ page }) => {
		const titleText = page.locator('section > article > h1');
		await expect(titleText).toHaveText(/Fund and operate your thing, your way./);
	});

	test('Exists description text', async ({ page }) => {
		const titleText = page.locator('section > article > p').first();
		await expect(titleText).toHaveText(
			/Juicebox puts the fun back in funding so you can focus on building./,
		);
	});

	test('Show four projects', async ({ page }) => {
		const projects = page.locator('.projects > a');
		await expect(projects).toHaveCount(4);
		const count = await projects.count();

		for (let i = 0; i < count; i++) {
			const project = projects.nth(i);
			const projectLogo = project.locator('.project-logo').locator('img');
			expect(projectLogo).toBeDefined();
		}
	});

	test('Exists button start raising funds', async ({ page }) => {
		const button = page.locator('section > article > footer > button');
		await expect(button).toHaveClass(/lg primary fullWidthMobile/);
		await expect(button).toHaveText(/Start raising funds/);
	});
});
