<script lang="ts">
	import ProjectsSearch from '$lib/projects/ProjectsSearch.svelte';
	import { searchResults, searchText } from '$stores/projectsForm';
	import ProjectCardStatic from '../ProjectCardStatic.svelte';
	import PopInfo from '../PopInfo.svelte';

	// Export variables
	export let close;
	export let handleSelectService: (serviceName: string) => void;

	// Local variables and constants
	let selected = null;
	const metadata = [];
</script>

<!-- eslint-disable -->
<main>
	<h1>Choose a Juicebox project</h1>
	<div class="project-search">
		<label for="">
			Search for existing project
			<PopInfo message="Text pop info" placement="bottom" />
		</label>
		<ProjectsSearch />
		<p class="description">Enter address manually or search for existing project by handle or ID</p>
		{#if $searchResults.length > 0}
			<div class="list">
				{#each $searchResults as project, number}
					<div
						class="project"
						on:click={() => {
							selected = number;
							handleSelectService(metadata[selected].name);
							close();
						}}
						on:keydown
					>
						<ProjectCardStatic
							{project}
							select={selected === number}
							on:fetchMetadata={({ detail }) => {
								metadata[number] = detail;
							}}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<span class="match">
		{$searchResults.length} projects matching "{$searchText}"
	</span>
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		padding: 8px;
		gap: 24px;
		width: 80vw;
		max-width: 542px;
		overflow: hidden;
		h1 {
			color: var(--text-header);
			font-size: 28px;
			margin-bottom: 0px;
		}
		label {
			color: var(--text-header);
			font-size: 14px;
			font-weight: 500;
			margin-bottom: 6px;
			display: flex;
		}
		.description {
			font-size: 14px;
			color: var(--text-secondary);
			margin-top: 6px;
			margin-bottom: 5px;
		}
		.match {
			text-align: center;
			display: flex;
			justify-content: center;
			padding: 16px 0;
		}
		.list,
		.project {
			margin-top: 16px;
		}
	}
</style>
