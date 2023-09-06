<script lang="ts">
	import { onMount } from 'svelte';
	import TrendingProjects from '$lib/projects/TrendingProjects.svelte';
	import AllProjects from '$lib/projects/AllProjects.svelte';
	import HoldingsProjects from '$lib/projects/HoldingsProjects.svelte';
	import MyProjects from '$lib/projects/MyProjects.svelte';
	import ProjectsInfo from '$lib/projects/ProjectsInfo.svelte';
	import ProjectsTabs from '$lib/projects/ProjectsTabs.svelte';
	import ProjectsSearch from '$lib/projects/ProjectsSearch.svelte';

	import {
		selectedProjectsTab,
		scrollTarget,
		hasSearched,
		searchResults,
		isSearching,
		searchText,
	} from '$stores/projectsForm';
	import ProjectsFilterAndSort from '$lib/projects/ProjectsFilterAndSort.svelte';
	import ProjectsSearchResults from '$lib/projects/ProjectsSearchResults.svelte';
	import { page } from '$app/stores';

	onMount(() => {
		const currentTab = ($page.url.searchParams.get('tab') || 'all') as
			| 'trending'
			| 'holdings'
			| 'myprojects'
			| 'all';
		selectedProjectsTab.set(currentTab);
	});
</script>

<svelte:head>
	<title>Treasuries | MOVEMENT</title>
</svelte:head>

<div bind:this={$scrollTarget} class="wrapper">
	<section id="projects">
		<ProjectsInfo />
		<ProjectsSearch />
		{#if $hasSearched}
			<ProjectsSearchResults
				projects={$searchResults}
				loading={$isSearching}
				searchText={$searchText}
			/>
		{:else}
			<div class="controls">
				<ProjectsTabs />

				<ProjectsFilterAndSort
					showSort={$selectedProjectsTab === 'all'}
					showFilterByArchive={$selectedProjectsTab === 'all'}
				/>
			</div>

			{#if $selectedProjectsTab === 'trending'}
				<TrendingProjects />
			{:else if $selectedProjectsTab === 'holdings'}
				<HoldingsProjects />
			{:else if $selectedProjectsTab === 'myprojects'}
				<MyProjects />
			{:else if $selectedProjectsTab === 'all'}
				<AllProjects />
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
