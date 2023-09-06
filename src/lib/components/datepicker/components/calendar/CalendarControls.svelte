<script lang="ts">
	import { getContext } from 'svelte';
	import { format } from 'date-fns';
	import Icon from '$lib/components/Icon';
	import { storeContextKey } from '../../context';
	import KeyControls from '../generic/KeyControls.svelte';
	import type { DatepickerStore } from '../../stores/datepicker';

	const store = getContext<DatepickerStore>(storeContextKey);

	const UNIT_BY_VIEW = {
		days: 'month',
		months: 'year',
		years: 'year',
	};

	let visibleMonth: number | Date;

	$: visibleMonth = new Date($store.year, $store.month, 1);
	$: label = `${$store.activeView === 'days' ? format(visibleMonth, 'MMMM ') : ''}${$store.year}`;
	$: addMult = $store.activeView === 'years' ? 10 : 1;

	const add = (amount: number) => () => {
		const activeView = $store.activeView;
		store.add(amount * addMult, UNIT_BY_VIEW[activeView] as string);
	};

	const VIEW_TRANSITIONS = ['days', 'months', 'years'];
	const updateActiveView = () => {
		const activeView = $store.activeView;
		const transitionIndex = VIEW_TRANSITIONS.indexOf(activeView) + 1;
		const newView = transitionIndex ? VIEW_TRANSITIONS[transitionIndex] : null;
		if (newView) store.setActiveView(newView);
	};

	const KEY_MAPPINGS = {
		pageDown: add(-1),
		pageUp: add(1),
		control: updateActiveView,
	};
</script>

<KeyControls ctx={['days', 'months', 'years']} limit={180} {...KEY_MAPPINGS} />
<div class="controls">
	<div class="button" on:click={add(-1)} on:keydown>
		<Icon name="left" viewBox="0 0 36 36" />
	</div>
	<span class="button label" on:click={updateActiveView} on:keydown>
		{label}
	</span>
	<div class="button" on:click={add(1)} on:keydown>
		<Icon name="right" viewBox="0 0 36 36" />
	</div>
</div>

<style>
	.controls {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		text-align: center;
		z-index: 2;
		border-bottom: 1px solid var(--sc-theme-calendar-colors-border);
		font-size: 1.5em;
		overflow: hidden;
	}
	.controls > :global(*) {
		padding: 0 12px;
		display: grid;
		align-items: center;
	}
	.button {
		padding: 10px 12px;
		cursor: pointer;
		background: var(--sc-theme-calendar-colors-background-primary);
		transition: all 100ms linear;
	}
	.button:hover {
		background: var(--sc-theme-calendar-colors-background-hover);
	}
	.label {
		font-size: 16px;
	}
</style>
