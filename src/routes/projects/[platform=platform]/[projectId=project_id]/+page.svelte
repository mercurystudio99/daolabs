<script lang="ts">
	import PageError from '$lib/components/error/PageError.svelte';
	import ProjectPage from '../../_project.svelte';
	import type { ProjectPlatform } from '$constants/platform';

	export let data: { platform: ProjectPlatform; projectId: string };

	$: projectId = Number(data.projectId);
	$: platform = data.platform;
</script>

{#if Number.isInteger(projectId)}
	<ProjectPage {projectId} {platform} redirectIfHasHandle={true} />
{:else}
	<PageError customMessage="project {platform}/{projectId} not found" />
{/if}
