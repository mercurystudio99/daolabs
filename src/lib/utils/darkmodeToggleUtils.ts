import { darkMode, theme } from '$stores';

export function toggleHTMLClass() {
	if (darkMode.get()) {
		document.documentElement.classList.add('darkmode');
		document.documentElement.classList.remove('lightmode');
	} else {
		document.documentElement.classList.add('lightmode');
		document.documentElement.classList.remove('darkmode');
	}
}

export function toggleTheme() {
	darkMode.set(!darkMode.get());
	toggleHTMLClass();
}

export function toggleThemeOn(currentTheme: string) {
	if (currentTheme) {
		document.documentElement.style.setProperty('--accent', currentTheme);
		localStorage.setItem('THEME', currentTheme);
	} else {
		document.documentElement.style.setProperty('--accent', 'var(--original-accent)');
		localStorage.removeItem('THEME');
	}
}

export function setTheme(value: string) {
	if (value === theme.get()) {
		theme.set('');
	} else {
		theme.set(value);
	}
}
