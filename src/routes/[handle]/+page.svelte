<script lang="ts">
	import PageError from '$lib/components/error/PageError.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { querySubgraph } from '$utils/graph';
	import { page } from '$app/stores';
	import ProjectPage from '../projects/_project.svelte';

	let { handle } = $page.params;

	let projectId: number;

	let loading = true;

	async function handleToProjectId(handleProjectId: string) {
		const [project] =
			(await querySubgraph({
				entity: 'project',
				where: [
					{
						key: 'pv',
						value: '2',
					},
					{
						key: 'handle',
						value: handleProjectId.slice(1),
					},
				],
				keys: ['projectId', 'handle'],
			})) || [];

		if (project) {
			projectId = project.projectId;
		}
		loading = false;
	}

	$: handle = $page.params.handle;
	$: if (handle) {
		if (handle.startsWith('@')) handleToProjectId(handle).catch((e) => console.log(e));
		else {
			loading = false;
			projectId = undefined;
		}
	}
</script>

{#if loading}
	<Loading />
{:else if typeof projectId === 'number'}
	<ProjectPage {projectId} />
{:else}
	<PageError customMessage="project '{handle}' not found" />
{/if}
