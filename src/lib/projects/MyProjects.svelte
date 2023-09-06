<script lang="ts">
	import { onMount } from 'svelte';
	import { connectedAccount, readNetwork } from '$stores/web3';
	import { myProjectsQuery } from '$data/project';
	import Icon from '$lib/components/Icon';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { showJuicebox } from '$stores/projectsForm';
	import Loading from '$lib/components/Loading.svelte';
	import ProjectCount from './ProjectCount.svelte';
	import type { Project } from '$models/subgraph-entities/vX/project';

	let projects: Project[] | undefined;
	let loading = true;

	async function fetchMyProjects() {
		loading = true;
		if ($connectedAccount !== '') {
			const res = await myProjectsQuery($showJuicebox ? 'juicebox' : 'daolabs', $connectedAccount);
			projects = res;
		}
		loading = false;
	}
	onMount(fetchMyProjects);

	$: $connectedAccount && $readNetwork && ($showJuicebox || true) && fetchMyProjects();
</script>

<div>
	{#if loading}
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
		<p>
			<span>
				<Icon name="infoCircle" />
			</span>
			Project(s) you have created.
		</p>
	{:else}
		<p>
			<span>
				<Icon name="exclamationCircle" />
			</span> You haven't created any projects yet.
		</p>
	{/if}
</div>

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
