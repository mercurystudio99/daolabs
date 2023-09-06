<script lang="ts">
	import { getContext } from 'svelte';
	import { formatHistoricalDate } from '$utils/formatDate';
	import { formatWad } from '$utils/formatNumber';
	import { MAX_DISTRIBUTION_LIMIT } from '$utils/v2/math';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Usd from '$lib/components/USD.svelte';
	import Ethereum from '$lib/components/Ethereum.svelte';
	import { V2_CURRENCY_USD } from '$utils/v2/currency';
	import type Store from '$utils/Store';
	import type { V2FundingCycle } from '$models/v2/fundingCycle';
	import type { V2ProjectContextType } from '$models/project-type';
	import type { BigNumber } from 'ethers';

	const projectContext: Store<V2ProjectContextType> = getContext('PROJECT');

	export let fundingCycle: V2FundingCycle;
	// export let numFundingCycles: number;
	export let index: number;

	let usedDistributionLimit: BigNumber;
	let distributionLimit: BigNumber;

	$: distributionLimit = $projectContext.distributionLimit;
	$: usedDistributionLimit = $projectContext.usedDistributionLimit;
	$: distributionLimitIsInfinite = distributionLimit?.eq(MAX_DISTRIBUTION_LIMIT);
	$: distributionLimitIsZero = !distributionLimit || distributionLimit?.eq(0);
	// $: isLastFundingCycle = index < numFundingCycles - 1;
	$: distributionLimitCurrency = $projectContext.distributionLimitCurrency;
</script>

<div class="wrapper">
	<InfoSpaceBetween on:click>
		<div slot="left">
			<div class="number">
				#{index + 1}
			</div>
			<div class="withdrawn">
				{#if !(distributionLimitIsInfinite || distributionLimitIsZero)}
					{#if distributionLimitCurrency.eq(V2_CURRENCY_USD)}
						<Usd />
					{:else}
						<Ethereum />
					{/if}
					{formatWad(usedDistributionLimit, { precision: 2 })}/{formatWad(distributionLimit, {
						precision: 2,
					})} withdrawn
				{:else}
					{' '}{formatWad(usedDistributionLimit, { precision: 2 })} withdrawn
				{/if}
			</div>
		</div>
		<div slot="right">
			{formatHistoricalDate(fundingCycle.start.add(fundingCycle.duration).mul(1000).toNumber())} ago
		</div>
	</InfoSpaceBetween>
</div>

<style>
	div[slot='left'] {
		display: flex;
		align-items: center;
	}

	.number {
		font-size: 1rem;
		margin-right: 10px;
		color: var(--text-header);
	}

	.withdrawn {
		font-size: 0.8rem;
		font-weight: 300;
		color: var(--text-primary);
	}

	.wrapper {
		border-bottom: 1px solid var(--stroke-tertiary);
		cursor: pointer;
		padding: 20px;
	}
</style>
