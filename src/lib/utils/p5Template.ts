export const generateP5Html = (sketch: string) => `
    <html>
    
    <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/addons/p5.sound.min.js"></script>
        <script src="https://cdn.rawgit.com/jwagner/simplex-noise.js/87440528bcf8ec89840e974d8f76cfe3da548c37/simplex-noise.min.js"></script>
        <script src="https://unpkg.com/@metamoar/moarp5@0.0.58/dist/moarp5.js"></script>
        <script src="https://unpkg.com/ccapture.js@1.1.0/build/CCapture.all.min.js"></script>
    </head>
    
    <body style="margin: 0">
        <script>
        ${sketch}
        </script>
    </body>
    
    </html>`;

function isCanvasPopulated(canvas: HTMLCanvasElement) {
	const context = canvas.getContext('2d');
	const { width, height } = canvas;
	if (context) {
		const imageData = context.getImageData(0, 0, width, height);
		const { data } = imageData;
		const isPopulated = data.some((pixel) => pixel !== 0);
		if (isPopulated) {
			return true;
		}
	}
	const webGl = canvas.getContext('webgl');
	if (webGl) {
		const pixels = new Uint8Array(width * height * 4);
		webGl.readPixels(0, 0, width, height, webGl.RGBA, webGl.UNSIGNED_BYTE, pixels);
		return pixels.some((pixel) => pixel !== 0);
	}
}

export async function getPopulatedCanvasFromScript(script: string) {
	const p5Template = generateP5Html(script);
	const iframe = document.createElement('iframe');
	let canvas: HTMLCanvasElement | null = null;
	iframe.id = `p5js-iframe-${Date.now()}`;
	iframe.srcdoc = p5Template;
	iframe.style.display = 'none';
	document.body.appendChild(iframe);
	const iframeLoadPromise = new Promise<void>((resolve, reject) => {
		iframe.onload = () => {
			let tries = 0;
			let timeoutId: ReturnType<typeof setTimeout> = null;
			const timeoutFunc = () => {
				canvas = iframe.contentDocument.querySelector('canvas');
				try {
					if (canvas && isCanvasPopulated(canvas)) {
						clearTimeout(timeoutId);
						resolve();
					} else if (tries >= 10) {
						clearTimeout(timeoutId);
						reject('Ran out of tries');
					} else {
						tries++;
						timeoutId = setTimeout(timeoutFunc, tries * 1000);
					}
				} catch (e) {
					clearTimeout(timeoutId);
					reject(e);
				}
			};
			timeoutId = setTimeout(timeoutFunc, 200);
		};
	});
	try {
		await iframeLoadPromise;
		return { canvas, iframe };
	} catch (e) {
		console.error('[getPopulatedCanvasFromScript] error getting canvas from iframe');
		console.error(e);
		return { canvas: null, iframe };
	}
}
