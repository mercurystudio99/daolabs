<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import { format, setDay, addMonths, isSameDay } from 'date-fns';
	import { storeContextKey } from '../../context';
	// import KeyControls from '../generic/KeyControls.svelte';
	import Grid from '../generic/Grid.svelte';
	import InfiniteGrid from '../generic/InfiniteGrid.svelte';
	import Crossfade from '../generic/crossfade/Crossfade.svelte';
	import scrollable from '../../directives/scrollable';
	import { scrollStep } from '../../config/scroll';
	import type { DatepickerStore } from '../../stores/datepicker';

	let now = new Date();

	const dispatch = createEventDispatcher();
	const store = getContext<DatepickerStore>(storeContextKey);
	const duration = 450;
	const legend = Array(7)
		.fill(0)
		.map((d, i) => format(setDay(now, ($store.startOfWeekIndex + i) % 7), 'eee'));

	let initialY: number;

	// const add = (amount: number) => {
	// 	store.add(amount, 'day');
	// };
	const select = (day: Date) => () => {
		if (!store.isSelectable(day)) return;
		store.setDay(day || $store.selected);
		dispatch('select', { day });
		if (!$store.shouldEnlargeDay) {
			store.selectDay();
			return;
		}
		store.enlargeDay();
		setTimeout(() => {
			store.selectDay();
			store.enlargeDay(false);
		}, duration + 60);
	};
	// const KEY_MAPPINGS = {
	// 	left: add(-1),
	// 	right: add(1),
	// 	up: add(-7),
	// 	down: add(7),
	// 	enter: select,
	// 	escape: () => {
	// 		store.close();
	// 	},
	// };
	const calPagesBetweenDates = (a: Date, b: Date) => {
		const yearDelta = b.getFullYear() - a.getFullYear();
		const firstPartialYear = yearDelta ? 12 - a.getMonth() : b.getMonth() - a.getMonth() + 1;
		const fullYears = yearDelta > 1 ? (yearDelta - 1) * 12 : 0;
		const lastPartialYear = yearDelta ? b.getMonth() + 1 : 0;
		return firstPartialYear + fullYears + lastPartialYear;
	};

	const get = (index: number) => {
		const d = addMonths($store.start, index);

		return { days: store.getCalendarPage(d.getMonth(), d.getFullYear()) };
	};

	$: totalMonths = calPagesBetweenDates($store.start, $store.end);
	$: monthIndex = calPagesBetweenDates($store.start, $store.selected) - 1;
	$: initialY = monthIndex * scrollStep;
	$: formatedDate = format($store.selected, 'd');

	const updateIndex = ({ detail: { step: newIndex } }) => {
		store.add(newIndex - monthIndex, 'month', ['date']);
	};
</script>

<!-- <KeyControls {...KEY_MAPPINGS} ctx={['days']} /> -->
<!-- eslint-disable -->
<div class="container">
	<div class="legend">
		{#each legend as label}
			<span>{label}</span>
		{/each}
	</div>
	<Crossfade {duration} let:key let:receive let:send>
		<div class="stage" use:scrollable={{ y: initialY, step: scrollStep }} on:y={updateIndex}>
			<InfiniteGrid
				cellCount={1}
				itemCount={totalMonths}
				bind:index={monthIndex}
				{get}
				let:days
				let:index
				idKey={'days'}
			>
				<Grid template="repeat(6, 1fr) / repeat(7, 1fr)">
					{#each days as day}
						{#if !$store.enlargeDay || index !== monthIndex || !isSameDay(day.date, $store.selected)}
							<a
								href="#pickday"
								on:keydown|preventDefault
								on:click|preventDefault={select(day.date)}
								class:disabled={!store.isSelectable(day.date)}
								class:selected={index === monthIndex && isSameDay(day.date, $store.selected)}
								class:outsider={day.outsider}
								out:send|local={{ key }}
								in:receive|local={{ key }}
							>
								{day.date.getDate()}
							</a>
						{/if}
					{/each}
				</Grid>
			</InfiniteGrid>
		</div>
		{#if $store.enlargeDay}
			<div class="stage selected-big" in:receive|local={{ key }} out:send|local={{ key }}>
				{formatedDate}
			</div>
		{/if}
	</Crossfade>
</div>

<style>
	.container {
		display: grid;
		grid-template-rows: auto 1fr;
	}
	.legend {
		display: grid;
		grid-template: 1fr / repeat(7, 1fr);
		height: var(--sc-theme-calendar-legend-height);
		z-index: 2;
		background: var(--sc-theme-calendar-colors-background-primary);
		border-bottom: 1px solid var(--sc-theme-calendar-colors-border);
		align-items: center;
	}
	a {
		font-size: 1em;
	}
	.stage {
		display: grid;
		grid-row: 2;
		grid-column: 1;
	}
	.selected-big {
		color: var(--sc-theme-calendar-colors-background-highlight);
		background: var(--sc-theme-calendar-colors-background-hover);
		text-align: center;
		align-items: center;
		font-size: var(--sc-theme-calendar-font-large);
		z-index: 2;
		opacity: 1;
		line-height: 0;
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 720px) {
		.selected-big {
			font-size: calc(var(--sc-theme-calendar-font-large) * 0.7);
		}
	}
</style>
