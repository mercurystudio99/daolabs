<script type="ts">
	import { getContext } from 'svelte';
	import { BigNumber } from 'ethers';
	import Button from '$lib/components/Button.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import { DistributionLimitType } from '$constants';
	import {
		discountRateFrom,
		formatDiscountRate,
		formatIssuanceRate,
		formatRedemptionRate,
		formatReservedRate,
		issuanceRateFrom,
		redemptionRateFrom,
		reservedRateFrom,
	} from '$utils/v2/math';
	import { getDistributionLimitType } from '$utils/v2/distributions';
	import { openModal as open } from '$lib/components/Modal.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import InitialMintRate from './InitialMintRate.svelte';
	import RedemptionRate from './RedemptionRate.svelte';
	import DiscountRate from './DiscountRate.svelte';
	import ReservedRate from './ReservedRate.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';
	import type { Dirty } from '../../../../app';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');
	const dirty = getContext<Dirty>('SHOW_DIRTY');

	export let close: () => void;
	export let openModal: (arg1: any) => void = open;

	let discountRate = parseFloat(
		formatDiscountRate($project.queuedFundingCycle.discountRate as BigNumber),
	);
	let redemptionRate = parseFloat(
		formatRedemptionRate($project.queuedFundingCycleMetadata.redemptionRate as BigNumber),
	);
	let reservedRate = parseFloat(
		formatReservedRate($project.queuedFundingCycleMetadata.reservedRate as BigNumber),
	);
	let issuanceRate = parseFloat(
		formatIssuanceRate($project.queuedFundingCycle.weight.toString() as string),
	);

	let splits = $project.reservedTokensSplits;

	const initialState = {
		discountRate,
		issuanceRate,
		redemptionRate,
		reservedRate,
		splits,
	};

	function saveTokenConfiguration() {
		project.update((current) => ({
			...current,
			queuedFundingCycle: {
				...current.queuedFundingCycle,
				discountRate: discountRateFrom(discountRate.toString()),
				weight: BigNumber.from(issuanceRateFrom(`${issuanceRate}`)),
			},
			queuedFundingCycleMetadata: {
				...current.queuedFundingCycleMetadata,
				redemptionRate: redemptionRateFrom(redemptionRate.toString()),
				reservedRate: reservedRateFrom(reservedRate.toString()),
			},
			reservedTokensSplits: splits,
		}));
		close();
	}

	$: currentDistributionLimitType = getDistributionLimitType(
		$project.distributionLimit as BigNumber,
	);

	$: {
		dirty?.check(initialState, {
			discountRate,
			issuanceRate,
			redemptionRate,
			reservedRate,
			splits,
		});
	}
</script>

<slot name="header" />
<InfoBox>
	Project tokens <b>aren't ERC-20 tokens</b> by default. Once you deploy your project, you can issue
	an ERC-20 for your holders to claim. This is <b>optional</b>.
</InfoBox>

<section id="tokenDrawer" style="margin-top:20px;">
	<InitialMintRate bind:issuanceRate />
	<HeavyBorderBox>
		<ReservedRate bind:reservedRate bind:splits {issuanceRate} {openModal} />
	</HeavyBorderBox>
	<HeavyBorderBox>
		<DiscountRate
			bind:discountRate
			{issuanceRate}
			{reservedRate}
			disabled={!$project.queuedFundingCycle.duration.gt(0)}
		/>
	</HeavyBorderBox>
	<HeavyBorderBox>
		<RedemptionRate
			bind:redemptionRate
			disabled={currentDistributionLimitType === DistributionLimitType.Infinite}
		/>
	</HeavyBorderBox>
	<br />
	<Button disabled={!issuanceRate} on:click={saveTokenConfiguration}
		>Save token configuration</Button
	>
</section>

<style>
	:global(#tokenDrawer header) {
		margin-bottom: 1rem;
	}
	/* :global(#tokenDrawer h3) {
		color: var(--text-header);
	} */
	:global(#tokenDrawer h3) {
		margin: 0;
	}

	:global(#tokenDrawer h3 span) {
		color: var(--text-tertiary);
	}

	:global(#tokenDrawer p) {
		font-weight: 300;
	}

	:global(#tokenDrawer a) {
		font-weight: 500;
	}
</style>
