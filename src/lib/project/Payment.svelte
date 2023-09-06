<script lang="ts">
	import { getContext } from 'svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import PayHeadsUp from '$lib/components/PayHeadsUp.svelte';
	import blacklist from '$constants/blacklist';
	import Pay from '$lib/components/Pay.svelte';
	import { weightedAmount } from '$utils/v2/math';
	import PayCheckout from './PayCheckout.svelte';
	import NftMembershipPay from './NFTMembershipPay.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';
	import type { BigNumber } from 'ethers';

	const projectsContext = getContext<Store<V2ProjectContextType>>('PROJECT');

	export let isBlacklisted = blacklist.includes($projectsContext.projectId?.toNumber());

	$: currentFC = $projectsContext.fundingCycle;
	$: fcMetadata = $projectsContext.fundingCycleMetadata;
	$: metadata = $projectsContext.projectMetadata;
	$: tokenSymbol = $projectsContext.tokenSymbol;

	function payTreasury(weiAmount: BigNumber) {
		openModal(
			bind(PayCheckout, {
				weiAmount,
				close: () => {},
			}),
		);
	}

	const payClicked = (weiAmount: BigNumber) => {
		openModal(bind(PayHeadsUp, { click: () => payTreasury(weiAmount) }));
	};
</script>

<div class="payment">
	{#if !isBlacklisted}
		{#if $projectsContext.nftRewardTiers?.CIDs?.length}
			<NftMembershipPay onPay={payClicked} />
		{:else}
			<Pay
				onClick={payClicked}
				payButton={metadata?.payButton}
				reservedRate={fcMetadata?.reservedRate?.toNumber()}
				token={tokenSymbol}
				weight={currentFC?.weight}
				weightingFn={weightedAmount}
				disabled={!$projectsContext.fundingCycle?.number?.gt(0)}
			/>
		{/if}
	{/if}
</div>

<style>
	.payment {
		padding: 0 1rem;
	}
</style>
