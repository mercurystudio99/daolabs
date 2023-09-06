<script lang="ts">
	import { onMount } from 'svelte';
	import { BigNumber } from 'ethers';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { chainId } from '$stores/web3';
	import Chart from './Chart.svelte';
	import { daysToMillis } from './utils';
	import { loadBlockByFetch } from './loadBlockRefs';
	import type { CachedEventRef, Duration, EventRef, ShowGraph } from './types';

	export let address: string;
	export let width: number;

	let createdAt: number | undefined;
	let duration: Duration = 90;
	let errorMessage = '';
	let showGraph: ShowGraph = 'eth';
	let events: EventRef[] = [];
	let loading = events.length ? false : true;

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
		let resultDuration: Duration = 90;
		if (!creationTs) return resultDuration;
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

	let pendingRequest = 0;

	$: cacheExpiry = Date.now() - daysToMillis(duration) * 0.03;
	const cacheKey = () => `EVENTS_${$chainId}_${address}_${showGraph}_${duration}`;

	async function setEvents() {
		try {
			const key = cacheKey();

			const id = $chainId;
			const needShowGraph = showGraph;
			const eventDuration = duration;

			const localCachedEvents = localStorage.getItem(key);

			if (!events.length) loading = true;
			const requistId = ++pendingRequest;
			const blockRefs = await loadBlockByFetch({ duration, now, address });
			const newEvents: EventRef[] = [];
			const decimal = BigNumber.from('10000000000000000');

			blockRefs.forEach((blockRef) => {
				// TODO: the first time this is called, the balance isn't set. WHY?
				newEvents.push({
					timestamp: blockRef.timestamp,
					value:
						BigNumber.from(blockRef.balance ?? 0)
							.div(decimal)
							.toNumber() / 100,
				});
			});

			let sortedEvents = newEvents.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
			if (
				requistId === pendingRequest &&
				id === $chainId &&
				needShowGraph === showGraph &&
				eventDuration === duration
			) {
				events = sortedEvents;
				loading = false;
			}
			const cachedEvents = JSON.parse(localCachedEvents || '{}') as CachedEventRef;
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

	/*function switchTab(tab: ShowGraph) {
		showGraph = tab;
		setEvents();
	}*/

	function updateEvents() {
		const key = cacheKey();
		const cachedEvents = JSON.parse(
			localStorage.getItem('CACHED_EVENTS') || '{}',
		) as CachedEventRef;
		if (cachedEvents[key]) {
			events = cachedEvents[key].events || [];
			const cachedAt = cachedEvents[key].cachedAt;
			if (!events.length || cachedAt <= cacheExpiry) {
				loading = true;
				void setEvents();
			} else {
				loading = false;
			}
		} else {
			loading = true;
			void setEvents();
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
		<!-- <div on:click={() => switchTab('eth')}>
			<div class="tab" class:active={showGraph === 'eth'}>ETH</div>
		</div>
		<div on:click={() => switchTab('dai')}>
			<div class="tab" class:active={showGraph === 'dai'}>DAI</div>
		</div> -->
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
	{:else if showGraph === 'eth'}
		<Chart {width} data={events} {duration} />
	{:else if showGraph === 'dai'}
		<Chart {width} data={events} {duration} />
	{/if}
</div>

<style>
	header {
		display: flex;
		justify-content: space-between;
		width: 100%;
		font-size: 11px;
		margin: 40px 0 20px;
	}

	.tabs {
		display: flex;
		gap: 24px;
	}

	/* Momentarily comment out while we don't have the right data. */
	/* .tab {
		font-weight: 400;
		text-transform: uppercase;
		font-size: 0.8rem;
		color: var(--text-tertiary);
		cursor: pointer;
	}

	.tab.active {
		font-weight: 700;
		color: var(--text-secondary);
	} */

	.dropdown {
		width: 100px;
	}

	.error {
		color: var(--text-primary);
		margin-bottom: 20px;
	}
</style>
