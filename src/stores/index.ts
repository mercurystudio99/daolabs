import { derived } from 'svelte/store';
import Store from '$utils/Store';
import { toggleHTMLClass, toggleThemeOn } from '$lib/utils/darkmodeToggleUtils';
import { browser } from '$app/environment';

export const darkMode = new Store(browser ? localStorage.getItem('DARK_MODE') === 'true' : false);
export const theme = new Store(browser ? localStorage.getItem('THEME') : 'var(--original-accent)');
export const modal = new Store();
export const modalOptions = new Store(null);
export const svlibLoaded = new Store(false);

modal.subscribe((value) => {
	if (!value) {
		modalOptions.set(null);
	}
});

if (browser) {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		darkMode.set(event.matches);
	});
	darkMode.subscribe((value) => localStorage.setItem('DARK_MODE', JSON.stringify(value)));
	toggleHTMLClass();

	theme.subscribe((value) => {
		toggleThemeOn(value);
	});
	const localStorageTheme = localStorage.getItem('THEME');
	if (localStorageTheme && localStorageTheme !== theme.get()) {
		theme.set(localStorage.getItem('THEME'));
	}
}

export const pageReady = new Store<Record<string, boolean>>({
	web3: false,
});

export const isPageReady = derived(pageReady, ($pageReady) => {
	let ready = true;
	for (const key in $pageReady) {
		ready = ready && !!$pageReady[key];
	}
	return ready;
});

export const currentPageNumber = new Store<number>(0);
