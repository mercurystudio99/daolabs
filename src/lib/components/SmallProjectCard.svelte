<script lang="ts">
	import { onMount } from 'svelte';
	import { getProjectMetadata } from '$data/project';
	import SmallCard from './SmallCard.svelte';
	import type { ProjectMetadataV6 } from '$models/project-metadata';
	import type { Project } from '$models/subgraph-entities/vX/project';

	export let project: Project;

	let loading = true;
	let metadata: ProjectMetadataV6;

	onMount(async () => {
		try {
			metadata = await getProjectMetadata(project.metadataUri);
		} catch (error) {
			console.log(error);
		}
		loading = false;
	});
</script>

<SmallCard
	href="/projects/{project.platform}/{project.projectId}"
	{loading}
	left={{ value: project.totalPaid, label: 'total raised' }}
	logoUri={metadata?.logoUri}
	title={metadata?.name}
/>
