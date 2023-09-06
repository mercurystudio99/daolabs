<script lang="ts">
	import Icon from '$lib/components/Icon';
	import TrendingCollectionsCard from '$lib/components/TrendingCollectionsCard.svelte';
	import type { Collection } from '$models/minter/collection-config';

	export let collections: (Collection & { volume: string })[];
	export let searchText: string;
	export let loading = false;
</script>

<p>
	{#if loading}
		<div class="loading">
			<Icon name="loading" spin={true} />
		</div>
	{:else}
		<section>
			{#if collections.length > 0}
				{#each collections.filter((p) => p.name) as collection}
					<TrendingCollectionsCard {collection} />
				{/each}
			{/if}
		</section>
		<br />
		{collections.length} collections matching "{searchText}"
	{/if}
</p>

<style>
	p {
		margin-top: 3rem;
	}

	section {
		margin: auto;
		display: grid;
		max-width: 1000px;
		grid-column-gap: 20px;
		grid-row-gap: 12px;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		grid-auto-flow: row;
	}
</style>
