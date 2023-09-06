<script lang="ts">
	import { onMount } from 'svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import Icon from '$lib/components/Icon';
	import CommonNftPreview from './CommonNftPreview.svelte';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	import type { VideoNftConfig } from '$models/minter/nft-config';
	import type { TokenStandard } from '$models/minter/token-standard';
	import type { VideoCollection } from '$models/minter/collection-config';

	export let standard: TokenStandard;
	export let nft: VideoNftConfig;
	export let collection: VideoCollection;
	export let videoFile: DropzoneOutput;
	export let discard: () => void;

	let previewVideo: HTMLVideoElement;

	onMount(() => {
		if (videoFile) {
			previewVideo = document.getElementById('video-preview') as HTMLVideoElement;
		}
	});

	$: if (nft.playback.type === 'Times') {
		let iteration = 1;
		previewVideo = document.getElementById('video-preview') as HTMLVideoElement;
		const times = nft.playback.value;
		setTimeout(() => {
			if (previewVideo) {
				previewVideo.addEventListener('ended', function () {
					if (iteration < parseInt(times)) {
						this.currentTime = 0;
						this.play()
							.then(() => iteration++)
							.catch((e) => console.log(e));
					}
				});
			}
		});
	}
</script>

<CommonNftPreview {standard} {collection} {nft}>
	<div class="video">
		{#if videoFile}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				controls
				id="video-preview"
				src={videoFile.preview}
				loop={nft.playback.type === 'Repeat'}
			/>
			<CloseButton size="12px" position="16px" on:click={discard} />
		{:else}
			<div class="missing">
				<Icon name="missingImage" viewBox="0 0 18 16" />
			</div>
		{/if}
	</div>
</CommonNftPreview>

<style lang="scss">
	.video {
		border-bottom: 1px solid var(--stroke-tertiary);
		object-fit: contain;
		width: 100%;
		max-width: 450px;
		margin: 16px auto;
		position: relative;

		video {
			width: 100%;
		}

		.missing {
			display: flex;
			align-items: center;
			justify-content: center;
			aspect-ratio: 1;
			border: 0.4px solid rgba(0, 0, 0, 0.2);
			font-size: 100px;
			color: rgba(245, 163, 18, 0.24);
		}
	}
</style>
