<script lang="ts">
	import Icon from '$lib/components/Icon';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import type { Project } from '$models/subgraph-entities/vX/project';

	export let projects: Project[];
	export let searchText: string;
	export let loading = false;
</script>

<p>
	{#if loading}
		<div class="loading">
			<Icon name="loading" spin={true} />
		</div>
	{:else}
		{#if projects.length > 0}
			{#each projects.filter((p) => p.metadataUri) as project}
				<ProjectCard {project} />
			{/each}
		{/if}
		<br />
		{projects.length} projects matching "{searchText}"
	{/if}
</p>
