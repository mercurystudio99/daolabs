<!-- 
Borrowed from https://github.com/6eDesign/svelte-calendar
with minor changes
Date: 2022-06-21
v3.1.6
-->
<script lang="ts">
	import { setContext } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import { format } from 'date-fns';
	import datepickerStore from '../stores/datepicker';
	import { keyControlsContextKey, storeContextKey } from '../context';
	import { calendar as calendarDefaults } from '../config/defaults';
	import { light as lightTheme } from '../config/theme';
	import Theme from './generic/Theme.svelte';
	import Calendar from './calendar/Calendar.svelte';
	import CrossfadeBoundary from './generic/crossfade/CrossfadeBoundary.svelte';

	export let selected = calendarDefaults.selected;
	export let start = calendarDefaults.start;
	export let end = calendarDefaults.end;
	export let formatStr = calendarDefaults.format;
	export let formatted = '';
	export let theme = {};
	export let defaultTheme = lightTheme;
	export let startOfWeekIndex = 0;
	export let store = datepickerStore.get({ selected, start, end, startOfWeekIndex });
	export let timepicker = false;

	const focused = writable(false);

	setContext(storeContextKey, store);
	setContext(
		keyControlsContextKey,
		derived([store, focused], ([$s, $focused]) => ($focused ? $s.activeView : undefined)),
	);

	const getFocusSetter = (bool: boolean) => () => focused.set(bool);

	$: selected = $store.selected;
	$: formatted = format(selected, formatStr);
</script>

<CrossfadeBoundary>
	<Theme {defaultTheme} {theme} let:style>
		<div
			{style}
			on:focus={getFocusSetter(true)}
			on:blur={getFocusSetter(false)}
			on:mouseover={getFocusSetter(true)}
			on:mouseout={getFocusSetter(false)}
		>
			<Calendar on:select {timepicker} />
		</div>
	</Theme>
</CrossfadeBoundary>

<style>
	div {
		display: inline-block;
	}
</style>
