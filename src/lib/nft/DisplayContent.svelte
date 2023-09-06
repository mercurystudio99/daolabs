<script lang="ts">
	import RichImgPreview from '$lib/components/RichImgPreview.svelte';
	import IframePreview from '$lib/components/IframePreview.svelte';
	import type { TokenContentMedia } from '@zoralabs/zdk/dist/queries/queries-sdk';

	const baseUrl = 'https://animation-url.on.fleek.co';

	export let content: TokenContentMedia;
	export let image: TokenContentMedia;

	let url = '';
	let style = { height: '500px' };

	// Note - these aren't yet taking into account our own animation_url config of card
	// TODO - add support for our own animation_url config
	const animationUrls = {
		video: {
			url: `${baseUrl}/video`,
			defaultConfig: { autoplay: true, controlsHeight: '30px', centerIconSize: '35px' },
		},
		music: { url: `${baseUrl}/music` },
		cardVertical: `${baseUrl}/card-vertical`,
		cardHorizontal: `${baseUrl}/card-horizontal`,
		cardRound: `${baseUrl}/card-round`,
	};

	function base64(data: object) {
		return window.btoa(JSON.stringify(data));
	}

	function handleIrregular(tokenContent: TokenContentMedia) {
		const isTile = tokenContent?.url?.includes('tiles.wtf/render/ethereal');
		if (isTile) {
			url = tokenContent.url;
			return true;
		}
		return false;
	}

	function prepare(tokenContent: TokenContentMedia) {
		/**
		 * TODO: Handle HTML content, it's one of the mimeTypes zora supports. Checkout how moralis does this also.
		 */
		if (!tokenContent) return;

		if (handleIrregular(tokenContent)) return;

		if (tokenContent.mimeType?.startsWith('video')) {
			const config = base64(animationUrls.video.defaultConfig);
			url = `${animationUrls.video.url}?video=${tokenContent.url}&config=${config}`;
		} else if (tokenContent.mimeType?.startsWith('audio')) {
			const config = base64({
				cover: image.url,
				tracks: [{ file: tokenContent.url }],
			});
			style.height = '750px';
			url = `${animationUrls.music.url}?cid=${config}`;
		} else if (tokenContent.mimeType?.startsWith('text/html')) {
			url = content.url;
		}
	}

	$: prepare(content);
</script>

<!-- NOTE: temporarily just put the image here if it's an image, will have to add support for our animation_urls -->
{#if url}
	<IframePreview src={url} iframeStyle={style} />
{:else if !content?.mimeType || content?.mimeType?.startsWith('image') || (!content && image)}
	<RichImgPreview
		src={content?.url || image?.url}
		width="100%"
		height="100%"
		style={{ margin: '0 auto' }}
		imgStyle={{ borderRadius: '20px' }}
	/>
{/if}
