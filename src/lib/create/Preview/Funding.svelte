<script lang="ts">
	import { getContext } from 'svelte';
	import { BigNumber } from 'ethers';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import PayoutSplits from '$lib/components/PayoutSplits.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import FundingCycleDetails from '$lib/components/FundingCycleDetails.svelte';
	import ReservedTokenSplits from '$lib/components/ReservedTokenSplits.svelte';
	import { connectedAccount } from '$stores/web3';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');

	$: untapped = ($project.distributionLimit ?? BigNumber.from(0)).sub(
		$project.usedDistributionLimit || BigNumber.from(0),
	);

	$: reservedTokens = $project.balanceInDistributionLimitCurrency?.gt(untapped)
		? untapped
		: $project.balanceInDistributionLimitCurrency || BigNumber.from(0);
</script>

<div class="title yellow">
	<PopInfo
		message="Tokens are distributed to anyone who pays this project. If the project has set a funding target, tokens can be redeemed for a portion of the project's overflow whether or not they have been claimed yet."
	>
		<h4>Tokens</h4>
	</PopInfo>
</div>
<p>Total supply: <span>0 tokens</span></p>

<div class="title yellow">
	<PopInfo
		message="A project's lifetime is defined in funding cycles. If a funding target is set, the project can withdraw no more than the target for the duration of the cycle."
		><h4>Funding cycle</h4></PopInfo
	>
</div>
<p class="sub-header">CURRENT</p>
<HeavyBorderBox>
	<FundingCycleDetails
		tokenSymbol={$project.tokenSymbol || 'token'}
		expanded={true}
		fundingCycle={$project.fundingCycle}
		fundingCycleMetadata={$project.fundingCycleMetadata}
		distributionLimit={$project.distributionLimit}
		currentDistributionLimitCurrencyType={$project.distributionLimitCurrency}
	/>
</HeavyBorderBox>
<HeavyBorderBox>
	<PayoutSplits
		isPreview
		currency={$project.distributionLimitCurrency}
		payoutSplits={$project.payoutSplits}
		distributionLimit={$project.distributionLimit}
	/>
</HeavyBorderBox>
<HeavyBorderBox>
	<ReservedTokenSplits
		isPreview
		{reservedTokens}
		projectOwnerAddress={$project.projectOwnerAddress ||
			$connectedAccount ||
			'0x0000000000000000000000000000000000000000'}
		fundingCycleMetadata={$project.fundingCycleMetadata}
		reservedTokensSplits={$project.reservedTokensSplits}
	/>
</HeavyBorderBox>

<style>
	h4 {
		margin-right: 5px;
		margin-bottom: 5px;
		color: var(--text-header);
	}

	p {
		margin: 0;
		color: var(--text-secondary);
	}

	span {
		margin-left: 10px;
		color: var(--text-primary);
	}
	.title {
		display: flex;
		align-items: baseline;
		margin-top: 15px;
	}

	.title h4 {
		color: var(--text-header);
		font-weight: 600;
		margin: 0;
	}

	.title:last-of-type {
		margin-top: 20px;
	}
	.yellow {
		color: var(--text-header);
	}
	.sub-header {
		text-transform: capitalize;
		font-weight: 600;
		font-size: 12px;
		color: var(--text-secondary);
		margin: 10px 0;
	}
</style>
