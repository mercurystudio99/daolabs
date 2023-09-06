<script lang="ts">
	import { projectCategory } from '$models/project-visibility';
	import ProjectsTab from './ProjectsTab.svelte';
	import type { ProjectCategory } from '$models/project-visibility';

	const TAB_TYPE_NAMES: { [k in ProjectCategory]: string } = {
		all: 'All',
		holdings: 'Holdings',
		myprojects: 'My Projects',
		trending: 'Trending',
	};
</script>

<nav>
	{#each projectCategory as category}
		<div class="tab">
			<ProjectsTab type={category} title={TAB_TYPE_NAMES[category]} />
		</div>
	{/each}
</nav>

<style>
	nav {
		display: flex;
		align-items: center;
	}
	.tab {
		font-size: 14px;
		margin: 0px 15px;
	}

	.tab:first-of-type {
		margin-left: 0;
	}

	/* Query */
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		nav {
			width: 100%;
			justify-content: center;
		}
	}
	@media (max-width: 400px) {
		.tab {
			font-size: 12px;
		}
	}
</style>
