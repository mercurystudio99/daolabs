import { browser } from '$app/environment';

function random(size: number) {
	if (browser) {
		const keys = new Uint16Array(32 + size);
		globalThis.crypto.getRandomValues(keys);
		return keys.slice(32);
	}
}

export { random };
