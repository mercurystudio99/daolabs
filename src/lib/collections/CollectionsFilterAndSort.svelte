<script>
	import { onMount } from 'svelte';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Collapse from '$lib/components/Collapse.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Icon from '$lib/components/Icon';
	import clickOutsideDirective from '$utils/clickOutside';
	import { NftType } from '$models/minter/nft-config';
	import { sortType, filterType } from '$stores/collectionsForm';

	let isOpen = false;
	export let showFilters = true;
	export let showSort = true;

	const SORT_TYPES_MAP = {
		name: 'Name',
		volume: 'Volume',
	};
	const options = [];
	Object.keys(SORT_TYPES_MAP).forEach((key) => {
		options.push({
			label: SORT_TYPES_MAP[key],
			value: key,
		});
	});

	onMount(() => {
		filterType.set(Object.values(NftType));
	});

	let selectAll = true;
</script>

<div class="filter-and-sort">
	{#if showFilters}
		<Collapse bind:isOpen>
			<div class="filter" class:active={false}>
				<Icon name="filter" /> Filter
			</div>
			<div
				slot="content"
				use:clickOutsideDirective
				on:clickOutside={() => {
					isOpen = false;
				}}
			>
				<span>
					<Checkbox bind:checked={selectAll} /> All
				</span>
				{#each $filterType as filter}
					<span>
						<Checkbox bind:checked={selectAll} />
						{filter}
					</span>
				{/each}
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
