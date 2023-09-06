<script lang="ts">
	import { getContext } from 'svelte';
	import { storeContextKey } from '../../context';
	import scrollable from '../../directives/scrollable';
	import { scrollStep } from '../../config/scroll';
	import KeyControls from '../generic/KeyControls.svelte';
	import Grid from '../generic/Grid.svelte';
	import InfiniteGrid from '../generic/InfiniteGrid.svelte';
	import type { DatepickerStore, DatepickerState } from '../../stores/datepicker';

	export let rowCount = 3;
	export let colCount = 3;

	const store = getContext<DatepickerStore>(storeContextKey);

	const close = () => {
		store.setActiveView('months');
	};

	let startYear: number;
	let initialY: number;
	let itemCount: number;

	$: startYear = $store.start.getFullYear();
	$: endYear = $store.end.getFullYear();
	$: numPerPage = rowCount * colCount;
	$: itemCount = Math.ceil(endYear - startYear + 1) / numPerPage;
	$: yearIndex = Math.floor(($store.year - startYear) / numPerPage);
	$: initialY = yearIndex * scrollStep;

	const add = (amount: number) => () => {
		const result = $store.year + amount;
		if (result < startYear || result > endYear) return;
		store.add(amount, 'year', ['month', 'date']);
	};
	const get = (index: number) => {
		const firstYear = startYear + index * numPerPage;
		return {
			years: Array(numPerPage)
				.fill(0)
				.map((d, i) => ({
					number: firstYear + i,
					selectable: firstYear + i <= endYear,
				})),
		};
	};

	const updateIndex = ({ detail: { step: newIndex } }) => {
		store.add(numPerPage * (newIndex - yearIndex), 'year', ['year', 'month', 'date']);
	};

	$: KEY_MAPPINGS = {
		up: add(-1 * colCount),
		down: add(colCount),
		left: add(-1),
		right: add(1),
		enter: close,
		escape: close,
	};

	const select = (year: { number: number; selectable: boolean }) => () => {
		if (!year.selectable) return;
		store.setYear(year.number);
		close();
	};
</script>

<KeyControls {...KEY_MAPPINGS} ctx={['years']} />

<div use:scrollable={{ y: initialY, step: scrollStep, maxSteps: itemCount }} on:y={updateIndex}>
	<InfiniteGrid cellCount={1} {itemCount} bind:index={yearIndex} {get} let:years idKey={'years'}>
		<Grid template="repeat({rowCount}, 1fr) / repeat({colCount}, 1fr)">
			{#each years as year}
				<a
					href="#year"
					on:click|preventDefault={select(year)}
					class:selected={$store.year === year.number}
					class:disabled={!year.selectable}
				>
					{year.number}
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
