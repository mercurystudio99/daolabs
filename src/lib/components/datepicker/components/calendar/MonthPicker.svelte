<script lang="ts">
	import { getContext } from 'svelte';
	import { format } from 'date-fns';
	import { storeContextKey } from '../../context';
	import KeyControls from '../generic/KeyControls.svelte';
	import Grid from '../generic/Grid.svelte';
	import InfiniteGrid from '../generic/InfiniteGrid.svelte';
	import scrollable from '../../directives/scrollable';
	import { scrollStep } from '../../config/scroll';
	import type { DatepickerStore } from '../../stores/datepicker';

	const store = getContext<DatepickerStore>(storeContextKey);

	let grid;
	let initialY: number;
	let itemCount: number;

	const get = (index: number) => ({
		months: Array(12)
			.fill(0)
			.map((d, i) => {
				const month = new Date($store.start.getFullYear() + index, i, 1);
				return {
					year: $store.start.getFullYear() + index,
					label: format(month, 'MMM'),
					index: i,
					disabled: !store.isSelectable(month, ['date']),
				};
			}),
	});

	const close = () => {
		store.setActiveView('days');
	};

	const select = (month: { disabled: boolean; index: number }) => () => {
		if (month.disabled) return;
		store.setMonth(month.index);
		close();
	};

	const add = (amount: number) => () => {
		store.add(amount, 'month', ['date']);
	};

	const KEY_MAPPINGS = {
		left: add(-1),
		right: add(1),
		up: add(-3),
		down: add(3),
		enter: close,
		escape: close,
	};

	$: yearIndex = $store.year - $store.start.getFullYear();
	$: initialY = yearIndex * scrollStep;
	$: itemCount = $store.end.getFullYear() - $store.start.getFullYear() + 1;

	const updateIndex = ({ detail: { step: newIndex } }) => {
		store.add(newIndex - yearIndex, 'year', ['month', 'date']);
	};
</script>

<KeyControls {...KEY_MAPPINGS} ctx={['months']} />
<div use:scrollable={{ y: initialY, step: scrollStep, maxSteps: itemCount }} on:y={updateIndex}>
	<InfiniteGrid
		cellCount={1}
		{itemCount}
		bind:index={yearIndex}
		{get}
		let:months
		bind:this={grid}
		idKey={'months'}
	>
		<Grid template="repeat(4, 1fr) / repeat(3, 1fr)">
			{#each months as month, i}
				<a
					class:disabled={month.disabled}
					class:selected={$store.month === i && $store.year === month.year}
					href="#selectMonth"
					on:click|preventDefault={select(month)}
				>
					{month.label}
				</a>
			{/each}
		</Grid>
	</InfiniteGrid>
</div>

<style>
	div {
		display: grid;
		height: 100%;
	}
</style>
