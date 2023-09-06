<script lang="ts">
	import { selectedProjectsTab } from '$stores/projectsForm';
	import { readNetwork } from '$stores/web3';
	import type { ProjectCategory } from '$models/project-visibility';

	export let type: ProjectCategory;
	export let title: string;

	const handleClick = () => {
		selectedProjectsTab.set(type);
	};
</script>

<div on:click={handleClick} on:keydown>
	<a
		href="/projects?tab={type}&network={$readNetwork?.alias}"
		class:selected={$selectedProjectsTab === type}>{title}</a
	>
</div>

<style>
	a {
		text-transform: uppercase;
		cursor: pointer;
		border-bottom: '2px solid';
		padding-bottom: 6px;
		font-weight: 500;
		color: var(--text-secondary);
		border-color: transparent;
	}

	.selected {
		color: var(--text-primary);
		border-color: var(--text-primary);
		font-weight: 600;
		border-bottom: 2px solid var(--text-primary);
	}
</style>
