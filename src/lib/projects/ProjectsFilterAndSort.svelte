<script>
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Collapse from '$lib/components/Collapse.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Icon from '$lib/components/Icon';
	import clickOutsideDirective from '$utils/clickOutside';
	import { sortType, showArchived, showJuicebox } from '$stores/projectsForm';

	let isOpen = false;
	export let showFilters = true;
	export let showFilterByArchive = true;
	export let showFilterByJuicebox = true;
	export let showSort = true;

	const SORT_TYPES_MAP = {
		totalPaid: 'Total Raised',
		createdAt: 'Date Created',
	};
	const options = [];
	Object.keys(SORT_TYPES_MAP).forEach((key) => {
		options.push({
			label: SORT_TYPES_MAP[key],
			value: key,
		});
	});
</script>

<div class="filter-and-sort">
	{#if showFilters}
		<Collapse bind:isOpen>
			<div class="filter" class:active={$showArchived}>
				<Icon name="filter" /> Filter
			</div>
			<div
				slot="content"
				use:clickOutsideDirective
				on:clickOutside={() => {
					isOpen = false;
				}}
			>
				{#if showFilterByJuicebox}
					<span>
						<Checkbox bind:checked={$showJuicebox} /> Juicebox
					</span>
				{/if}
				{#if showFilterByArchive}
					<span>
						<Checkbox bind:checked={$showArchived} /> Archived
					</span>
				{/if}
			</div>
		</Collapse>
	{/if}
	{#if showSort}
		<div class="dropdown">
			<Dropdown {options} bind:value={$sortType} />
		</div>
	{/if}
</div>

<style>
	.active {
		color: var(--icon-action-primary);
	}
	.dropdown {
		width: 180px;
		margin-left: 30px;
	}
	.filter-and-sort {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		width: 360px;
	}

	.filter {
		display: flex;
		align-items: center;
		width: 75px;
		justify-content: space-between;
	}

	span {
		display: flex;
		align-items: center;
		padding: 12px 18px;
		font-weight: 300;
	}

	@media (max-width: 768px) {
		.filter-and-sort {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
