<script lang="ts">
	import { formatHistoricalDate } from '$utils/formatDate';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import ETHAmount from '$lib/components/ETHAmount.svelte';
	import EtherscanLink from '$lib/components/EtherscanLink.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import type { BigNumber } from 'ethers';

	export let bid: {
		address: string;
		wadAmount: BigNumber | string;
		createdAt: string;
		txHash: string;
	};
</script>

<div class="item">
	<InfoSpaceBetween>
		<div slot="left">
			<p>
				<small>
					<EnsOrAddress address={bid.address} prependEnsWithAt />
				</small>
			</p>
			<div class="amount">
				<ETHAmount amount={bid.wadAmount} precision={4} />
			</div>
		</div>
		<div slot="right">
			<p class="timestamp">
				{#if bid.createdAt}
					{formatHistoricalDate(bid.createdAt)} ago
				{/if}
				<EtherscanLink value={bid.txHash} type="tx" />
			</p>
		</div>
	</InfoSpaceBetween>
</div>

<style>
	p {
		margin: 0;
	}

	small {
		color: var(--text-tertiary);
		font-weight: 500;
	}
	.amount {
		font-weight: 500;
	}

	.timestamp {
		color: var(--text-tertiary);
		font-size: 0.6rem;
	}

	:global(.timestamp .link) {
		color: var(--text-tertiary);
	}

	.item {
		padding-top: 10px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--stroke-tertiary);
	}
</style>
