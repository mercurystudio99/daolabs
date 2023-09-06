<script lang="ts">
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import { formatHistoricalDate, timestampToUTC } from '$utils/formatDate';
	import EtherscanLink from '$lib/components/EtherscanLink.svelte';
	import EnsOrAddress from '../EnsOrAddress.svelte';
	import Popover from '../Popover.svelte';
	import type { DeployETHERC20ProjectPayerEvent } from '$models/subgraph-entities/v2/deploy-eth-erc20-project-payer-event';

	export let event: Partial<DeployETHERC20ProjectPayerEvent>;
</script>

<InfoSpaceBetween>
	<div slot="left">
		<p><small>Created ETH-ERC20 payment address</small></p>
		<div class="contract">
			Address: <EnsOrAddress address={event.address} />
		</div>
	</div>
	<div slot="right">
		<p class="timestamp">
			{#if event.timestamp}
				<Popover>
					<span slot="content" class="utc">{timestampToUTC(event.timestamp * 1000)}</span>
					{formatHistoricalDate(event.timestamp * 1000)}
				</Popover>
			{/if}
			<EtherscanLink value={event.txHash} type="tx" />
		</p>
		{#if event.caller}
			<p class="caller address">called by <EnsOrAddress address={event.caller} /></p>
		{/if}
	</div>
</InfoSpaceBetween>

<style>
	.contract {
		color: var(--text-secondary);
	}
	.caller {
		margin-top: 0.4rem;
	}
</style>
