import { expect, test } from '@playwright/test';

test.describe('Landing page header', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test.afterEach(async ({ page }) => {
		await page.close();
	});

	test('exists logo mobile and desktop', async ({ page }) => {
		const logoDesktop = page.locator('img[alt="Juicebox logo"]').nth(0);
		const logoMobile = page.locator('img[alt="Juicebox logo"]').nth(1);
		await expect(logoDesktop).toHaveAttribute('src', '/images/juice_logo-ol.png');
		await expect(logoMobile).toHaveAttribute('src', '/images/juice_logo-ol.png');
	});

	test('exists menu', async ({ page }) => {
		const nav = page.locator('nav');

		const linkProjects = nav.locator('a', { hasText: 'Projects' });
		const linkFaq = nav.locator('a', { hasText: 'FAQ' });
		const linkDiscord = nav.locator('a', { hasText: 'Discord' });
		const elResource = nav.locator('button', { hasText: 'Resources' });

		await expect(linkProjects).toHaveAttribute('href', '/projects');
		await expect(linkFaq).toHaveAttribute('href', '/#faq');
		await expect(linkDiscord).toHaveAttribute('href', 'https://discord.gg/6jXrJSyDFf');

		expect(elResource).toBeDefined();
	});

	test('click nav resources show dropdown', async ({ page }) => {
		const nav = page.locator('nav');
		const elResource = nav.locator('button', { hasText: 'Resources' });
		expect(elResource).toBeDefined();

		await elResource.click();

		const dropdown = page.locator('.dropdown');
		const linkDropdownLegal = dropdown.locator('a', { hasText: 'Legal' });
		const linkDropdownWtfDocs = dropdown.locator('a', { hasText: 'Docs' }).nth(0);
		const linkDropdownDocs = dropdown.locator('a', { hasText: 'Docs' }).nth(1);
		// const linkDropdownBlog = dropdown.locator('a', { hasText: 'Blog' });
		// const linkDropdownWorkspace = dropdown.locator('a', { hasText: 'Workspace' });
		const linkDropdownPodcast = dropdown.locator('a', { hasText: 'Podcast' });
		const linkDropdownBannyverse = dropdown.locator('a', { hasText: 'Bannyverse' });
		const linkDropdownTiles = dropdown.locator('a', { hasText: 'Tiles' });

		await expect(linkDropdownLegal).toHaveAttribute(
			'href',
			'https://daolabs-docs.on.fleek.co/legal/intro/README.md',
		);
		await expect(linkDropdownWtfDocs).toHaveAttribute(
			'href',
			'https://daolabs-docs.on.fleek.co/daolabs/documentation/README.md',
		);
		await expect(linkDropdownDocs).toHaveAttribute('href', 'https://docs.move.xyz/');
		// await expect(linkDropdownBlog).toHaveAttribute('href', 'https://info.juicebox.money/blog/');
		// await expect(linkDropdownWorkspace).toHaveAttribute('href', 'https://juicebox.notion.site/');
		await expect(linkDropdownPodcast).toHaveAttribute(
			'href',
			'https://open.spotify.com/show/4G8ji7vofcOx2acXcjXIa4?si=1e5e6e171ed744e8&nd=1',
		);
		await expect(linkDropdownBannyverse).toHaveAttribute('href', 'https://app.bannyverse.xyz');
		await expect(linkDropdownTiles).toHaveAttribute('href', 'https://tiles.wtf');
	});

	test('exists gas station', async ({ page }) => {
		const gas = page.locator('.gasStatus');
		expect(gas).toBeDefined();
		await expect(gas).toContainText('gwei');
	});

	test('exists change language', async ({ page }) => {
		const language = page.locator('.right-nav').locator('.wrapper');

		expect(language).toBeDefined();
		await expect(language).toContainText('EN');
	});

	test('click language show dropdown', async ({ page }) => {
		const expectLanguages = ['EN', '中文', 'RU', 'TR', 'FR', 'ES', 'PT'];
		const language = page.locator('.right-nav').locator('.wrapper');
		await language.click();

		const dropdown = language.locator('.dropdown');
		expect(dropdown).toBeDefined();

		const label = dropdown.locator('.option').locator('.label');
		const countLabel = await label.count();

		for (let i = 0; i < countLabel; i++) {
			expect(await label.nth(i).innerText()).toContain(expectLanguages[i]);
		}
	});

	test('exists button change theme', ({ page }) => {
		const switchTheme = page.locator('div').getByRole('switch');
		expect(switchTheme).toBeDefined();
	});

	test('exists connect button', async ({ page }) => {
		const button = page.locator('.right-nav').locator('button');
		expect(button).toBeDefined();

		await expect(button).toHaveText(/Connect/, { useInnerText: true });
		await expect(button).toHaveClass(/md primary svelte-*/);
	});
});
