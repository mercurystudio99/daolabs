import i18n from 'sveltekit-i18n';
import lang from './lang.json';

/** @type {import('sveltekit-i18n').Config} */
const config = {
	initLocale: 'en',
	translations: {
		en: { lang },
		ru: { lang },
	},
	loaders: [
		{
			locale: 'en',
			key: 'common',
			loader: async () => (await import('./en/en.json')).default,
		},
		{
			locale: 'ru',
			key: 'common',
			loader: async () => (await import('./ru/ru.json')).default,
		},
	],
};

export const { t, l, locales, locale } = new i18n(config);
