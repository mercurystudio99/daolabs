import { writable } from 'svelte/store';

export const visitedFundingDrawers = writable({
	funding: false,
	token: false,
	rules: false,
});
