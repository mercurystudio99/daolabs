<script lang="ts">
	import { onMount } from 'svelte';
	import { getP5jsTokenIdMetadataJson, type OpenseaMetadata } from '$utils/collectionMetadata';
	import { getRandomGeneratorForPopulation } from '$utils/p5js';
	import PreviewJsonModal from './PreviewJsonModal.svelte';
	import Icon from './Icon';
	import type { P5Collection } from '$models/minter/collection-config';

	export let collection: P5Collection;

	let metadata: OpenseaMetadata;

	let currentCount = 0;
	let currentIndex = 0;
	let currentNft = 0;

	const totalSupply = collection.nfts.reduce((acc, nft) => acc + Number(nft.totalSupply), 0);

	let rand: () => number;
	let seeds: number[] = [];

	function changeTokenId(increment: number) {
		currentIndex += increment;
		currentCount += increment;
		if (currentIndex === -1) {
			// We don't have to think about seed here as we already have it in the seeds array
			currentNft -= 1;
			currentIndex = collection.nfts[currentNft].totalSupply - 1;
		} else if (collection.nfts[currentNft].totalSupply > currentIndex) {
			seeds = [...seeds, rand()];
		} else {
			currentNft += 1;
			currentIndex = 0;
			rand = getRandomGeneratorForPopulation(collection.nfts[currentNft]);
			seeds = [...seeds, rand()];
		}
		metadata = getP5jsTokenIdMetadataJson(
			collection,
			currentNft,
			currentIndex,
			seeds[currentCount],
		);
	}

	onMount(() => {
		const firstPopulation = collection.nfts[0];
		rand = getRandomGeneratorForPopulation(firstPopulation);
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
