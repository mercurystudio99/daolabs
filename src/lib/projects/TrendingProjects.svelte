<script lang="ts">
	import { onMount } from 'svelte';
	import { trendingProjectsQuery } from '$data/project';

	import Icon from '$lib/components/Icon';
	import TrendingProjectsCard from '$lib/components/TrendingProjectsCard.svelte';
	import { connectedAccount, readNetwork } from '$stores/web3';
	import { showJuicebox } from '$stores/projectsForm';
	import Loading from '$lib/components/Loading.svelte';
	import type { TrendingProject } from '$models/subgraph-entities/vX/project';

	export let trendingProjectCount = 12;
	export let trendingWindowDays = 7;

	let trendingProjects: TrendingProject[] | undefined;
	let trendingProjectsLoading = true;

	async function fetchTrendingProjects() {
		trendingProjectsLoading = true;
		trendingProjects = await trendingProjectsQuery(
			$showJuicebox ? 'juicebox' : 'daolabs',
			trendingProjectCount,
			trendingWindowDays,
		);
		trendingProjectsLoading = false;
	}

	onMount(fetchTrendingProjects);

	$: $connectedAccount && $readNetwork && ($showJuicebox || true) && fetchTrendingProjects();
</script>

{#if trendingProjectsLoading}
	<div class="loading">
		<Loading fullWidth height={300} />
	</div>
{:else}
	<section>
		{#each trendingProjects as project, rank}
			<TrendingProjectsCard {rank} {project} days={trendingWindowDays} />
		{/each}
	</section>
	<p>
		<Icon name="infoCircle" />
		Rankings based on number of contributions and volume gained in the last 7 days.
		<a
			href="https://github.com/jbx-protocol/juice-interface/blob/main/src/hooks/Projects.ts#L275"
			target="_blank"
			rel="noopener noreferrer">See code</a
		>
	</p>
{/if}

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
