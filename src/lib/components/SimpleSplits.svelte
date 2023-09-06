<script lang="ts">
	import { BigNumber } from 'ethers';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Money from '$lib/components/Money.svelte';
	import { formatSplitPercent } from '$utils/v2/math';
	import { DistributionLimitType } from '$constants';
	import { formattedNum } from '$utils/formatNumber';
	import { formatDate } from '$utils/formatDate';
	import Icon from '$lib/components/Icon';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import OwnerCrown from './OwnerCrown.svelte';
	import EnsOrAddress from './EnsOrAddress.svelte';
	import type { Split } from '$models/v2/splits';

	/**
	 * This component is used to display the distribution splits for a project
	 * in places like the Preview panel on the create layout, or Detail
	 * panel on the project detail layout.
	 *
	 * For the component to edit/remove split, see Split.svelte.
	 */

	export let crown = false;
	export let split: Split;
	export let distributionLimitType: DistributionLimitType | undefined = undefined;
	export let distributionLimit: BigNumber | undefined = undefined;
	export let currency: BigNumber = BigNumber.from(V2_CURRENCY_ETH);
	export let formatWad: boolean = true;
</script>

<InfoSpaceBetween>
	<!-- TODO crown if Project owner (i.e. the logged in user) -->
	<div slot="left">
		{#if split.projectId && split.beneficiary}
			<span class="split-address">
				<EnsOrAddress address={split.beneficiary} />
				<span class="crown">
					{#if crown}<OwnerCrown />{/if}
				</span>:
			</span>
		{/if}
	</div>
	<p slot="right">
		{formattedNum(formatSplitPercent(BigNumber.from(split.percent)), { precision: 2 })}%
		{#if distributionLimitType === DistributionLimitType.Specific}
			(<Money
				{formatWad}
				amount={BigNumber.from(
					Math.floor(Number(formatSplitPercent(BigNumber.from(split.percent))) * 1_000_000),
				)
					.mul(distributionLimit)
					.div(100_000_000)}
				{currency}
				precision={2}
			/>)
		{/if}
	</p>
</InfoSpaceBetween>
{#if split.lockedUntil && split.lockedUntil > 0}
	{#await new Date(Number(split.lockedUntil) * 1000)}
		<small class="locked-until">
			<Icon name="lock" /> Locked until {formatDate(Number(split.lockedUntil) * 1000, 'yyyy-MM-dd')}
		</small>
	{/await}
{/if}

<style>
	p {
		margin: 0;
	}

	/* span {
		display: block;
		margin: 0;
		font-size: 12px;
		line-height: 0.9;
		margin-left: 20px;
		font-weight: 300;
		color: var(--text-secondary);
	} */
	small {
		color: var(--text-secondary);
	}

	[slot='left'] {
		margin-top: 5px;
	}
	.split-address {
		display: flex;
		align-items: center;
	}
	.crown {
		transform: translateY(2px);
		margin-left: 2px;
		margin-right: -3px;
	}
</style>
