<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { connectedAccount, readNetwork } from '$stores/web3';
	import { holdingsProjectsQuery } from '$data/project';
	import { showJuicebox } from '$stores/projectsForm';
	import Loading from '$lib/components/Loading.svelte';
	import ProjectCount from './ProjectCount.svelte';
	import type { ProjectV2 } from '$models/subgraph-entities/vX/project';

	let projects: ProjectV2[] | undefined;
	let holdingsProjectsLoading = true;

	async function fetchHoldingsProjects() {
		holdingsProjectsLoading = true;
		if ($connectedAccount !== '') {
			const res = await holdingsProjectsQuery(
				$showJuicebox ? 'juicebox' : 'daolabs',
				$connectedAccount,
			);
			projects = res;
		}
		holdingsProjectsLoading = false;
	}

	onMount(fetchHoldingsProjects);

	$: $connectedAccount && $readNetwork && ($showJuicebox || true) && fetchHoldingsProjects();
</script>

<p>
	{#if holdingsProjectsLoading}
		<div class="loading">
			<Loading height={300} fullWidth />
		</div>
	{:else if projects && projects.length > 0}
		<section>
			{#each projects.filter((p) => p.metadataUri) as project}
				<ProjectCard {project} />
			{/each}
		</section>
		<ProjectCount count={projects.length} />
		<span>
			<Icon name="info" />
		</span>
		Projects that you hold tokens for.
	{:else}
		<span>
			<Icon name="infoCircle" />
		</span>
		You don't hold tokens for any Juicebox project.
	{/if}
</p>

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
</style>
