import { browser } from '$app/environment';
import type * as CSS from 'csstype';

export function htmlToText(html: string): string {
	if (typeof window === 'undefined') return '';
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.innerText;
}

export function dateToString(date: Date | number, format = 'MM/DD/YYYY'): string {
	const tmpDate = new Date(date);
	const month = `${tmpDate.getMonth() + 1}`.padStart(2, '0');
	const day = `${tmpDate.getDate()}`.padStart(2, '0');
	const year = `${tmpDate.getFullYear()}`.padStart(4, '0');
	return format.replace('MM', month).replace('DD', day).replace('YYYY', year);
}

export function cutEthAddress(value: string): string {
	return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function getBaseRem(): string {
	if (!browser) {
		return '';
	}

	return document.documentElement.style.getPropertyValue('--primary-font-size');
}

export function pixelToRem(px: number): string {
	if (!browser) {
		return '';
	}

	const baseRem = parseFloat(getBaseRem().replace(/,/g, '.')) || 16;

	return `${(1 / baseRem) * px}rem`;
}

export function toSentenceCase(input: string) {
	return input.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function formatStyleKey(key: string) {
	return key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function objectToStyleString(obj: CSS.Properties) {
	return Object.entries(obj)
		.map(([key, value]) => `${formatStyleKey(key)}: ${value as string}`)
		.join('; ');
}

export function capitalize(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
