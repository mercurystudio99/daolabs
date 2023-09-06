<script lang="ts">
	import { getProjects, type ProjectsOptions } from '$data/project';
	import blacklist from '$constants/blacklist';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import { scrollTarget, showArchived, showJuicebox, sortType } from '$stores/projectsForm';
	import { readNetwork } from '$stores/web3';
	import Loading from '$lib/components/Loading.svelte';
	import { V2ArchivedProjectIds } from '$constants/v2/archivedProjects';
	import { browser } from '$app/environment';
	import type { Project } from '$models/subgraph-entities/vX/project';
	import type { ProjectState } from '$models/project-visibility';

	let loading = false;
	let pageNumber = 0;
	let projects: Project[] | undefined = [];
	let newBatch: Project[] | undefined = [];

	/**
	 * For the love of anything holy to you - if you change this file,
	 * please make sure that the first projects don't load twice.
	 *
	 * I don't want to fix the same issue a fouth time.
	 */

	const previousFetch = {
		showArchived: true,
		orderBy: 'totalPaid',
		network: $readNetwork,
		showJuicebox: $showJuicebox,
	};

	const pageSize = 16;

	async function fetchData(): Promise<void> {
		loading = true;
		const options: ProjectsOptions = {
			orderBy: $sortType,
			pageNumber,
			pageSize,
			orderDirection: 'desc' as 'desc' | 'asc',
			state: ($showArchived ? 'archived' : 'active') as ProjectState,
			...($showArchived
				? {
						projectIds: V2ArchivedProjectIds(),
				  }
				: {}),
			platform: $showJuicebox ? 'juicebox' : 'daolabs',
		};
		newBatch = (await getProjects(options)).filter(
			({ projectId }) => !blacklist.includes(projectId),
		);
		projects = [...projects, ...newBatch];
		loading = false;
	}

	readNetwork.subscribe(($network) => {
		if ($network != previousFetch.network) {
			projects = [];
			newBatch = [];
			fetchData().catch((e) => console.log(e));
		}
	});

	readNetwork.subscribe(($network) => {
		if ($network != previousFetch.network) {
			projects = [];
			newBatch = [];
			fetchData().catch((e) => console.log(e));
		}
	});

	$: if (browser) {
		if (
			previousFetch.orderBy !== $sortType ||
			previousFetch.showArchived !== $showArchived ||
			previousFetch.showJuicebox !== $showJuicebox
		) {
			pageNumber = 0;
			projects = [];
			fetchData()
				.then(() => {
					previousFetch.orderBy = $sortType;
					previousFetch.showArchived = $showArchived;
					previousFetch.showJuicebox = $showJuicebox;
				})
				.catch((e) => console.log(e));
		}
	}

	function handleMetadata() {
		return () => {
			// const metadata = event.detail;
			// archivedProjects[project.projectId] = Boolean(metadata.archived);
		};
	}
</script>

<section>
	{#each projects.filter((p) => p.metadataUri) as project}
		<ProjectCard {project} hideIfArchived={!$showArchived} on:fetchMetadata={handleMetadata()} />
	{/each}
	<InfiniteScroll
		elementScroll={$scrollTarget}
		hasMore={!!newBatch.length}
		threshold={100}
		on:loadMore={() => {
			pageNumber += 1;
			fetchData().catch((e) => console.log(e));
		}}
	/>
</section>

{#if loading}
	<div class="loading">
		<Loading height={200} />
	</div>
{/if}
{#if projects?.length}
	<div class="projects-count">
		{projects.length} Projects
	</div>
{/if}

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
	.projects-count {
		padding: 5rem 0;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--text-secondary);
	}
</style>
