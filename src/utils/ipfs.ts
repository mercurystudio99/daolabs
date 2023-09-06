import axios from 'axios';
import { get } from 'svelte/store';
import { base58 } from 'ethers/lib/utils';
import { IpfsCacheName } from '$models/ipfs-cache/cache-name';
import { consolidateMetadata, type ProjectMetadataV6 } from '$models/project-metadata';
import { readNetwork } from '$stores/web3';
import IPFS_GATEWAY_HOSTNAME from '$constants/ipfs';
import { signEditedDocument } from '$services/templates';
import { dev } from '$app/environment';
import type { PinataPinResponse } from 'pinata_ipfs_sdk';
import type { V2ProjectContextType } from '$models/project-type';

const API_KEY = import.meta.env.VITE_API_KEY as string;

if (!API_KEY) {
	throw new Error('Missing .env vars VITE_API_KEY');
}

export const IPFS_TAGS = {
	[IpfsCacheName.trendingV2]: `${dev ? 'DEV_trending_projects_v2_' : 'trending_projects_v2_'}${
		get(readNetwork).alias
	}`,

	METADATA: dev ? 'DEV_juicebox_project_metadata' : 'juicebox_project_metadata',

	LOGO: dev ? 'DEV_juicebox_project_logo' : 'juicebox_project_logo',
};

export const logoNameForHandle = (handle: string) => `juicebox-@${handle}-logo`;

export const metadataNameForHandle = (handle: string) => `juicebox-@${handle}-metadata`;

export const ipfsCidUrl = (hash: string) => {
	hash = hash.match(/\/ipfs\/\w+$/) ? hash.match(/\w+$/)?.[0] : hash;
	return `https://${IPFS_GATEWAY_HOSTNAME}/ipfs/${hash}`;
};

export const ipfsUrlToCid = (url: string) => url.replace(/^https:\/\/[^/]+\/ipfs\//, '');

export const ipfsCidToFirebaseUrl = (cid: string) =>
	`${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string}/app/ipfs/${cid}`;

export const ipfsCidToWorkerUrl = (cid: string) => `https://juicebox.wtf/ipfs/${cid}`;

export const replaceIpfsDomain = (url: string, size = '') => {
	if (!url) return null;
	if (url.startsWith('ipfs://')) {
		return ipfsCidToWorkerUrl(url.replace('ipfs://', '').replace('ipfs', ''));
	}

	if (url.startsWith('data:') || url.startsWith('blob:')) {
		return url;
	}

	const parseURL = new URL(`${url}${size ? '?size=' : ''}`);
	const paths = parseURL.pathname.split('/');
	const cid = paths.at(-1);

	if (cid.length === 46 || cid.length === 59) {
		return ipfsCidToWorkerUrl(`${cid}${parseURL.search}`);
	}
	return url;
};

export const cidFromUrl = (url: string | undefined) => url?.split('/').pop();

export async function pinFileToIpfs(
	files: File | Blob | string | File[],
	metadata?: Record<string, string | number | Record<string, string | number>>,
	onUploadProgress?: (progressEvent: ProgressEvent) => void,
	cidV0 = false,
) {
	const formdata = new FormData();

	if (Array.isArray(files)) {
		for (let i = 0; i < files.length; i++) {
			formdata.append(files[i].name, files[i]);
		}
	} else {
		formdata.append('file', files);
	}

	if (metadata) {
		formdata.append(
			'pinataMetadata',
			JSON.stringify({
				keyvalues: metadata,
			}),
		);
	}

	// We use axios here because using `pinata.pinFileToIPFS()` leads to this issue: https://github.com/PinataCloud/Pinata-SDK/issues/84
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	return axios
		.post(
			`${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string}/${
				cidV0 ? 'ipfsPinFilesV0Cid/pin' : `app/ipfs`
			}`,
			formdata,
			{
				maxContentLength: Infinity, // this is needed to prevent axios from erroring out with large files
				headers: {
					'Content-Type': 'multipart/form-data;',
					apikey: API_KEY,
				},
				onUploadProgress,
			},
		)
		.then(({ data }) => data as PinataPinResponse);
}

export const uploadProjectMetadata = (
	metadata: Omit<ProjectMetadataV6, 'version'> &
		Pick<V2ProjectContextType, 'confetti'> &
		Pick<V2ProjectContextType, 'documents'>,
	handle?: string,
) => {
	const file = new File(
		[JSON.stringify(consolidateMetadata(metadata), null, '  ')],
		handle ? metadataNameForHandle(handle) : 'juicebox-project-metadata.json',
	);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return pinFileToIpfs(file);
};

export const uploadProjectDocuments = async (documents: V2ProjectContextType['documents']) => {
	try {
		const files = documents
			.filter((doc) => !!doc.markdown)
			.map(async (document) => {
				document.signature = await signEditedDocument(document.markdown);
				return new File([JSON.stringify(document, null, '  ')], document.title);
			});
		const signedDocuments = await Promise.all(files);
		// we don't pin all at the same time because we need to handle them individually at some point
		const pinned = [];
		for (const signedDocument of signedDocuments) {
			const pinInfo = await pinFileToIpfs(signedDocument);
			pinned.push(pinInfo);
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return pinned;
	} catch (error) {
		console.error(error);
		return null;
	}
};

/**
 * Return an IPFS URI using the IPFS URI scheme.
 */
export function ipfsUrl(cid: string, path?: string) {
	return `ipfs://${cid}${path ?? ''}`;
}

/**
 * Return a hex-encoded CID to store on-chain.
 *
 * Hex-encoded CIDs are used to store some CIDs on-chain because they are more gas-efficient.
 */
export function encodeIPFSUri(cid: string) {
	return '0x' + Buffer.from(base58.decode(cid).slice(2)).toString('hex');
}

/**
 * Return the IPFS CID from a given hex-endoded string.
 *
 * Hex-encoded CIDs are used to store some CIDs on-chain because they are more gas-efficient.
 */
export function decodeEncodedIPFSUri(hex: string) {
	// Add default ipfs values for first 2 bytes:
	// - function:0x12=sha2, size:0x20=256 bits
	// - also cut off leading "0x"
	const hashHex = '1220' + hex.slice(2);
	const hashBytes = Buffer.from(hashHex, 'hex');
	const hashStr = base58.encode(hashBytes);
	return hashStr;
}
