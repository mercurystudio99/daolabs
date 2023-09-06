<script lang="ts">
	import { getContext } from 'svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import ETHAmount from '$lib/components/ETHAmount.svelte';
	import { formatHistoricalDate, timestampToUTC } from '$utils/formatDate';
	import EtherscanLink from '$lib/components/EtherscanLink.svelte';
	import { formatWad } from '$utils/formatNumber';
	import { tokenSymbolText } from '$utils/tokenSymbolText';
	import EnsOrAddress from '../EnsOrAddress.svelte';
	import Popover from '../Popover.svelte';
	import type { RedeemEvent } from '$models/subgraph-entities/vX/redeem-event';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');

	export let event: Partial<RedeemEvent>;
</script>

<InfoSpaceBetween>
	<div slot="left">
		<p><small>Redeemed</small></p>
		<div class="amount">
			{formatWad(event.amount, { precision: 0 })}
			{tokenSymbolText({
				tokenSymbol: $project.tokenSymbol,
				capitalize: false,
				plural: true,
			})}
		</div>
		<div style="color: rgba(225, 224, 232, 0.847);">
			<ETHAmount amount={event.returnAmount} precision={4} /> overflow received
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
		<!-- TODO: formatted address with ENS, look at FormattedAddress.tsx -->
		{#if event.beneficiary}
			<p class="address"><EnsOrAddress address={event.beneficiary} /></p>
		{/if}
	</div>
</InfoSpaceBetween>
