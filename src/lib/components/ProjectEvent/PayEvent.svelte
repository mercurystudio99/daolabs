<script lang="ts">
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import ETHAmount from '$lib/components/ETHAmount.svelte';
	import { formatHistoricalDate, timestampToUTC } from '$utils/formatDate';
	import EtherscanLink from '$lib/components/EtherscanLink.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import RichNote from '$lib/components/RichNote.svelte';
	import Popover from '../Popover.svelte';
	import type { PayEvent } from '$models/subgraph-entities/vX/pay-event';

	export let event: Partial<PayEvent>;

	// function split(note: string) {
	// 	return note.replace(/https?/g, (match) => `########${match}`).split('########');
	// }
</script>

<InfoSpaceBetween>
	<div slot="left">
		<p><small>Paid</small></p>
		<div class="amount">
			<ETHAmount amount={event.amount} precision={4} />
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
		{#if event.beneficiary}
			<p class="address"><EnsOrAddress address={event.beneficiary} /></p>
		{/if}
	</div>
</InfoSpaceBetween>

<div style="margin-top: 10px;">
	<!-- TODO: -->
	<RichNote note={event.note} style={{ marginTop: '10px' }} />
</div>

<style>
	.amount {
		font-weight: 350;
	}
	.utc {
		font-size: 14px;
		color: var(--text-primary);
	}
</style>
