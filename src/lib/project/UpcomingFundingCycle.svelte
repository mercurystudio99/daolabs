<script lang="ts" context="module">
	import { V2FundingCycleRiskCount } from '$utils/v2/fundingCycle';
	import { distributionLimitOf, queuedFundingCycleOf } from '$utils/web3/JBControllerWrapper';

	async function getQueuedFundingCycle(projectId: BigNumber, platform: ContractPlatform) {
		const {
			fundingCycle,
			metadata: fundingCycleMetadata,
		}: {
			fundingCycle: V2FundingCycle;
			metadata: V2FundingCycleMetadata;
		} = await queuedFundingCycleOf(platform, projectId);

		return {
			fundingCycle,
			fundingCycleMetadata,
		};
	}

	export async function getUpcomingFundingCycleRiskCount(
		projectId: BigNumber,
		platform: ContractPlatform,
	) {
		const { fundingCycle } = await getQueuedFundingCycle(projectId, platform);
		return V2FundingCycleRiskCount(fundingCycle);
	}
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getContext, onMount } from 'svelte';
	import Icon from '$lib/components/Icon';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import FundingCycleDetails from '$lib/components/FundingCycleDetails.svelte';
	import PayoutSplits from '$lib/components/PayoutSplits.svelte';
	import ReservedTokenSplits from '$lib/components/ReservedTokenSplits.svelte';
	import { ETH_PAYOUT_SPLIT_GROUP, RESERVED_TOKEN_SPLIT_GROUP } from '$constants/v2/splits';
	import { ETH_TOKEN_ADDRESS } from '$constants/v2/juiceboxTokens';
	import { splitsOf } from '$utils/web3/JBSplitsStore';
	import { getProjectPlatform } from '$lib/projects/data';
	import { projectPlatformWithVersion, type ContractPlatform } from '$constants/platform';
	import type { BigNumber } from 'ethers';
	import type { V2FundingCycle, V2FundingCycleMetadata } from '$models/v2/fundingCycle';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';

	const projectContext = getContext<Store<V2ProjectContextType>>('PROJECT');

	let queuedFundingCycle: V2FundingCycle;
	let queuedFundingCycleMetadata: V2FundingCycleMetadata;
	let queuedPayoutSplits;
	let queuedReservedTokensSplits;
	let queuedDistributionLimit: BigNumber;
	let queuedDistributionLimitCurrency: BigNumber;

	async function getUpcomingFundingCycle() {
		const { fundingCycle, fundingCycleMetadata } = await getQueuedFundingCycle(
			$projectContext.projectId,
			projectPlatformWithVersion($projectContext.platform, $projectContext.version),
		);
		queuedFundingCycle = fundingCycle;
		queuedFundingCycleMetadata = fundingCycleMetadata;

		queuedPayoutSplits = await splitsOf(
			getProjectPlatform(projectContext),
			$projectContext.projectId,
			queuedFundingCycle?.configuration,
			ETH_PAYOUT_SPLIT_GROUP,
		);

		queuedReservedTokensSplits = await splitsOf(
			getProjectPlatform(projectContext),
			$projectContext.projectId,
			queuedFundingCycle?.configuration,
			RESERVED_TOKEN_SPLIT_GROUP,
		);
		[queuedDistributionLimit, queuedDistributionLimitCurrency] = await distributionLimitOf(
			getProjectPlatform(projectContext),
			$projectContext.projectId,
			queuedFundingCycle?.configuration,
			$projectContext.primaryTerminal,
			ETH_TOKEN_ADDRESS,
		);
	}
	let loading = true;

	onMount(async () => {
		await getUpcomingFundingCycle();
		loading = false;
	});
</script>

{#if loading}
	<HeavyBorderBox>
		<p>
			<Icon name="loading" spin />
		</p>
	</HeavyBorderBox>
{:else}
	<div in:fade>
		<HeavyBorderBox>
			<FundingCycleDetails
				tokenSymbol={$projectContext.tokenSymbol || 'tokens'}
				fundingCycle={queuedFundingCycle}
				fundingCycleMetadata={queuedFundingCycleMetadata}
				distributionLimit={queuedDistributionLimit}
				currentDistributionLimitCurrencyType={queuedDistributionLimitCurrency}
			/>
		</HeavyBorderBox>
		<HeavyBorderBox>
			<PayoutSplits
				currency={queuedDistributionLimitCurrency}
				distributionLimit={queuedDistributionLimit}
				payoutSplits={queuedPayoutSplits}
				hideHeader={true}
				projectOwnerAddress={$projectContext.projectOwnerAddress}
			/>
		</HeavyBorderBox>
		<HeavyBorderBox>
			<ReservedTokenSplits
				reservedTokens={$projectContext.reservedTokenBalance}
				tokenAddress={$projectContext.tokenAddress}
				projectOwnerAddress={$projectContext.projectOwnerAddress}
				tokenSymbol={$projectContext.tokenSymbol}
				fundingCycleMetadata={queuedFundingCycleMetadata}
				reservedTokensSplits={queuedReservedTokensSplits}
				hideHeader={true}
			/>
		</HeavyBorderBox>
	</div>
{/if}

<style>
	p {
		color: var(--text-header);
		font-size: 2rem;
		text-align: center;
	}
</style>
