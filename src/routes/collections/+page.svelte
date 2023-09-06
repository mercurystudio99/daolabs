<script lang="ts">
	import { onMount } from 'svelte';
	import TrendingCollections from '$lib/collections/TrendingCollections.svelte';
	import AllCollections from '$lib/collections/AllCollections.svelte';
	import CollectionsInfo from '$lib/collections/CollectionsInfo.svelte';
	import CollectionsTabs from '$lib/collections/CollectionsTabs.svelte';
	import CollectionsSearch from '$lib/collections/CollectionsSearch.svelte';

	import {
		selectedCollectionsTab,
		scrollTarget,
		hasSearched,
		searchResults,
		isSearching,
		searchText,
	} from '$stores/collectionsForm';
	import CollectionsFilterAndSort from '$lib/collections/CollectionsFilterAndSort.svelte';
	import CollectionsSearchResults from '$lib/collections/CollectionsSearchResults.svelte';
	import { page } from '$app/stores';

	onMount(() => {
		const currentTab = ($page.url.searchParams.get('tab') || 'all') as 'trending' | 'all';
		selectedCollectionsTab.set(currentTab);
	});
</script>

<svelte:head>
	<title>Collections | MOVEMENT</title>
</svelte:head>

<div bind:this={$scrollTarget} class="wrapper">
	<section id="collections">
		<CollectionsInfo />
		<CollectionsSearch />
		{#if $hasSearched}
			<CollectionsSearchResults
				collections={$searchResults}
				loading={$isSearching}
				searchText={$searchText}
			/>
		{:else}
			<div class="controls">
				<CollectionsTabs />
				<CollectionsFilterAndSort showSort={$selectedCollectionsTab === 'all'} />
			</div>

			{#if $selectedCollectionsTab === 'trending'}
				<TrendingCollections />
			{:else if $selectedCollectionsTab === 'all'}
				<AllCollections />
			{/if}
		{/if}
	</section>
</div>

<style>
	section {
		max-width: 1080px;
		margin: auto;
		padding: 20px;
	}
	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		max-width: 100vw;
		position: relative;
	}

	.wrapper {
		/* Accout for header height */
		height: calc(100vh - 64px);
		overflow-y: auto;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		.wrapper {
			margin-top: 68px;
			flex-wrap: wrap;
		}
		.controls {
			margin-top: 16px;
			margin-bottom: 16px;
			gap: 16px;
		}
	}

	@media (min-width: 767.99px) {
		.controls {
			height: 80px;
		}
	}
</style>
