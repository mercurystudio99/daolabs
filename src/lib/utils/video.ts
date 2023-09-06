import { pinFileToIpfs, ipfsCidUrl } from '$utils/ipfs';
import type { VideoNftConfig } from '$models/minter/nft-config';

export function createCoverFromVideoNft(nft: VideoNftConfig) {
	let coverBlob: Promise<Blob> | undefined;

	if (!nft.cover) {
		const canvas = document.createElement('canvas');
		const video = document.createElement('video');
		video.src = nft.file;
		video.muted = true;
		video.loop = true;
		video.autoplay = true;
		video.crossOrigin = 'anonymous';

		// Create a promise that resolves when the 'loadeddata' event is fired
		// for the video element
		const videoLoadedPromise = new Promise((resolveVideo, reject) => {
			video.addEventListener('loadeddata', () => {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

				coverBlob = new Promise((resolve) => {
					canvas.toBlob(async (blob) => {
						try {
							const pinataResponse = await pinFileToIpfs(blob);
							nft.cover = ipfsCidUrl(pinataResponse.IpfsHash);
						} catch (e) {
							console.error(e);
						} finally {
							// Resolve the promise with the value of the 'blob' argument
							resolve(blob);
						}
					});
				});

				// Resolve the videoLoadedPromise with the coverBlob variable
				resolveVideo(coverBlob);
			});

			// Listen for any errors that occur on the video element
			video.addEventListener('error', (event) => {
				console.log(`An error occurred on the video element: ${event.message}`);
				reject(event.message);
			});
		});

		// Return the videoLoadedPromise
		return videoLoadedPromise;
	}
	return Promise.resolve();
}
