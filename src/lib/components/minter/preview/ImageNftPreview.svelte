<script lang="ts">
	import CloseButton from '$lib/components/CloseButton.svelte';
	import Icon from '$lib/components/Icon';
	import CommonNftPreview from './CommonNftPreview.svelte';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	import type { ImageNftConfig } from '$models/minter/nft-config';
	import type { TokenStandard } from '$models/minter/token-standard';
	import type { ImageCollection } from '$models/minter/collection-config';

	export let standard: TokenStandard;
	export let nft: ImageNftConfig;
	export let collection: ImageCollection;
	export let imageFile: DropzoneOutput;
	export let discard: () => void;
</script>

<CommonNftPreview {standard} {collection} {nft}>
	<div class="image">
		{#if imageFile}
			<img src={imageFile.preview} alt={imageFile.pinInfo.IpfsHash} />
			<CloseButton size="12px" position="16px" on:click={discard} />
		{:else}
			<div class="missing">
				<Icon name="missingImage" viewBox="0 0 18 16" />
			</div>
		{/if}
	</div>
</CommonNftPreview>

<style lang="scss">
	.image {
		border-bottom: 1px solid var(--stroke-tertiary);
		width: 100%;
		max-width: 450px;
		margin: 16px auto;
		position: relative;

		img {
			object-fit: contain;
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
