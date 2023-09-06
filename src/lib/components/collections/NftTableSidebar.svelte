<script lang="ts">
	import Dropdown from '../Dropdown.svelte';

	type FilterOption = {
		label: string;
		value: any;
	};

	type AttributeFilter = {
		label: string;
		options: FilterOption[];
	};

	export let label: string;
	export let filters: { label: string; options: any[] }[] = [];
	export let onSelect: (filter: AttributeFilter) => (event: CustomEvent) => void;
</script>

<div class="sidebar">
	<div class="inner">
		<span class="label">{label}</span>
		{#if filters.length > 0}
			{#each filters as filter}
				{filter.label}
				<div class="filter">
					<Dropdown
						defaultFirst={true}
						maxHeight="200px"
						options={filter.options}
						value=""
						on:select={onSelect(filter)}
					/>
				</div>
			{/each}
		{:else}
			<i class="no-attributes">No attributes</i>
		{/if}
	</div>
</div>

<style>
	.sidebar {
		min-width: 189px;
		width: 100%;
		max-width: 236px;
		height: 700px;
		margin-right: 25px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		background: var(--background-l1);
	}

	.inner {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		min-height: 100%;
	}

	.label {
		font-weight: 500;
		margin-bottom: 16px;
	}

	.filter {
		margin-bottom: 16px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 400px) {
		.sidebar {
			max-width: unset;
			margin-right: unset;
		}
	}
</style>
