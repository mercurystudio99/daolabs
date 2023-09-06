import axios from 'axios';
import { randomIntGenerator } from '$lib/utils/sfc32';
import { processNotifications } from '$utils/notification';
import { getPopulatedCanvasFromScript } from '$lib/utils/p5Template';
// import { getVideosFromCanvas } from '$lib/utils/p5Video';
import { ipfsCidUrl, pinFileToIpfs, ipfsUrlToCid } from '$utils/ipfs';
import type { P5NftConfig } from '$models/minter/nft-config';
import type { PinataPinResponse } from 'pinata_ipfs_sdk';
import type { UpdateNotification } from '@web3-onboard/core';

// Assumes a horizontal screen
const PREVIEW_DEFAULT_WIDTH = 760;
const PREVIEW_DEFAULT_HEIGHT = 500;

export function removeRandomSeed(script: string) {
	/**
	 * This will match the pattern "randomSeed(...);" or "randomSeed(...)" and replace it with an empty string.
	 */
	return script.replace(/randomSeed\(([^)]+)(?:\);)?/g, '');
}

export function needsRandomSeed(script: string) {
	const randoms = ['random(', 'randomGaussian(', 'random2D(', 'random3D('];
	return randoms.some((random) => script.includes(random));
}

export function getRandomGeneratorForPopulation(nft: P5NftConfig) {
	const { rand } = randomIntGenerator(nft.seed);
	return rand;
}

export function prepareScriptForIframe(genericScript: string, rand: () => number): string {
	let prepared = removeRandomSeed(genericScript);
	const randInt = rand();
	const addedLines = `
			randomSeed(${randInt});
		`;
	prepared = genericScript.replace(
		/setup\(\)\s*{/,
		`setup() {
			${addedLines}
		`,
	);

	return prepared;
}

function generalPrepareScriptForPreviewImage(genericScript: string): string {
	/**
	 * 1. if createCanvas has dynamic width and height, replace these with static values (e.g. 760, 500)
	 *    1.1 inform user that this is happening?
	 * 2. TODO: account for outputResolution?
	 */
	// first extract the createCanvas clause
	let createCanvasClause = genericScript.match(/createCanvas\(([^)]+)\)/)?.[0];
	if (createCanvasClause) {
		// then replace windowWidth or displayWidth with static value
		createCanvasClause = createCanvasClause.replace(
			/(window|display)Width/g,
			PREVIEW_DEFAULT_WIDTH.toString(),
		);
		// then replace windowHeight or displayHeight with static value
		createCanvasClause = createCanvasClause.replace(
			/(window|display)Height/g,
			PREVIEW_DEFAULT_HEIGHT.toString(),
		);
		// then replace the createCanvas clause with the new one
		return genericScript.replace(/createCanvas\(([^)]+)\)/, createCanvasClause);
	}
	return genericScript;
}

export function prepareScriptForPreviewImage(genericScript: string, rand: () => number): string {
	/**
	 * When creating preview image;
	 * 1. use a random seed from the deterministic random generator
	 * 2. TODO: what if script has no setup()? can this happen?
	 */

	let prepared = removeRandomSeed(genericScript);
	const randInt = rand();
	prepared = genericScript.replace(
		/setup\(\)\s*{/,
		`setup() {
			randomSeed(${randInt});
		`,
	);
	return prepared;
}

export async function getPreviewBlobs(
	nft: P5NftConfig,
	scriptText: string,
	update?: UpdateNotification,
) {
	const { rand } = randomIntGenerator(nft.seed);
	const preparedScript = generalPrepareScriptForPreviewImage(scriptText);
	const blobs: Blob[] = [];

	if (!nft.seed) {
		console.warn(`No seed for nft! Uploading one preview image`);
		const { canvas, iframe } = await getPopulatedCanvasFromScript(preparedScript);
		const blob: Blob = await new Promise((resolve) => canvas.toBlob(resolve));
		document.body.removeChild(iframe);
		blobs.push(blob);
		return blobs;
	}
	// Call prepareScriptForPreviewImage with the script and the rand function the number of times specified by supply
	// as rand is deterministic, the same script will be generated each time
	for (let i = 0; i < nft.totalSupply; i++) {
		const script = prepareScriptForPreviewImage(preparedScript, rand);
		const { canvas, iframe } = await getPopulatedCanvasFromScript(script);
		const blob: Blob = await new Promise((resolve) => canvas.toBlob(resolve));
		// NOTE: removing the iframe here seems bad practice, but can't do so in getPopulatedCanvasFromScript
		document.body.removeChild(iframe);
		if (update) {
			update({ type: 'pending', message: `Preparing preview ${i + 1} of ${nft.totalSupply}` });
		}
		blobs.push(blob);
	}
	return blobs;
}

/**
 * NOTE: Commented out as this whole format thing for scripts need to be rethought.
 * What even is delay and repeat...?
 * currently, we're supporting the coolest thing which is embedded scripts
 * also - this video thing should be done on the server side, and we need a whole
 * new workflow for informing the user of what's going on
 */
// export async function getVideosForScript(nft: P5NftConfig, scriptText: string) {
// 	const { rand } = randomIntGenerator(nft.seed);
// 	const preparedScript = generalPrepareScriptForPreviewImage(scriptText);

// 	// Start off by just doing one
// 	const script = prepareScriptForPreviewImage(preparedScript, rand);
// 	const { canvas, iframe } = await getPopulatedCanvasFromScript(script);
// 	// Get video from canvas, for seconds specified by delay or for 3s
// 	const blobs = await getVideoFromCanvas(canvas, Number(nft.capture?.delay || 3), nft.totalSupply);
// 	// NOTE: can be debugged by URL.createObjectURL(blobs[0])
// 	console.log(blobs);
// 	document.body.removeChild(iframe);
// }

export async function pushPreviewsToIpfs(
	nft: P5NftConfig,
	scriptText: string,
): Promise<PinataPinResponse> {
	let blobs: Blob[] = [];

	const processFunc = async (update: UpdateNotification) =>
		getPreviewBlobs(nft, scriptText, update);

	blobs = (await processNotifications(processFunc, {
		pending: 'Preparing preview(s) of script',
		success: 'Prepared preview(s) of script',
		error: 'Error preparing previews of script',
	})) as Blob[];

	if (!blobs) return null;

	const files = blobs.map((blob, i) => {
		const file = new File([blob], `${i + 1}.png`, { type: 'image/png' });
		return file;
	});

	const processFuncPin = async () => pinFileToIpfs(files);

	const response = (await processNotifications(processFuncPin, {
		pending: 'Pinning preview(s) to IPFS',
		success: 'Pinned preview(s) to IPFS',
		error: 'Error pinning previews to IPFS',
	})) as PinataPinResponse;

	return response;
}

export async function pushScriptToIpfs(scriptText: string) {
	const scriptFile = new Blob([scriptText], { type: 'text/javascript' });
	const processFunc = async () => pinFileToIpfs(scriptFile, void 0);
	const response = (await processNotifications(processFunc, {
		pending: 'Uploading file',
		success: 'Files successfully uploaded',
		error: 'Error uploading files',
	})) as PinataPinResponse;
	if (response) {
		return ipfsCidUrl(response.IpfsHash);
	}
	return '';
}

export function getPreviewUrlForTokenId(nft: P5NftConfig, tokenId: number) {
	const { ipfs } = nft;
	if (!ipfs) {
		return null;
	}
	const ipfsUrl = ipfsCidUrl(ipfs.IpfsHash);
	if (nft.totalSupply === 1 || !nft.seed) {
		return ipfsUrl;
	}
	const previewUrl = `${ipfsUrl}/${tokenId}.png`;
	return previewUrl;
}

async function getScriptFromIpfs(ipfs: string): Promise<string> {
	const url = ipfsUrlToCid(ipfs);
	const res = await axios.get(url, {
		headers: {
			apikey: import.meta.env.VITE_API_KEY as string,
		},
	});
	return res.data as string;
}

export async function getP5NftScripts(nfts: P5NftConfig[]) {
	const groupById = nfts.reduce((acc, nft) => {
		if (!acc[nft._id]) {
			acc[nft._id] = [];
		}
		acc[nft._id].push(nft);
		return acc;
	}, {} as Record<string, P5NftConfig[]>);

	const scriptPromises = [];

	for (const nftId in groupById) {
		const scriptPromise = getScriptFromIpfs(groupById[nftId][0].script).then((script) => {
			const { rand } = randomIntGenerator(groupById[nftId][0].seed);
			return groupById[nftId].map((nft) => {
				const preparedScript = prepareScriptForIframe(script, rand);
				nft.script = preparedScript;
				return { _token: nft._token, data: preparedScript };
			});
		});
		scriptPromises.push(scriptPromise);
	}

	let results = (await Promise.all(scriptPromises)) as { _token: number; data: string }[][];
	// Flatten the array of arrays into a single array
	results = [].concat(...results) as { _token: number; data: string }[];
	return results as { _token: number; data: string }[];
}
