import { NFTStorage, File } from 'nft.storage-v';
import { cidToV0 } from '../../utils/cid';
import type { Response, Request } from 'express';

export async function pinFilesV0(request: Request & { files: any[] }, response: Response) {
	const contentType = request.headers['content-type'];

	const nftStorage = new NFTStorage({
		token: process.env.NFT_STORAGE_API_KEY,
	});

	let content: string | Buffer;
	let filename = `file-${Date.now()}`;

	if (!request.body && !request.files) {
		response.statusCode = 400;
		response.json({
			error: 'No content',
			success: false,
		});
		return;
	}

	try {
		const opts: { cidVersion: 0 | 1 } = { cidVersion: 0 };
		if (request.files && request.files.length > 1) {
			const files: File[] = [];
			for (let i = 0; i < request.files.length; i++) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
				files.push(new File([request.files[i].buffer], `${request.files[i].originalname}`));
			}
			const cid = cidToV0(
				files.length === 1
					? await nftStorage.storeBlob(files[0], opts)
					: await nftStorage.storeDirectory(files, opts),
			);

			response.statusCode = 201;
			response.json({
				IpfsHash: cid,
				Timestamp: Math.floor(Date.now() / 1000),
				PinSize: request.files.length,
				success: true,
			});
			return;
		}

		if (contentType === 'application/json') {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			content = request.body.content ?? JSON.stringify(request.body, null, '  ');
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			filename = request.body.filename ?? filename;
		}

		if (request.files && request.files.length === 1) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			const [file] = request.files;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			content = file.buffer;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			filename = file.originalname ?? filename;
		}

		const ipfsFile = new File([content], filename);
		const cid = cidToV0(await nftStorage.storeBlob(ipfsFile, opts));

		response.statusCode = 201;
		response.json({
			IpfsHash: cid,
			Timestamp: Math.floor(Date.now() / 1000),
			PinSize: 1,
			success: true,
		});
	} catch (e) {
		console.log(e);
		response.statusCode = 500;
		response.json({ error: 'Internal error', success: false });
		return;
	}
}
