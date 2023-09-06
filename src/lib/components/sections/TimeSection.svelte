<script lang="ts">
	import { format } from 'date-fns';
	import { ArrowRightIcon } from 'svelte-feather-icons';
	import Icon from '$lib/components/Icon';
	import clickOutsideDirective from '$utils/clickOutside';
	import InlineCalendar from '../datepicker/components/InlineCalendar.svelte';
	import CollectionSection from './CollectionSection.svelte';

	export let readonly: boolean;
	export let startDate: number;
	export let endDate: number;

	const theme = {
		calendar: {
			width: '280px',
			shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
		},
	};
	const formatDate = (date: number | Date) => format(date, 'yyyy-MM-dd h:mma');
	let showStartCalendar = false;
	const handleStartDateSelect = ({ detail }) => {
		startDate = detail.day.getTime();
		showStartCalendar = false;
	};
	let showEndCalendar = false;
	const handleEndDateSelect = ({ detail }) => {
		endDate = detail.day.getTime();
		showEndCalendar = false;
	};
</script>

<CollectionSection title="Start and end time" info="Tooltip text">
	<div class="combined">
		<div class="input">
			<span
				class:readonly
				class:placeholder={!startDate}
				on:click={() => !readonly && (showStartCalendar = true)}
				on:keydown
			>
				{startDate ? formatDate(startDate) : 'Now'}
				<div class="calendar-icon">
					<Icon name="calendar" />
				</div>
			</span>
			{#if showStartCalendar}
				<div
					class="calendar"
					use:clickOutsideDirective
					on:clickOutside={() => {
						showStartCalendar = false;
					}}
				>
					<InlineCalendar
						{theme}
						on:select={handleStartDateSelect}
						start={new Date()}
						timepicker
						selected={startDate ? new Date(startDate) : undefined}
					/>
				</div>
			{/if}
		</div>
		<div class="icon">
			<ArrowRightIcon size="1x" />
		</div>
		<div class="input">
			<span
				class:readonly
				class:placeholder={!endDate}
				on:click={() => !readonly && (showEndCalendar = true)}
				on:keydown
			>
				{endDate ? formatDate(endDate) : 'Forever'}
				<div class="calendar-icon">
					<Icon name="calendar" />
				</div>
			</span>
			{#if showEndCalendar}
				<div
					class="calendar flex-end"
					use:clickOutsideDirective
					on:clickOutside={() => {
						showEndCalendar = false;
					}}
				>
					<InlineCalendar
						{theme}
						on:select={handleEndDateSelect}
						start={startDate ? new Date(startDate) : new Date()}
						timepicker
						selected={endDate ? new Date(endDate) : undefined}
					/>
				</div>
			{/if}
		</div>
	</div>
</CollectionSection>

<style lang="scss">
	.combined {
		display: flex;
		align-items: center;

		.icon {
			margin: 0 8px;
		}

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
					border: var(--accent) 1px solid;
				}
			}

			.calendar-icon {
				position: absolute;
				right: 12px;
				top: 6px;
				font-size: 16px;
				color: var(--text-tertiary);
				cursor: pointer;
			}

			.placeholder {
				color: var(--text-tertiary);
			}
			.calendar {
				position: absolute;
				z-index: 1002;
				width: 100%;
				font-weight: 400;
			}
			.flex-end {
				display: flex;
				flex-direction: row-reverse;
			}
		}
	}

	.readonly {
		background: var(--background-l1) !important;
		color: var(--text-secondary) !important;
		border: 1px solid var(--stroke-tertiary) !important;
		cursor: crosshair;
	}
</style>
