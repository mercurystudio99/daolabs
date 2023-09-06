import { NFTStorage, File } from 'nft.storage';
import { PinataPinResponse } from 'pinata_ipfs_sdk';
import { firestore, storage } from '../init';
import { getFileInIpfs } from '../routes/gateway';
import { Collection } from '../types/Collection';
import { PfpAttribute, PfpConstraintType, PfpPopulation, PfpProperty } from '../types/NftConfig';
import { uploadFiles } from './ipfs';
import { randomGenerator } from './sfc32';
export type ShuffledNft = {
	[key: string]: PfpProperty;
};

export function samplePermutationsFromGenerator(
	rand: Function,
	attributes: PfpAttribute[],
	max: number,
): ShuffledNft[] {
	const results: ShuffledNft[] = [];
	const resultHashs = [];
	const length = attributes.length;
	let totalPermutations = 1;
	const indices: number[][] = [];
	attributes.forEach((a) => {
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
			const newStyles = styles[1].replace(/\.([a-zA-Z0-9_-]*)/g, `.${randomId}-$1`);
			updatedSvg = updatedSvg.replace(/<style>([\s\S]*)<\/style>/, `<style>${newStyles}</style>`);
			// replace all references to the old classnames with the new ones
			updatedSvg = updatedSvg.replace(/class="(.*)"/g, `class="${randomId}-$1"`);
		}
		return updatedSvg;
	}
	return '';
}
async function getFile(
	cid: string,
): Promise<{ contentType: string; file: Buffer | ArrayBuffer | string }> {
	const bucketFile = storage.bucket('juicebox-svelte.appspot.com').file(cid);
	const [isExists] = await bucketFile.exists();
	if (isExists) {
		const { contentType } = bucketFile.metadata as { contentType: string };
		const file = await bucketFile.download();
		if (contentType === 'image/svg+xml') {
			const svg = file[0].toString();
			const svgWithoutXml = svg.replace(/<\?xml.*\?>/, '');
			const svgWithScopedDefs = handleSvgDefs(svgWithoutXml);
			return { file: svgWithScopedDefs, contentType };
		}
		return { file: file[0], contentType };
	}
	const file = await getFileInIpfs(cid);
	const contentType = file.headers.get('content-type');
	if (contentType === 'image/svg+xml') {
		const svg = await file.text();
		const svgWithoutXml = svg.replace(/<\?xml.*\?>/, '');
		const svgWithScopedDefs = handleSvgDefs(svgWithoutXml);
		return { file: svgWithScopedDefs, contentType };
	}
	return { file: await file.arrayBuffer(), contentType };
}

async function addLayer(cid: string) {
	const data = await getFile(cid);
	return data.file;
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

export async function pushPFPAssetsToIpfs(collection: Collection, path: string) {
	// if a pfp all the collections are under population
	const pfpNft = collection.nfts[0];
	const pfpNftPopulation = pfpNft.population as unknown as PfpPopulation[];

	// for each population we need to push the assets to ipfs
	for (const [index, population] of pfpNftPopulation.entries()) {
		const ipfs: PinataPinResponse[] = [];
		let seed = population.seed;
		if (!population.attributes.length) {
			console.log('The population is empty, should probably be handled by not showing...');
			return null;
		}
		if (!seed) {
			seed = Math.random().toString().substring(2);
			population.seed = seed;
		}
		const { rand } = randomGenerator(seed);
		const characters = samplePermutationsFromGenerator(
			rand,
			population.attributes,
			Number(population.amount),
		);

		const ordering = population.attributes.map((attr) => attr.name);
		for (const character of characters) {
			const imagesInOrder: string[] = [];
			for (const attr of ordering) {
				const image = character[attr];
				const parseURL = new URL(image.file.preview);
				const paths = parseURL.pathname.split('/');
				const cid = paths.at(-1);
				imagesInOrder.push(cid);
			}
			const nftStorage = new NFTStorage({
				token: process.env.NFT_STORAGE_API_KEY,
			});
			const svg = await getSvgForLayers(imagesInOrder);
			const ipfsFile = new File([svg], `file-${Date.now()}`);
			const cid = await uploadFiles([ipfsFile], {
				storage: nftStorage,
			});
			ipfs.push({
				IpfsHash: cid,
				PinSize: 1,
				Timestamp: Math.floor(new Date().getTime() / 1000).toString(),
			});
			await firestore.doc(path).update({
				count: ipfs.length,
			});
		}
		//@ts-ignore
		collection.nfts[0].population[index].ipfs = ipfs;
	}
	return collection;
}
