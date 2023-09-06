<script lang="ts">
	import { onMount } from 'svelte';
	import { getImageTokenIdMetadataJson, type OpenseaMetadata } from '$utils/collectionMetadata';
	import { getSumNftTotalSupply } from '$utils/collectionHelpers';

	import PreviewJsonModal from './PreviewJsonModal.svelte';
	import Icon from './Icon';
	import type { ImageCollection } from '$models/minter/collection-config';

	export let collection: ImageCollection;

	let metadata: OpenseaMetadata;

	let currentCount = 0;
	let currentIndex = 0;
	let currentNft = 0;

	const totalSupply = getSumNftTotalSupply(collection);

	function changeTokenId(increment: number) {
		currentIndex += increment;
		currentCount += increment;
		if (currentIndex === -1) {
			currentNft -= 1;
			currentIndex = collection.nfts[currentNft].totalSupply - 1;
		} else if (collection.nfts[currentNft].totalSupply > currentIndex) {
			// do nothing?
		} else {
			currentNft += 1;
			currentIndex = 0;
		}
		metadata = getImageTokenIdMetadataJson(collection, currentNft, currentCount);
	}
	// NOTE: This is appropiate for ERC721, but we're trying to mimic ERC1155 until we can
	// actually deploy ERC1155.
	// function changeTokenId(increment: number) {
	// 	currentCount += increment;
	// 	if (currentCount < 0) currentCount = collection.nfts.length - 1;
	// 	else if (currentCount >= collection.nfts.length) currentCount = 0;

	// 	metadata = getImageTokenIdMetadataJson(collection, currentCount);
	// }

	onMount(() => {
		changeTokenId(0);
	});
</script>

<header>
	{#if currentCount > 0}
		<button on:click={() => changeTokenId(-1)} class="noStyle">
			<Icon name="caret" direction="s" />
		</button>
	{/if}
	ID: {currentCount + 1}/{totalSupply}
	{#if currentCount < totalSupply - 1}
		<button on:click={() => changeTokenId(1)} class="noStyle">
			<Icon name="caret" />
		</button>
	{/if}
</header>

<PreviewJsonModal json={JSON.stringify(metadata, null, 2)} />

<style>
	header {
		max-width: calc(100% - 2rem);
	}

	button.noStyle {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		line-height: 0;
	}
</style>
