import { darkMode } from '$stores';

async function addStyles(path: string) {
	const globalStyles = await fetch(path);
	const styleText = await globalStyles.text();
	return `<style>${styleText}</style>`;
}

export async function fillGlobalStyles() {
	const styleSheets = [
		'/styles/ant-form.css',
		'/styles/ant-input.css',
		'/styles/antd.css',
		'/styles/button.css',
		'/styles/global.css',
	];
	const styles: string[] = [];
	for await (const path of styleSheets) {
		const result = await addStyles(path);
		styles.push(result);
	}
	return styles;
}

export async function generateCollectionHtml(headContent: string, bodyContent: string) {
	const mode = darkMode.get() ? 'darkmode' : 'lightmode';
	const styles = await fillGlobalStyles();
	return `
<!DOCTYPE html>
<html class="${mode}" lang="en">
<head>
${styles.join('\n')}
${headContent}
</head>
<body>
${bodyContent}
</body>
</html>
`;
}

function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.readAsDataURL(blob);
	});
}

export async function replaceWithBase64(ref: HTMLDivElement, url: string, className: string) {
	if (url) {
		const image = await fetch(url);
		const imageBlob = await image.blob();
		const base64 = await blobToBase64(imageBlob);
		const div = ref.getElementsByClassName(className);
		const img = div[0].getElementsByTagName('img');
		img[0].setAttribute('src', base64);
	}
}

// export async function replaceNftsWithBase64(
// 	ref: HTMLDivElement,
// 	nfts: NftConfig[],
// 	className: string,
// ) {
// 	for await (const [index, nft] of nfts.entries()) {
// 		const url = nft.file.preview;
// 		if (url) {
// 			const image = await fetch(new URL(url));
// 			const imageBlob = await image.blob();
// 			const base64 = await blobToBase64(imageBlob);
// 			const img = ref.getElementsByClassName(className);
// 			img[index].setAttribute('src', base64);
// 		}
// 	}
// }
