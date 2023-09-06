<script lang="ts">
	import Icon from '$lib/components/Icon';
	import TrendingCollectionsCard from '$lib/components/TrendingCollectionsCard.svelte';
	import { readNetwork } from '$stores/web3';
	import Loading from '$lib/components/Loading.svelte';
	import { getCollections } from '$data/nft';

	let collections: Promise<any[]>;

	$: if ($readNetwork) {
		collections = getCollections();
	}
</script>

{#await collections}
	<div class="loading">
		<Loading fullWidth height={300} />
	</div>
{:then loadedCollections}
	<section>
		{#each loadedCollections.slice(0, 6) as collection}
			<TrendingCollectionsCard {collection} />
		{/each}
	</section>
	<p>
		<Icon name="infoCircle" />
		Rankings based on number of contributions and volume gained in the last 7 days.
		<a
			href="https://github.com/jbx-protocol/juice-interface/blob/main/src/hooks/Collections.ts#L275"
			target="_blank"
			rel="noopener noreferrer">See code</a
		>
	</p>
{:catch error}
	<p style="color: var(--text-failure)">{error}</p>
{/await}

<style>
	section {
		margin: auto;
		margin-bottom: 40px;
		display: grid;
		max-width: 1000px;
		grid-column-gap: 20px;
		grid-row-gap: 12px;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		grid-auto-flow: row;
	}

	p {
		font-weight: 300;
		font-size: 14px;
	}
</style>
