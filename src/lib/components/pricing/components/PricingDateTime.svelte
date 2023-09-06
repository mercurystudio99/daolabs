<script lang="ts">
	// import moment from 'moment';
	import { format, add } from 'date-fns';
	import clickOutsideDirective from '$utils/clickOutside';

	import Icon from '$lib/components/Icon';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import InlineCalendar from '$lib/components/datepicker/components/InlineCalendar.svelte';

	// Exports variables
	export let startingDate: string;
	export let endingDate: string;
	export let startingTime: string;
	export let endingTime: string;
	export let required = false;
	export let updateEndDate = () => {};
	export let updateStartDate = () => {};

	// Local variables and constants
	let showStartCalendar = false;
	let showEndCalendar = false;
	let showStartTimeCalendar = false;
	let showEndTimeCalendar = false;

	const AuctionDurationMax = 6; // months
	const theme = {
		calendar: {
			width: '280px',
			shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
		},
	};

	// Functions
	function formatDate(date: string) {
		// return moment(date).format('D MMM YY');
		return format(new Date(date), 'd MMM yy');
	}
	function formatTime(date: string) {
		// return moment(date).format('h:mm A');
		return format(new Date(date), 'h:mm a');
	}
	function handleStartDateSelect({ detail }) {
		startingDate = detail.day.getTime();
		showStartCalendar = false;
		updateStartDate();
	}
	function handleEndDateSelect({ detail }) {
		endingDate = detail.day.getTime();
		showEndCalendar = false;
		updateEndDate();
	}
	function handleStartTimeSelect({ detail }) {
		startingTime = detail.day.getTime();
		showStartCalendar = false;
	}
	function handleEndTimeSelect({ detail }) {
		endingTime = detail.day.getTime();
		showEndCalendar = false;
	}
</script>

<div class="time" id="edition-duration">
	<label class="start-time" for="start-time">
		<PopInfo message="Minting will be possible between the start and end time defined here.">
			Start and end time<small>{required ? '*' : ''}</small>
		</PopInfo>
	</label>
	<div class="combined">
		<div class="input">
			<span
				class:placeholder={!startingDate}
				on:click={() => (showStartCalendar = true)}
				on:keydown
			>
				{startingDate ? formatDate(startingDate) : 'Now'}
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
						end={add(new Date(), { months: AuctionDurationMax })}
						selected={startingDate ? new Date(startingDate) : new Date()}
					/>
				</div>
			{/if}
		</div>
		<div class="icon">-</div>
		<div class="input">
			<span class:placeholder={!endingDate} on:click={() => (showEndCalendar = true)} on:keydown>
				{endingDate ? formatDate(endingDate) : 'Forever'}
				<div class="calendar-icon">
					<Icon name="calendar" />
				</div>
			</span>
			{#if showEndCalendar}
				<div
					class="calendar right"
					use:clickOutsideDirective
					on:clickOutside={() => {
						showEndCalendar = false;
					}}
				>
					<InlineCalendar
						{theme}
						on:select={handleEndDateSelect}
						start={startingDate ? new Date(startingDate) : new Date()}
						end={add(startingDate ? new Date(startingDate) : new Date(), {
							months: AuctionDurationMax,
						})}
						selected={endingDate ? new Date(endingDate) : new Date()}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
<div class="time" id="edition-duration">
	<div class="combined">
		<div class="input">
			<span
				class:placeholder={!startingTime}
				on:click={() => (showStartTimeCalendar = true)}
				on:keydown
			>
				{startingTime ? formatTime(startingTime) : '15:00'}
				<div class="calendar-icon">
					<Icon name="clock" />
				</div>
			</span>
			{#if showStartTimeCalendar}
				<div
					class="calendar"
					use:clickOutsideDirective
					on:clickOutside={() => {
						showStartTimeCalendar = false;
					}}
				>
					<InlineCalendar
						{theme}
						on:select={handleStartTimeSelect}
						start={new Date()}
						timepicker
						selected={startingTime ? new Date(startingTime) : undefined}
					/>
				</div>
			{/if}
		</div>
		<div class="icon">-</div>
		<div class="input">
			<span
				class:placeholder={!endingTime}
				on:click={() => (showEndTimeCalendar = true)}
				on:keydown
			>
				{endingTime ? formatTime(endingTime) : '15:00'}
				<div class="calendar-icon">
					<Icon name="clock" />
				</div>
			</span>
			{#if showEndTimeCalendar}
				<div
					class="calendar right"
					use:clickOutsideDirective
					on:clickOutside={() => {
						showEndTimeCalendar = false;
					}}
				>
					<InlineCalendar
						{theme}
						on:select={handleEndTimeSelect}
						start={endingTime ? new Date(endingTime) : new Date()}
						selected={endingTime ? new Date(endingTime) : undefined}
						timepicker
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.start-time {
		color: var(--text-header);
	}
	.time {
		margin-bottom: 16px;
		.combined {
			display: flex;
			align-items: center;
			margin-top: 8px;

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
					border: 1px solid var(--stroke-primary);
					transition: border-color 120ms ease-out;
					padding: 4px 11px;
					line-height: 1.5715;
					font-weight: 300;
					background: var(--background-l0);
					border-color: var(--stroke-primary);

					&:hover {
						border: var(--background-action-primary) 1px solid;
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
				.right {
					right: 0;
				}
			}
		}
	}
</style>
