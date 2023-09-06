export function getVideosFromCanvas(
	canvas: HTMLCanvasElement,
	duration = 5,
	supply = 2,
): Promise<Blob[]> {
	return new Promise((resolve) => {
		const stream = canvas.captureStream(30);
		const mediaRecorder = new MediaRecorder(stream, {
			mimeType: 'video/webm; codecs=vp9',
		});

		const blobs: Blob[] = [];
		let recordedChunks: Blob[] = [];

		mediaRecorder.ondataavailable = function (event) {
			if (event.data.size > 0) {
				recordedChunks.push(event.data);
			}
		};

		const msDuration = duration * 1000;

		mediaRecorder.start();
		let start = performance.now();

		const intervalId = setInterval(() => {
			if (blobs.length === supply) {
				clearInterval(intervalId);
				resolve(blobs);
				return;
			}
			if (performance.now() - start > msDuration) {
				mediaRecorder.stop();
				if (recordedChunks.length > 0) {
					blobs.push(new Blob(recordedChunks, { type: 'video/webm' }));
					recordedChunks = [];
				}
				start = performance.now();
				mediaRecorder.start();
			}
		}, 1000 / 30);
	});
}
