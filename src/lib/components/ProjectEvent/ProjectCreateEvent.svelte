<script lang="ts">
	/**
	 * NOTE: Styling for this component is globally defined by the sibling file
	 * Main.svelte.
	 */
	import EtherscanLink from '$lib/components/EtherscanLink.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { formatHistoricalDate, timestampToUTC } from '$utils/formatDate';

	import EnsOrAddress from '../EnsOrAddress.svelte';
	import Popover from '../Popover.svelte';
	import type { ProjectCreateEvent } from '$models/subgraph-entities/vX/project-create-event';

	export let event: Partial<ProjectCreateEvent>;
</script>

<InfoSpaceBetween>
	<div slot="left">
		<p><small><Trans>Created</Trans></small></p>
		<p>Project created by <EnsOrAddress address={event.caller} /></p>
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
	</div>
</InfoSpaceBetween>
