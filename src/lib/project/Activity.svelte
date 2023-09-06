<script lang="ts">
	import { getContext } from 'svelte';
	import Icon from '$lib/components/Icon';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { openModal, bind } from '$lib/components/Modal.svelte';
	import DownloadActivityModal from '$lib/components/DownloadActivityModal.svelte';
	import ProjectEvent from '$lib/components/ProjectEvent';
	import { getProjectEvents } from '$data/event';
	import type { WhereConfig } from '$utils/graph';
	import type { ProjectEvent as ProjectEventType } from '$models/subgraph-entities/vX/project-event';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');

	enum ActivityFilter {
		all = 'All events',
		payEvent = 'Paid',
		redeemEvent = 'Redeemed',
		distributePayoutsEvent = 'Distributed Funds',
		distributeReservedTokensEvent = 'Distributed Tokens',
		deployedERC20Event = 'ERC20 Deployed',
		projectCreateEvent = 'Project Created',
		deployETHERC20ProjectPayerEvent = 'ETH-ERC20 Address Created',
	}

	export let loading: boolean = false;
	export let loadingMetadata = false;
	export let current: ActivityFilter = ActivityFilter['All events'];

	let events: ProjectEventType[] = [];

	const options = Object.keys(ActivityFilter).map((key) => ({
		label: ActivityFilter[key] as string,
		value: key,
	}));

	async function loadEvents(currentFilter: string, from: number, to: number) {
		loading = true;
		const where: WhereConfig<'projectEvent'>[] = [
			{ key: 'pv', value: '2' },
			{ key: 'projectId', value: $project.projectId.toNumber() },
			{ key: 'project', operator: '', value: `{platform: "${$project.platform}"}` },
		];

		if (currentFilter && ActivityFilter[currentFilter] !== 'All events') {
			where.push({
				key: currentFilter as any,
				operator: 'not',
				value: null,
			});
		}
		const projectEvents = await getProjectEvents(where, from, to);
		loading = false;
		return projectEvents;
	}

	async function loadMore() {
		const loadedEvents = await loadEvents(current, events.length, events.length + 50);
		events = [...events, ...loadedEvents];
	}

	function openDownloadModal() {
		openModal(bind(DownloadActivityModal));
	}

	$: $project.events = events;
	$: if (!loadingMetadata) {
		loadEvents(current, 0, 80)
			.then((e) => (events = e))
			.catch((e) => console.log(e));
	}
</script>

<section>
	<header>
		<InfoSpaceBetween>
			<h4 slot="left">Activity</h4>
			<div slot="right">
				{#if !loading && !loadingMetadata}
					<p on:click={openDownloadModal} on:keydown><Icon name="download" /></p>
				{/if}
				<Dropdown {options} bind:value={current} size="sm" />
			</div>
		</InfoSpaceBetween>
	</header>
	{#each events as event}
		<ProjectEvent {event} />
	{:else}
		{#if !loading && !loadingMetadata}
			<p class="noActivity">No activity yet</p>
		{/if}
	{/each}
	{#if loading || loadingMetadata}
		<div class="loading">
			<Icon name="loading" spin />
		</div>
	{:else if events.length}
		<div
			style="text-align: center; color: rgba(225, 224, 232, 0.847); cursor: pointer;"
			on:click={loadMore}
			on:keydown
		>
			Load more
		</div>
	{/if}
</section>

<style>
	section {
		flex: 0 0 50%;
		width: 100%;
		padding-left: 20px;
		padding-right: 20px;
		margin: 0 auto;
		margin-top: 40px;
	}

	header {
		margin-bottom: 20px;
	}

	h4 {
		font-weight: 600;
		color: var(--text-header);
	}

	.noActivity {
		border-top: 1px solid var(--stroke-tertiary);
		padding-top: 20px;
		font-weight: 300;
	}

	div[slot='right'] {
		width: 230px;
		font-weight: 300;
		display: flex;
		align-items: flex-end;
	}

	div[slot='right'] p {
		margin: 0;
		margin-right: 16px;
		font-size: 16px;
		color: var(--text-action-primary);
	}

	div[slot='right'] p:hover {
		cursor: pointer;
	}

	.loading {
		color: var(--text-header);
		margin-top: 50px;
		text-align: center;
		transform: scale(1.5);
		width: 100%;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		section {
			flex: 0 0 100%;
		}
	}
</style>
