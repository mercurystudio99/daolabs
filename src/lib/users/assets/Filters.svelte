<script lang="ts">
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Icon from '$lib/components/Icon';
	import TableLargeIcon from '$lib/components/minter/icons/TableLargeIcon.svelte';
	import TableSmallIcon from '$lib/components/minter/icons/TableSmallIcon.svelte';
	import type { Sorting, View } from './types';

	export let sorting: Sorting = 'Minted descend';
	// export let filter: 'collection';
	export let view: View = 'list';
	export let large: boolean = false;
</script>

<div class="filters" id="assetFilters">
	<div class="left">
		<Dropdown
			size="sm"
			bind:value={sorting}
			options={[
				{
					label: 'Minted: last to first',
					value: 'Minted descend',
					icon: 'arrowRight',
					iconProps: { direction: 'e' },
				},
				{
					label: 'Minted: first to last',
					value: 'Minted ascend',
					icon: 'arrowRight',
					iconProps: { direction: 'w' },
				},
				{
					label: 'Price: low to high',
					value: 'Price ascend',
					icon: 'arrowRight',
					iconProps: { direction: 'w' },
				},
				{
					label: 'Price: high to low',
					value: 'Price descend',
					icon: 'arrowRight',
					iconProps: { direction: 'e' },
				},
			]}
		/>
		<!-- NOTE: Temporarily commented out as I'm not sure what else will be in this dropdown? -->
		<!-- <div class="filterType">
			<Dropdown
				size="sm"
				bind:value={filter}
				options={[
					{ label: 'Collections', value: 'collection' },
					{ label: 'ERC20', value: 'erc20' },
				]}
			/>
		</div> -->
	</div>
	<div class="right">
		<Dropdown
			size="sm"
			bind:value={view}
			options={[
				{ label: 'List', value: 'list', icon: 'filter' },
				{ label: 'Group', value: 'group', icon: 'filter' },
			]}
		/>
		{#if view === 'list'}
			{#if large}
				<span
					on:click={() => {
						large = false;
					}}
					on:keydown
				>
					<TableLargeIcon width="18" />
				</span>
			{:else}
				<span
					on:click={() => {
						large = true;
					}}
					on:keydown
				>
					<TableSmallIcon width="18" />
				</span>
			{/if}
		{:else if large}
			<span
				on:click={() => {
					large = false;
				}}
				on:keydown
			>
				<Icon name="maximize" />
			</span>
		{:else}
			<span
				on:click={() => {
					large = true;
				}}
				on:keydown
			>
				<Icon name="minimizeAlt" style="width: 0.8em" />
			</span>
		{/if}
	</div>
</div>

<style>
	.filters {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
	}
	.left {
		display: flex;
		gap: 1rem;
		min-width: 240px;
	}
	.right {
		align-items: center;
		display: flex;
		gap: 1rem;
		width: 200px;
	}

	.right span {
		cursor: pointer;
		line-height: 1;
		font-size: 1.5em;
	}

	/* .filterType {
		width: 220px;
	} */
</style>
