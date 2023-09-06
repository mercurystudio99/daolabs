import {
	PfpConstraintType,
	type PfpAttribute,
	type PfpNftConfig,
	type PfpProperty,
} from '$models/minter/nft-config';
import { randomGenerator } from '$lib/utils/sfc32';
import { pinFileToIpfs } from '$utils/ipfs';
import type { PfpCollection } from '$models/minter/collection-config';
import type { PinataPinResponse } from 'pinata_ipfs_sdk';

export type ShuffledNft = {
	[key: string]: PfpProperty;
};

export function calculateTotalCombinations(nft: PfpNftConfig, maxCombinations: number = 0): number {
	let combinationCount = 1;
	for (const attribute of nft.layers) {
		let propertyCount = 0;
		for (const property of attribute.properties) {
			switch (property.constraint.type) {
				case PfpConstraintType.NONE:
					propertyCount += attribute.properties.length - 1;
					break;
				case PfpConstraintType.COUNT:
					propertyCount += property.constraint.value;
					break;
				case PfpConstraintType.PERCENTAGE:
					propertyCount += Math.round(property.constraint.value * attribute.properties.length);
					break;
			}
		}
		combinationCount *= propertyCount;
		// Short circuit if we've already exceeded the max number of combinations needed
		if (maxCombinations && combinationCount >= maxCombinations) {
			return maxCombinations;
		}
	}
	return combinationCount;
}

export function samplePermutationsFromGenerator(
	rand: Function,
	attributes: PfpAttribute[],
	max: number,
): ShuffledNft[] {
	const results: ShuffledNft[] = [];
	const resultHashs = [];
	const length = attributes?.length;
	let totalPermutations = 1;
	const indices: number[][] = [];
	attributes?.forEach((a) => {
		totalPermutations *= a.properties.length;
		indices.push(Array<number>(a.properties.length).fill(0));
	});
	while (results.length < max && results.length !== totalPermutations) {
		const result = {};
		let resultHash = '';
		for (let i = 0; i < length; i++) {
			const index = Math.floor(rand() * attributes[i].properties.length);
			indices[i][index]++;
			const { value: maxDup, type: constraintType } = attributes[i].properties[index].constraint;
			if (constraintType === PfpConstraintType.COUNT && indices[i][index] > maxDup) {
				i--;
				continue;
			} else if (
				constraintType === PfpConstraintType.PERCENTAGE &&
				indices[i][index] * 100 > max * maxDup
			) {
				i--;
				continue;
			}
			result[attributes[i].name] = attributes[i].properties[index];
			resultHash += `${index},`;
		}
		if (resultHashs.indexOf(resultHash) === -1) {
			results.push(result);
			resultHashs.push(resultHash);
		}
	}
	return results;
}

function getImageTagAsBase64(img: HTMLImageElement, width: number, height: number) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0);

	const dataURL = canvas.toDataURL('image/png');
	const base64Image = dataURL.replace(/^data:image\/png;base64,/, '');
	return `<image href="data:image/png;base64,${base64Image}" x="0" y="0" width="${width}" height="${height}"/>`;
}

function handleSvgDefs(svg: string) {
	const defs = svg.match(/<defs>([\s\S]*)<\/defs>/);
	if (defs) {
		// for each def, replace the id with a random id
		let randomId = Math.random().toString(36).substring(2, 15);
		// if randomId has a number, replace it with a letter
		randomId = randomId.replace(/\d/, (match) => {
			const letters = 'abcdefghijklmnopqrstuvwxyz';
			return letters[parseInt(match, 10) % letters.length];
		});
		const newDefs = defs[1].replace(/id="(.*)"/g, `id="${randomId}-$1"`);
		let updatedSvg = svg.replace(/<defs>([\s\S]*)<\/defs>/, `<defs>${newDefs}</defs>`);
		// replace all references to the old id with the new id
		updatedSvg = updatedSvg.replace(/url\(#(.*)\)/g, `url(#${randomId}-$1)`);
		// in the styles tag, replace the generic classnames with new random ones
		const styles = updatedSvg.match(/<style>([\s\S]*)<\/style>/);
		if (styles) {
			let newStyles = styles[1].replace(/\.([a-zA-Z0-9_-]*)/g, `.${randomId}-$1`);
			// in new styles add a new line for each class
			newStyles = newStyles.replace(/}/g, '}\n');
			updatedSvg = updatedSvg.replace(/<style>([\s\S]*)<\/style>/, `<style>${newStyles}</style>`);
			// replace all references to the old classnames with the new ones
			updatedSvg = updatedSvg.replace(/class=["'](.*?)["']/g, `class="${randomId}-$1"`);
		}
		return updatedSvg;
	}
	return '';
}

async function addLayer(src: string) {
	/**
	 * Handles both svg and png images and returns an SVG tag with the image.
	 */
	const res = await fetch(src);
	const clone = res.clone();
	const blob = await res.blob();

	if (blob.type === 'image/svg+xml') {
		const text = await clone.text();
		const svgWithoutXml = text.replace(/<\?xml.*\?>/, '');
		const svgWithScopedDefs = handleSvgDefs(svgWithoutXml);
		return svgWithScopedDefs;
	}

	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.src = src;
		img.onload = () => resolve(getImageTagAsBase64(img, img.height, img.width));
		img.onerror = reject;
	});
}

export async function getSvgForLayers(layersInOrder: string[]) {
	// for each layer base64 encode the image and add it to the svg
	let svg = '<svg xmlns="http://www.w3.org/2000/svg">';
	for (const layer of layersInOrder) {
		svg += await addLayer(layer);
	}
	svg += '</svg>';
	return svg;
}

export function lastPushedToIpfs(nft: PfpNftConfig) {
	if (!nft.ipfs) {
		return -1;
	}
	return nft.ipfs[0].Timestamp;
}

export function getPFPLayerings(collection: PfpCollection, nftIndex: number) {
	const pfpNft = collection.nfts[nftIndex];

	let seed = pfpNft.seed;
	if (!pfpNft.layers.length) {
		return;
	}
	if (!seed) {
		seed = Math.random().toString().substring(2);
		pfpNft.seed = seed;
	}
	const { rand } = randomGenerator(seed);
	const characters = samplePermutationsFromGenerator(
		rand,
		pfpNft.layers,
		Number(pfpNft.totalSupply),
	);
	return characters;
}

export async function pushPFPAssetsToIpfs(collection: PfpCollection) {
	for (const [index, nft] of collection.nfts.entries()) {
		const ipfs: PinataPinResponse[] = [];
		let seed = nft.seed;
		if (!nft.layers.length) {
			console.log('The nft is empty, should probably be handled by not showing...');
			return;
		}
		if (!seed) {
			seed = Math.random().toString().substring(2);
			nft.seed = seed;
		}
		const { rand } = randomGenerator(seed);
		const characters = samplePermutationsFromGenerator(rand, nft.layers, Number(nft.totalSupply));

		const ordering = nft.layers.map((attr) => attr.name);
		for (const character of characters) {
			const imagesInOrder: string[] = [];
			for (const attr of ordering) {
				const image = character[attr];
				// TODO: handle errors here, inform the user of abnormalities
				imagesInOrder.push(image.file.preview);
			}
			const svg = await getSvgForLayers(imagesInOrder);
			const blob = new Blob([svg], { type: 'image/svg+xml' });
			// @debug - this is the svg
			// const url = URL.createObjectURL(blob);
			// open the url in a new tab
			// window.open(url, '_blank');
			// TODO: handle potential errors
			const pinResponse = await pinFileToIpfs(blob);
			ipfs.push(pinResponse);
		}
		collection.nfts[index].ipfs = ipfs;
	}
	return collection;
}

export function calculateRarity(shuffledNfts: ShuffledNft[], layer: string, attribute: Attribute) {
	const amount = shuffledNfts.reduce((acc, value) => {
		const found = Object.entries(value)?.some(
			(prop) => prop[0] === layer && prop[1].name === attribute.name,
		);
		if (found) {
			acc += 1;
		}
		return acc;
	}, 0);
	const percentage = (amount / shuffledNfts.length) * 100;
	return `${percentage.toFixed(0)}%`;
}
