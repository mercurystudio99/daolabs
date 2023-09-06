<script lang="ts">
	import { onMount } from 'svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import { formatHistoricalDate, timestampToUTC } from '$utils/formatDate';
	import EtherscanLink from '$lib/components/EtherscanLink.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { querySubgraph } from '$utils/graph';
	import { formatWad } from '$utils/formatNumber';
	import EnsOrAddress from '../EnsOrAddress.svelte';
	import Popover from '../Popover.svelte';
	import type { DistributeReservedTokensEvent } from '$models/subgraph-entities/v2/distribute-reserved-tokens-event';
	import type { DistributeToReservedTokenSplitEvent } from '$models/subgraph-entities/v2/distribute-to-reserved-token-split-event';

	export let event: Partial<DistributeReservedTokensEvent>;

	let events: DistributeToReservedTokenSplitEvent[] = [];

	async function loadData() {
		events = await querySubgraph({
			entity: 'distributeToReservedTokenSplitEvent',
			keys: ['id', 'timestamp', 'txHash', 'beneficiary', 'tokenCount', 'projectId'],
			orderDirection: 'desc',
			orderBy: 'tokenCount',
			where: event?.id
				? {
						key: 'distributeReservedTokensEvent',
						value: event.id,
				  }
				: undefined,
		});
	}

	onMount(async () => {
		await loadData();
	});
</script>

<InfoSpaceBetween>
	<div slot="left">
		<p><small><Trans>Distribute reserved tokens</Trans></small></p>
		<div class="beneficiaries">
			{#each events as e}
				{#if e.splitProjectId}
					<p>Project {e.splitProjectId}</p>
				{:else}
					<p>
						<EnsOrAddress address={e.beneficiary} />
					</p>
				{/if}
			{/each}
			{#if event.beneficiaryTokenCount}
				<EnsOrAddress address={event.beneficiary} />
			{/if}
		</div>
	</div>
	<div slot="right">
		{#if event.timestamp}
			<Popover>
				<span slot="content" class="utc">{timestampToUTC(event.timestamp * 1000)}</span>
				{formatHistoricalDate(event.timestamp * 1000)}
			</Popover>
		{/if}
		<p>
			<EtherscanLink value={event.txHash} type="tx" />
		</p>
		<p class="timestamp">called by <EnsOrAddress address={event.caller} /></p>
		{#each events as e}
			<p>
				{formatWad(e.tokenCount, { precision: 2 })}
			</p>
		{/each}
		{#if event.beneficiaryTokenCount}
			<p>
				{formatWad(event.beneficiaryTokenCount)}
			</p>
		{/if}
	</div>
</InfoSpaceBetween>

<style>
	div[slot='right'] {
		align-items: flex-end;
		display: flex;
		flex-direction: column;
	}

	.beneficiaries {
		/* This is to account for the extra Distributed by line */
		margin-top: 11px;
	}
</style>
