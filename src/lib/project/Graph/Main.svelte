<script lang="ts">
	import { onMount } from 'svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { chainId } from '$stores/web3';
	import Chart from './Chart.svelte';
	import { daysToMillis } from './utils';
	import { loadBlockRefs } from './loadBlockRefs';
	import { loadProjectEvents } from './loadProjectEvents';
	import { loadTapEvents } from './loadTapEvents';
	import type { Duration, EventRef, ShowGraph } from './types';
	import type { BigNumber } from 'ethers';

	export let width: number;
	export let createdAt: number | undefined = undefined;
	export let projectId: BigNumber | undefined = undefined;

	let duration: Duration;
	let errorMessage = '';
	let showGraph: ShowGraph = 'volume';
	let events: EventRef[] = [];
	let loading = !events.length;

	// @ts-ignore
	const now = new Date() - 5 * 60 * 1000;

	const epochToEpochMs = (epoch: number) => epoch * 1000;

	export const getDuration = ({
		createdAt: creationTs,
		now: currentTs,
	}: {
		createdAt: number | undefined;
		now: number;
	}): Duration => {
		let resultDuration: Duration;
		if (!creationTs) return;
		const createdAtMs = epochToEpochMs(creationTs);
		if (createdAtMs > currentTs - daysToMillis(1)) {
			resultDuration = 1;
		} else if (createdAtMs > currentTs - daysToMillis(7)) {
			resultDuration = 7;
		} else if (createdAtMs > currentTs - daysToMillis(30)) {
			resultDuration = 30;
		} else if (createdAtMs > currentTs - daysToMillis(90)) {
			resultDuration = 90;
		} else {
			resultDuration = 365;
		}

		return resultDuration;
	};

	// function formatEvents(events: any[]): [string, number][] {
	// 	return events.map((event: any) => {
	// 		const date = epochToEpochMs(event.timestamp);
	// 		let dateString = new Date(date).toLocaleDateString() ;
	// 		dateString = dateString.substring(0, dateString.length - 5);
	// 		const {value} = event;
	// 		return [dateString, value] as [string, number];
	// 	});
	// }

	let pendingRequest = 0;

	$: cacheExpiry = Date.now() - daysToMillis(duration) * 0.03;
	const cacheKey = () =>
		`EVENTS_${String($chainId)}_${projectId.toString()}_${showGraph}_${duration}`;

	async function setEvents() {
		try {
			const key = cacheKey();
			const id = $chainId;
			const needShowGraph = showGraph;
			const eventDuration = duration;
			const projectIdStr = projectId.toString();

			if (!events.length) loading = true;
			const requistId = ++pendingRequest;
			const blockRefs = await loadBlockRefs({ duration, now });
			const projectEvents = await loadProjectEvents({
				blockRefs,
				showGraph,
				projectId,
				cv: '2',
			});

			if (showGraph === 'balance') {
				const tapEvents = await loadTapEvents({ projectId, duration, now });
				projectEvents.concat(tapEvents);
			}

			let sortedEvents = projectEvents.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
			sortedEvents = sortedEvents.map((e, i) => {
				if (e.tapped) {
					return { ...e, previousBalance: sortedEvents[i - 1]?.value };
				}
				return e;
			});
			if (
				requistId === pendingRequest &&
				id === $chainId &&
				needShowGraph === showGraph &&
				eventDuration === duration &&
				projectIdStr === projectId.toString()
			) {
				events = sortedEvents;
				loading = false;
			}
			const cachedEvents = JSON.parse(localStorage.getItem('CACHED_EVENTS') || '{}');
			cachedEvents[key] = {
				events,
				cachedAt: Date.now(),
			};
			localStorage.setItem('CACHED_EVENTS', JSON.stringify(cachedEvents));
		} catch (error) {
			console.log(error);
			if (loading || !events.length) {
				loading = false;
				errorMessage = 'Cannot load data at the moment';
			} else {
				console.error(errorMessage);
			}
		}
	}

	function switchTab(tab: ShowGraph) {
		showGraph = tab;
		setEvents().catch((e) => console.log(e));
	}

	function updateEvents() {
		const key = cacheKey();
		const cachedEvents = JSON.parse(localStorage.getItem('CACHED_EVENTS') || '{}');
		if (cachedEvents[key]) {
			events = cachedEvents[key].events || [];
			const cachedAt = cachedEvents[key].cachedAt as number;
			if (!events.length || cachedAt <= cacheExpiry) {
				loading = true;
				setEvents().catch((e) => console.log(e));
			} else {
				loading = false;
			}
		} else {
			loading = true;
			setEvents().catch((e) => console.log(e));
		}
	}

	onMount(() => {
		duration = getDuration({ createdAt, now });
		updateEvents();
	});

	function handleDurationChange(event: CustomEvent<{ value: Duration }>) {
		duration = event.detail.value;
		updateEvents();
	}

	let lastShowGraph: ShowGraph = showGraph;
	$: if (lastShowGraph !== showGraph) {
		lastShowGraph = showGraph;
		updateEvents();
	}
</script>

<header>
	<div class="tabs">
		<div on:click={() => switchTab('volume')} on:keydown>
			<div class="tab" class:active={showGraph === 'volume'}>Volume</div>
		</div>
		<div on:click={() => switchTab('balance')} on:keydown>
			<div class="tab" class:active={showGraph === 'balance'}>In Treasury</div>
		</div>
	</div>
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
			]}
			on:select={handleDurationChange}
			initial={90}
			value={typeof duration === 'undefined' ? 90 : duration}
		/>
	</div>
</header>

<div>
	{#if loading}
		<Loading height={170} />
	{:else if errorMessage}
		<div class="error">{errorMessage}</div>
	{:else if showGraph === 'volume'}
		<Chart {width} data={events} {duration} />
	{:else if showGraph === 'balance'}
		<Chart {width} data={events} {duration} />
	{/if}
</div>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.tabs {
		display: flex;
		gap: 24px;
	}
	.tab {
		font-weight: 400;
		text-transform: uppercase;
		font-size: 0.8rem;
		color: var(--text-tertiary);
		cursor: pointer;
	}

	.tab.active {
		font-weight: 700;
		color: var(--text-secondary);
	}

	.dropdown {
		width: 100px;
	}

	.error {
		color: var(--text-primary);
		margin-bottom: 20px;
	}
</style>
