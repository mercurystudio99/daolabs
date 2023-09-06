<script>
	import { createEventDispatcher, getContext } from 'svelte';
	import { storeContextKey } from '../../context';
	import ViewTransitionEffect from '../generic/ViewTransitionEffect.svelte';
	import CrossfadeProvider from '../generic/crossfade/CrossfadeProvider.svelte';
	import DatepickerControls from './CalendarControls.svelte';
	import DayPicker from './DayPicker.svelte';
	import MonthPicker from './MonthPicker.svelte';
	import YearPicker from './YearPicker.svelte';
	import TimePicker from './TimePicker.svelte';

	export let timepicker;
	const dispatch = createEventDispatcher();
	const store = getContext(storeContextKey);

	const onDaySelect = ({ detail }) => {
		if (!timepicker) {
			dispatch('select', { day: detail.day });
		}
	};
</script>

<CrossfadeProvider let:key let:send let:receive>
	<div class="wrapper">
		<div in:receive|local={{ key }} out:send|local={{ key }} class="grid">
			<DatepickerControls />
			<div class="contents">
				{#if $store.activeView === 'days'}
					<ViewTransitionEffect>
						<DayPicker on:select={onDaySelect} />
					</ViewTransitionEffect>
				{:else if $store.activeView === 'months'}
					<ViewTransitionEffect>
						<MonthPicker />
					</ViewTransitionEffect>
				{:else if $store.activeView === 'years'}
					<ViewTransitionEffect>
						<YearPicker />
					</ViewTransitionEffect>
				{/if}
			</div>
		</div>
		{#if timepicker}
			<TimePicker on:select />
		{/if}
	</div>
</CrossfadeProvider>

<style>
	.grid {
		display: grid;
		width: var(--sc-theme-calendar-width);
		max-width: var(--sc-theme-calendar-maxWidth);
		grid-template-rows: auto calc(
				min(var(--sc-theme-calendar-maxWidth), var(--sc-theme-calendar-width)) * 6 / 7 +
					var(--sc-theme-calendar-legend-height)
			);
		font-family: Rajdhani, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
			sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
		box-shadow: var(--sc-theme-calendar-shadow);
		background: var(--sc-theme-calendar-colors-background-primary);
		text-align: center;
		color: var(--sc-theme-calendar-colors-text-primary);
	}
	.contents {
		display: grid;
		overflow: hidden;
	}
	.grid .contents > :global(*) {
		display: grid;
		grid-row: 1;
		grid-column: 1;
		height: 100%;
		grid-template: 1fr / 1fr;
	}
	.wrapper {
		display: flex;
	}
</style>
