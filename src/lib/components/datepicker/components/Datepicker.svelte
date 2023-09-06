<!-- 
Borrowed from https://github.com/6eDesign/svelte-calendar
with minor changes
Date: 2022-06-21
v3.1.6
-->
<script>
	import { format } from 'date-fns';
	import { setContext } from 'svelte';
	import { derived } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import datepickerStore from '../stores/datepicker';
	import { keyControlsContextKey, storeContextKey } from '../context';
	import { calendar as calendarDefaults } from '../config/defaults';
	import { light as lightTheme } from '../config/theme';
	import Popover from './Popover.svelte';
	import Theme from './generic/Theme.svelte';
	import Calendar from './calendar/Calendar.svelte';

	export let { selected } = calendarDefaults;
	export const { start } = calendarDefaults;
	export const { end } = calendarDefaults;
	export let formatStr = calendarDefaults.format;
	export let formatted = '';
	export let theme = {};
	export let defaultTheme = lightTheme;
	export let startOfWeekIndex = 0;
	export let store = datepickerStore.get({
		selected,
		start,
		end,
		shouldEnlargeDay: true,
		startOfWeekIndex,
	});
	export let timepicker = false;
	setContext(storeContextKey, store);
	setContext(
		keyControlsContextKey,
		derived(store, ($s) => $s.activeView),
	);
	$: selected = $store.selected;
	$: formatted = format(selected, formatStr);
</script>

<Theme {defaultTheme} {theme} let:style>
	<Popover {style} let:key let:send let:receive bind:isOpen={$store.open}>
		<slot {key} {send} {receive} {formatted}>
			<div class="button-container">
				<button in:receive|local={{ key }} out:send|local={{ key }} />
				<span transition:fade|local={{ delay: 150 }} class="button-text">{formatted}</span>
			</div>
		</slot>
		<svelte:fragment slot="contents">
			<Calendar {timepicker} />
		</svelte:fragment>
	</Popover>
</Theme>

<style>
	.button-container {
		display: grid;
	}
	.button-container > * {
		grid-column: 1;
		grid-row: 1;
		height: 100%;
	}
	button {
		padding: 16px 30px;
		background: var(--sc-theme-calendar-colors-background-primary);
		color: var(--sc-theme-calendar-colors-text-primary);
		font-size: 1.3em;
		border-radius: 2px;
		border: 0;
		box-shadow: 4px 3px 9px rgb(0 0 0 / 20%);
		cursor: pointer;
	}
	.button-text {
		padding: 16px 30px;
		color: var(--sc-theme-calendar-colors-text-primary);
		font-size: 1.3em;
		cursor: pointer;
	}
</style>
