/**
 * Creates a 32-bit seed from a string.
 * @param str the value to make a seed from
 * @returns string seed
 */

function cyrb128(str: string) {
	let h1 = 1779033703,
		h2 = 3144134277,
		h3 = 1013904242,
		h4 = 2773480762;
	for (let i = 0, k: number; i < str.length; i++) {
		k = str.charCodeAt(i);
		h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
		h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
		h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
		h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
	}
	h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
	h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
	h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
	h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
	return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

/**
 * A 32-bit implementation of the Simple Fast Counter algorithm.
 * https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 * @param a Seed value
 * @param b
 * @param c
 * @param d
 * @returns
 */
function sfc32(a: number, b: number, c: number, d: number) {
	return function () {
		a >>>= 0;
		b >>>= 0;
		c >>>= 0;
		d >>>= 0;
		let t = (a + b) | 0;
		a = b ^ (b >>> 9);
		b = (c + (c << 3)) | 0;
		c = (c << 21) | (c >>> 11);
		d = (d + 1) | 0;
		t = (t + d) | 0;
		c = (c + t) | 0;
		return (t >>> 0) / 4294967296;
	};
}

/**
 * Random number generator using the Simple Fast Counter algorithm.
 * Given a seed, it will always return the same sequence of numbers.
 * If no seed is given, it will create one. The seed is always returned
 * as the firsrt parameter of the returned dict.
 *
 * Method:
 * Create cyrb128 state:
 * 		const seed = cyrb128('apples');
 * Four 32-bit component hashes provide the seed for sfc32.
 * 		const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
 *
 * @param seed: string to seed the generator
 * @returns {seed: string, rand: function}
 */
export function randomGenerator(seed?: string): { seed: string; rand: () => number } {
	if (!seed) {
		seed = Math.random().toString().substring(2);
	}
	const cyrSeed = cyrb128(seed);
	const rand = sfc32(cyrSeed[0], cyrSeed[1], cyrSeed[2], cyrSeed[3]);
	return { seed, rand };
}

export function randomIntGenerator(seed?: string): { seed: string; rand: () => number } {
	if (!seed) {
		seed = Math.random().toString().substring(2);
	}
	const cyrSeed = cyrb128(seed);
	const rand = sfc32(cyrSeed[0], cyrSeed[1], cyrSeed[2], cyrSeed[3]);
	const randInt = () => Math.floor(rand() * 1000000000);
	return { seed, rand: randInt };
}
