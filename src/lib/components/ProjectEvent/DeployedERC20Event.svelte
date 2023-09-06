<script lang="ts">
	import { formatHistoricalDate, timestampToUTC } from '$utils/formatDate';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import Popover from '../Popover.svelte';
	import LongWord from '../LongWord.svelte';
	import type { DeployedERC20Event } from '$models/subgraph-entities/vX/deployed-erc20-event';

	export let event: Partial<DeployedERC20Event>;
</script>

<InfoSpaceBetween>
	<div slot="left">
		<p><small><Trans>Deployed ERC20 token</Trans></small></p>
		<div class="amount">
			<LongWord>
				{event.symbol}
			</LongWord>
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
		</p>
	</div>
</InfoSpaceBetween>
