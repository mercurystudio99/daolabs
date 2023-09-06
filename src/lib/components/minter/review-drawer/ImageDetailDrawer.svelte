<script lang="ts">
	import ImageViewer from '$lib/components/ImageViewer.svelte';
	import CommonDetailDrawer from './CommonDetailDrawer.svelte';
	import type { ImageNftConfig } from '$models/minter/nft-config';
	import type { ImageCollection } from '$models/minter/collection-config';

	export let isOpen: boolean;
	export let nft: ImageNftConfig;
	export let collection: ImageCollection;
	let displayViewer = false;
</script>

<CommonDetailDrawer bind:isOpen {nft} {collection}>
	<img
		class="image"
		src={nft.file}
		alt={nft.file}
		on:click={() => (displayViewer = true)}
		on:keydown
	/>
</CommonDetailDrawer>
{#if displayViewer}
	<ImageViewer src={nft.file} close={() => (displayViewer = false)} />
{/if}

<style lang="scss">
	.image {
		width: 100%;
		margin-bottom: 16px;
		border-bottom: 1px solid var(--stroke-secondary);
		border-radius: 10px;
	}
</style>
