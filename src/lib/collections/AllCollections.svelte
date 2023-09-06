<script lang="ts">
	import TrendingCollectionsCard from '$lib/components/TrendingCollectionsCard.svelte';
	import { readNetwork } from '$stores/web3';
	import Loading from '$lib/components/Loading.svelte';
	import { getCollections } from '$data/nft';
	import { filterType, sortType } from '$stores/collectionsForm';

	let collections: Promise<any[]>;

	$: if ($readNetwork) {
		collections = getCollections({
			filter: { types: $filterType, deployed: true },
			sort: $sortType,
		});
	}
</script>

{#await collections}
	<div class="loading">
		<Loading fullWidth height={300} />
	</div>
{:then loadedCollections}

	{#if loadedCollections.length === 1}
		<section class="full-width-section">
			{#each loadedCollections as collection}
				<TrendingCollectionsCard {collection} />
			{/each}
		</section>
	{:else}
		<section>
			{#each loadedCollections as collection}
				<TrendingCollectionsCard {collection} />
			{/each}
		</section>
	{/if}
	<div class="collections-count">
		{loadedCollections.length} Collections
	</div>
	{:catch error}
		<p style="color: var(--text-failure)">{error}</p>
{/await}

<style>
	section {
		margin: auto;
		display: grid;
		max-width: 1000px;
		grid-column-gap: 20px;
		grid-row-gap: 12px;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		grid-auto-flow: row;
	}
	.full-width-section {
		width: 100%;
	}
	.collections-count {
		padding: 5rem 0;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--text-secondary);
	}
</style>
