/* eslint-disable */
import { toGatewayURL } from 'nft.storage';
import sharp from 'sharp';

import { storage } from '../../init';
import type { Request, Response } from 'express';
import { whitelistedDomains } from '../../constants';
import * as functions from 'firebase-functions';
import fetch from 'cross-fetch';

export const getFileInIpfs = async (cid: string) => {
	const url = toGatewayURL(`ipfs://${cid}`).href;
	const response = await fetch(url);
	functions.logger.info(`Send request to ${url} status ${response.status}`);
	return response;
};

export async function ipfsGateway(request: Request, response: Response) {
	const url = new URL(`http://localhost/${request.path?.replace('/ipfs/', '')}`);
	const cidPath = url.pathname.slice(1);
	const size = request.query?.size;

	const filePath = size ? `${cidPath}?${size}` : cidPath;
	let bucketFile = storage.bucket('juicebox-svelte.appspot.com').file(filePath);
	let [isExists] = await bucketFile.exists();

	if (size && !isExists) {
		bucketFile = storage.bucket('juicebox-svelte.appspot.com').file(cidPath);
		[isExists] = await bucketFile.exists();
	}

	if (isExists) {
		const { contentType } = bucketFile.metadata;
		const readStream = bucketFile.createReadStream();
		response.set('Content-Type', contentType);
		readStream.pipe(response);
		return;
	}

	const ipfsFile = await getFileInIpfs(cidPath);

	if (ipfsFile.status === 200) {
		const contentType = ipfsFile.headers.get('content-type');
		response.set('Content-Type', contentType);
		const origin = whitelistedDomains.find((org) => org === request.headers.origin);
		if (origin) {
			response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
		}
		let data = await ipfsFile.arrayBuffer();
		if (
			contentType === 'image/png' ||
			contentType === 'image/jpeg' ||
			contentType === 'image/gif'
		) {
			const stream = sharp(Buffer.from(data)).webp({
				lossless: true,
				quality: 60,
				alphaQuality: 80,
				force: false,
			});
			if (size) {
				const [width, height] = size.toString().split('x');
				stream.resize(+width, +height);
			}
			const file = await stream.toBuffer();
			bucketFile
				.save(file, {
					contentType: 'image/webp',
					gzip: true,
				})
				.then(() => {
					stream.pipe(response);
				});
		} else {
			bucketFile
				.save(Buffer.from(data), {
					contentType,
					gzip: true,
				})
				.then(() => {
					response.send(Buffer.from(data));
				});
		}
		return;
	}
}
