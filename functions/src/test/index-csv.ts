import { readFileSync } from 'fs';
/* 
import { Timer } from '../utils/timer';
import fetch from 'cross-fetch';
*/

const csvContent = readFileSync('src/assets/nft-rewards-tiers.csv', 'utf8');

/*
(async function () {
	const time = new Timer();
	const response = await fetch('https://us-central1-juicebox-svelte.cloudfunctions.net/pinning', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			csv: csvContent,
			format: 'csv'
		})
	});

	const { cid } = await response.json();
	console.log(`cloud function execution time took: ${time.time()} ms`);
	console.log(`https://cloudflare-ipfs.com/ipfs/${cid}/`);
})();
*/

// eslint-disable-next-line @typescript-eslint/require-await
void (async function () {
	console.log(csvContent);
})().catch();
