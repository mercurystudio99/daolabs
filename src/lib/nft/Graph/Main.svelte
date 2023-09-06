<script lang="ts">
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Chart from '$lib/nft/Graph/Chart.svelte';
	import Icon from '$lib/components/Icon';
	import DetailSection from '$lib/components/minter/review-drawer/DetailSection.svelte';
	import { daysToMillis } from './utils';
	import type { EventRef } from './types';

	export let events: EventRef[] = [];

	let duration: number = 90;
	let eventsByDuration: EventRef[] = [];
	let errorMessage: string;

	function updateEventsByDuration() {
		if (duration == -1) {
			eventsByDuration = events;
		} else {
			const now = Date.now() - 1000 * 60 * 5;
			const durationInMillis = daysToMillis(
				duration === 365 ? duration - 1 : duration === 1 ? 0.99 : duration,
			);
			const fromTime = now - durationInMillis;

			eventsByDuration = events.filter((e) => e.timestamp <= now && e.timestamp >= fromTime);
		}
		if (eventsByDuration.length === 0) {
			errorMessage = 'There is no prices data for selected duration.';
		} else {
			errorMessage = null;
		}
	}

	$: if (events?.length === 0) {
		errorMessage = 'no item activity yet';
	} else {
		updateEventsByDuration();
	}

	function handleDurationChange(event: CustomEvent<{ value: number }>) {
		duration = event.detail.value;
		updateEventsByDuration();
	}
</script>

<DetailSection header="Price history" arrowBelowHeader={false}>
	<header class:hidden={events.length === 0}>
		<div class="dropdown">
			<Dropdown
				size="xs"
				options={[
					{
						label: '24 HOURS',
						value: 1,
					},
					{
						label: '7 DAYS',
						value: 7,
					},
					{
						label: '30 DAYS',
						value: 30,
					},
					{
						label: '90 DAYS',
						value: 90,
					},
					{
						label: '1 YEAR',
						value: 365,
					},
					{
						label: 'All',
						value: -1,
					},
				]}
				on:select={handleDurationChange}
				initial={90}
				value={duration}
			/>
		</div>
	</header>

	<div>
		{#if errorMessage}
			<div class="empty">
				<Icon name="priceHistory" />
				{errorMessage}
			</div>
		{:else}
			<Chart data={eventsByDuration} {duration} />
		{/if}
	</div>
</DetailSection>

<style>
	header {
		display: flex;
		justify-content: flex-end;
		width: 100%;
		font-size: 11px;
	}
	.hidden {
		display: none;
	}
	.dropdown {
		width: 100px;
	}

	.empty {
		color: var(--text-action-primary);
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 0.5em;
		text-transform: uppercase;
		margin-right: 0.5em;
	}
</style>
