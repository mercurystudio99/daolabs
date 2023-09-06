<script lang="ts">
	import { BigNumber } from 'ethers';
	import { isAddress } from 'ethers/lib/utils';
	import { onDestroy } from 'svelte';
	import { hasSearched, isSearching, searchResults, searchText } from '$stores/projectsForm';
	import { getProjects, useProjectsSearch } from '$data/project';
	import blacklist from '$constants/blacklist';
	import Button from './Button.svelte';
	import Icon from './Icon';
	import Input from './Input.svelte';
	import ProjectCardStatic from './ProjectCardStatic.svelte';
	import type { ProjectV2 } from '$models/subgraph-entities/vX/project';

	export let close;
	export let addPayoutAddress: (address: string) => void;
	export let addProject: (project: ProjectV2) => void;

	let keypressTimeout: NodeJS.Timeout;

	const handleClear = () => {
		$searchText = '';
		$hasSearched = false;
		$searchResults = [];
		$isSearching = false;
	};

	const confirm = () => {
		addPayoutAddress($searchText);
		handleClear();
		close();
	};
	const selectProject = (project: ProjectV2) => {
		addProject(project);
		handleClear();
		close();
	};

	const isNumber = (value: number | string) => !isNaN(Number(value)) && isFinite(Number(value));

	const handleSearch = () => {
		if (keypressTimeout) {
			clearTimeout(keypressTimeout);
		}

		const searching = async () => {
			if ($searchText.length === 0 || isAddress($searchText)) {
				$searchResults = [];
				return;
			}

			$isSearching = true;
			try {
				$searchResults = isNumber($searchText)
					? (
							await getProjects({
								projectId: BigNumber.from($searchText.trim()),
								platform: 'daolabs',
							})
					  ).filter(({ projectId }) => !blacklist.includes(projectId))
					: await useProjectsSearch({ searchText: $searchText.trim().replace('@', '') });
			} catch (error) {
				if (error instanceof Error) {
					console.log(`Failed to search ${error.message}`);
				}
				$searchResults = [];
			} finally {
				$hasSearched = true;
				$isSearching = false;
			}
		};

		keypressTimeout = setTimeout(searching, 500);
	};

	onDestroy(() => {
		clearTimeout(keypressTimeout);
	});
</script>

<main>
	<h3>Choose a project</h3>
	<p>Enter address manually or search for existing Treasury</p>
	<Input
		bind:value={$searchText}
		on:keydown={handleSearch}
		placeholder="Search treasuries by handle or id"
	>
		<div slot="addon">
			{#if $searchText}
				<Icon name="closeCircle" on:click={handleClear} />
			{/if}
		</div>
	</Input>
	<div class="search-container">
		{#if $hasSearched}
			{#if $isSearching}
				<div class="loading">
					<Icon name="loading" spin={true} />
				</div>
			{:else}
				{#if $searchResults.length > 0}
					<div class="list">
						{#each $searchResults as project}
							<div
								class="project"
								on:click|stopPropagation={() => selectProject(project)}
								on:keydown
							>
								<ProjectCardStatic {project} />
							</div>
						{/each}
					</div>
				{/if}
				<span>
					{$searchResults.length} treasuries matching "{$searchText}"
				</span>
			{/if}
		{/if}
	</div>
	<div class="footer">
		<Button size="md" disabled={!isAddress($searchText)} on:click={confirm}>Confirm</Button>
	</div>
</main>

<style lang="scss">
	main {
		width: 70vw;
		max-width: 1080px;
	}
	h3 {
		color: var(--text-header);
		margin-bottom: 40px;
	}
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
	div[slot='addon'] {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		height: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	div[slot='addon']:hover {
		color: var(--icon-action-primary);
	}
	.search-container {
		margin-top: 16px;
		display: flex;
		flex-direction: column;

		.list {
			margin: 16px 0;
			display: grid;
			grid-column-gap: 20px;
			grid-row-gap: 12px;
			grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
			grid-auto-flow: row;
		}

		span {
			margin: 0 auto;
		}
	}
	.footer {
		margin-top: 32px;
		display: flex;
		justify-content: flex-end;
	}
</style>
