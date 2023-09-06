<script lang="ts">
	import { format } from 'date-fns';
	import InlineCalendar from '$lib/components/datepicker/components/InlineCalendar.svelte';
	import Icon from '$lib/components/Icon';
	import clickOutsideDirective from '$utils/clickOutside';

	export let start: Date = new Date();
	export let timepicker = false;
	export let theme: Record<string, Record<string, string>> = {};
	export let value: number | Date = undefined;
	let showCalendar = false;
	export let formatDateString: string = 'yyyy-MM-dd';

	const formatDate = (date: number | Date) => format(date, formatDateString);
</script>

<div class="input">
	<span class:placeholder={!value} on:click={() => (showCalendar = true)} on:keydown>
		{value ? formatDate(value) : 'Now'}
		<div class="calendar-icon">
			<Icon name="calendar" />
		</div>
	</span>
	{#if showCalendar}
		<div
			class="calendar"
			use:clickOutsideDirective
			on:clickOutside={() => {
				showCalendar = false;
			}}
		>
			<InlineCalendar
				{theme}
				on:select
				{start}
				{timepicker}
				selected={value ? new Date(value) : new Date()}
			/>
		</div>
	{/if}
</div>

<style lang="scss">
	.input {
		flex-grow: 1;
		flex-basis: 50%;
		position: relative;

		span {
			display: flex;
			width: 100%;
			background: transparent;
			border: 1px solid var(--stroke-secondary);
			transition: border-color 120ms ease-out;
			padding: 4px 11px;
			line-height: 1.5715;
			font-weight: 300;
			background: var(--background-l0);

			&:hover {
				border: var(--stroke-primary) 1px solid;
			}
		}

		.calendar-icon {
			position: absolute;
			right: 12px;
			top: 6px;
			color: var(--text-tertiary);
			font-size: 16px;
			cursor: pointer;
		}

		.placeholder {
			color: var(--text-tertiary);
		}
		.calendar {
			position: absolute;
			z-index: 1002;
			font-weight: 400;
		}
	}
</style>
