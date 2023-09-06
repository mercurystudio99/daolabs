<script lang="ts">
	import { onMount } from 'svelte';
	import { parseUnits } from 'ethers/lib/utils';
	import { getCollections } from '$data/nft';
	import Loading from '$lib/components/Loading.svelte';
	import { readNetwork } from '$stores/web3';
	import SmallCard from '$lib/components/SmallCard.svelte';
	import { getCollectionPrice } from '$utils/collectionHelpers';
	import Carousel from '$lib/components/Carousel.svelte';
	import type { BigNumber } from 'ethers';
	import type { Collection } from '$models/minter/collection-config';

	let collections: Collection[] = [];
	let collectionsLoading = true;

	let slides: Collection[][] = [];

	async function fetchCollections() {
		collections = await getCollections();
		// only use first 3 * 6 collections
		collections = collections.slice(0, 18);
		// split into slides
		slides = [];
		for (let i = 0; i < collections.length; i += 6) {
			slides.push(collections.slice(i, i + 6));
		}
		collectionsLoading = false;
	}

	function getCollectionPriceBigNumber(collection: Collection): BigNumber {
		const floor = getCollectionPrice(collection);
		if (typeof floor === 'string') {
			return parseUnits('0', 'ether');
		}
		const floorParsed = parseUnits(floor.toString(), 'ether');
		return floorParsed;
	}

	onMount(() => readNetwork.subscribe(() => fetchCollections()));
</script>

<section>
	<article>
		<h3>Notable collections</h3>
		{#if collectionsLoading}
			<Loading height={300} />
		{:else if collections.length === 0}
			<p>No collections found on <b>{$readNetwork.alias}</b>.</p>
		{:else}
			<Carousel items={slides} startIndex={0} let:item let:index round={false}>
				<div class="collections" id={index}>
					{#each item as collection}
						<SmallCard
							href="/collection/{collection.id}"
							logoUri={collection.logo}
							title={collection.name}
							loading={collectionsLoading}
							left={{
								label: 'floor',
								value: getCollectionPriceBigNumber(collection),
							}}
						/>
					{/each}
				</div>
			</Carousel>
		{/if}
	</article>
</section>

<style>
	h3 {
		color: var(--text-header);
		font-family: 'Montserrat';
		font-style: normal;
		font-weight: 700;
		font-size: 16px;
		/* float: left; */
		line-height: 25px;
		letter-spacing: -0.002em;
		margin-bottom: 26px;
	}

	article {
		margin: auto;
		max-width: 1150px;
	}

	section {
		margin: 80px 0px 0px;
		padding: 80px 40px;
		background: var(--background-l1);
	}

	.collections {
		display: flex;
		gap: 20px;
		justify-content: space-between;
		margin: 0px auto;
		flex-wrap: wrap;
		padding: 0px 0px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		section {
			padding: 80px 40px;
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 767px) {
		.collections {
			width: 100%;
			padding: 40px 10px;
		}
	}

	@media (min-width: 768px) and (max-width: 1100px) {
		.collections {
			justify-content: center;
		}
	}

	@media (max-width: 850px) {
		section {
			margin-top: 50px;
		}
	}
</style>
