<script lang="ts">
	import { getContext } from 'svelte';
	import { BigNumber } from 'ethers';
	import { connectedAccount } from '$stores/web3';
	import { getTotalSplitsPercentage, getDistributionLimitType } from '$utils/v2/distributions';
	import ETH from '$lib/components/Ethereum.svelte';
	import Icon from '$lib/components/Icon';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { DistributionLimitType } from '$constants';
	import Money from '$lib/components/Money.svelte';
	import SimpleSplits from '$lib/components/SimpleSplits.svelte';
	import { getEthBalance } from '$data/eth';
	import { bind } from '$lib/components/Modal.svelte';
	import DistributeFunds from '$lib/project/DistributeFunds.svelte';
	import { modal } from '$stores';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import { formattedNum } from '$utils/formatNumber';
	import ProjectConfigurationDrawer, {
		Drawers,
	} from '$lib/project/ProjectConfigurationDrawer.svelte';
	import { browser } from '$app/environment';
	import EnsOrAddress from './EnsOrAddress.svelte';
	import Button from './Button.svelte';
	import Drawer from './Drawer.svelte';
	import OwnerCrown from './OwnerCrown.svelte';
	import type { Split } from '$models/v2/splits';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	export let currency: BigNumber = BigNumber.from(V2_CURRENCY_ETH);
	export let distributionLimit: BigNumber = BigNumber.from(0);
	export let payoutSplits: Split[];
	// TODO: remove this when create has correct formatted amounts
	export let isPreview: boolean = !!getContext('IS_PREVIEW');

	export let balanceInDistributionLimitCurrency: BigNumber | undefined = undefined;
	export let usedDistributionLimit: BigNumber | undefined = undefined;
	export let projectOwnerAddress: string | undefined = undefined;
	export let hideHeader: boolean = false;

	const projectContext = getContext<Store<V2ProjectContextType>>('PROJECT');

	const stackLayoutBreakpoint = 500;

	let distributionLimitType: DistributionLimitType;
	let totalSplitPercentagePayoutSplits: number;
	let distributableAmount = BigNumber.from(0);
	let ownerBalance = BigNumber.from(0);
	let drawerShown = false;

	if (usedDistributionLimit) {
		const untapped = distributionLimit.sub(usedDistributionLimit);
		distributableAmount = balanceInDistributionLimitCurrency?.gt(untapped)
			? untapped
			: balanceInDistributionLimitCurrency;
	}

	if (projectOwnerAddress) {
		getEthBalance(projectOwnerAddress)
			.then((balance) => {
				ownerBalance = balance;
			})
			.catch((e) => console.log(e));
	}

	function getOwnerAmountPayoutSplits(summedSplitsPercent: number) {
		const remainingPercent = 100 - summedSplitsPercent;
		return distributionLimit
			.mul(BigNumber.from(Math.floor(remainingPercent * 1_000_000)))
			.div(100_000_000);
	}

	function stack() {
		if (browser) {
			return window?.innerWidth < stackLayoutBreakpoint;
		}
		return false;
	}

	$: {
		distributionLimitType = getDistributionLimitType(distributionLimit);
		totalSplitPercentagePayoutSplits = getTotalSplitsPercentage(payoutSplits || []);
	}
</script>

{#if !hideHeader}
	<InfoSpaceBetween stack={stack()}>
		<div slot="left" class="distribution-splits">
			<div class="available">
				<p><Money {currency} amount={distributableAmount} /></p>
				<PopInfo
					message="The funds available to distribution for this funding cycle (before the 2.5% JBX fee is subtracted). This number won't roll over to the next funding cycle, so funds should be distributed before this funding cycle ends."
					><small class="upper">available</small></PopInfo
				>
			</div>
			{#if distributionLimitType === DistributionLimitType.Infinite}
				<p><small><ETH />0/NO LIMIT distributed</small></p>
			{:else if distributionLimitType === DistributionLimitType.Specific}
				<p>
					<small
						><Money {currency} amount={BigNumber.from(0)} />/<Money
							{currency}
							amount={distributionLimit}
						/>
					</small>
				</p>
			{:else}
				<p>
					<small><Money amount={usedDistributionLimit ?? BigNumber.from(0)} /> distributed</small>
				</p>
			{/if}
			{#if projectOwnerAddress}
				{#await getEthBalance(projectOwnerAddress)}
					<Icon name="loading" spin />
				{:then amount}
					<p>
						<small
							><Money amount={amount ?? BigNumber.from(0)} precision={2} />
							<OwnerCrown /> owner balance</small
						>
					</p>
				{/await}
			{:else}
				<p>
					<small
						><Money amount={ownerBalance ?? BigNumber.from(0)} precision={2} />
						<OwnerCrown /> owner balance</small
					>
				</p>
			{/if}
		</div>
		<!-- TODO check when this is supposed to be disabled and not -->
		<div slot="right">
			<Button
				type="secondary"
				size="sm"
				on:click={() =>
					modal.set(
						bind(DistributeFunds, {
							totalFunds: distributableAmount,
							close,
						}),
					)}
				disabled={isPreview}>Distribute funds</Button
			>
		</div>
	</InfoSpaceBetween>
{/if}
<InfoSpaceBetween stack={stack()}>
	<h4 slot="left">
		<PopInfo message="Available funds are distributed according to the payouts below.">
			Distribution splits
		</PopInfo>
	</h4>
	<div slot="right" style="margin-bottom: 20px">
		{#if $projectContext?.projectOwnerAddress?.toLowerCase() === $connectedAccount?.toLowerCase()}
			<Button type="secondary" size="sm" disabled={isPreview} on:click={() => (drawerShown = true)}>
				<Icon name="setting" style="transform: translateY(2px);" />
				Edit payouts
			</Button>
		{/if}
	</div>
</InfoSpaceBetween>
{#each payoutSplits as split}
	<SimpleSplits
		{split}
		{distributionLimitType}
		{distributionLimit}
		{currency}
		crown={projectOwnerAddress?.toLowerCase() === split.beneficiary?.toLowerCase()}
	/>
{:else}
	{#if isPreview}
		<InfoSpaceBetween>
			<p slot="left">
				Project owner (you) <OwnerCrown />:
			</p>
			<p slot="right">
				{#if distributionLimitType !== DistributionLimitType.Infinite}
					100%
					{#if distributionLimitType === DistributionLimitType.Specific}
						(<Money {currency} amount={distributionLimit} precision={2} />)
					{/if}
				{/if}
			</p>
		</InfoSpaceBetween>
	{/if}
{/each}
{#if payoutSplits.length && 100 - totalSplitPercentagePayoutSplits > 0.011}
	<InfoSpaceBetween>
		<p slot="left">
			<span class="flex">
				{#if isPreview || projectOwnerAddress === $connectedAccount}
					Project owner (you)
				{:else}
					<EnsOrAddress address={projectOwnerAddress} />
				{/if}
				<OwnerCrown />:
			</span>
		</p>
		<p slot="right">
			{formattedNum(100 - totalSplitPercentagePayoutSplits, { precision: 2 })}%
			{#if distributionLimitType === DistributionLimitType.Specific}
				(<Money
					{currency}
					amount={getOwnerAmountPayoutSplits(totalSplitPercentagePayoutSplits)}
					precision={2}
				/>)
			{/if}
		</p>
	</InfoSpaceBetween>
{/if}

<Drawer bind:shown={drawerShown}>
	<ProjectConfigurationDrawer
		close={() => (drawerShown = false)}
		drawerOpen={true}
		current={Drawers.Funding}
	/>
</Drawer>

<style>
	div[slot='left'] {
		display: flex;
		flex-direction: column;
		font-weight: 500;
	}

	p[slot='left'],
	p[slot='right'] {
		color: var(--text-primary);
		font-weight: 400;
	}

	h4 {
		margin-right: 5px;
		margin-bottom: 5px;
		color: var(--text-header);
	}

	p {
		margin: 0;
		color: var(--text-secondary);
	}
	.available {
		display: flex;
	}
	.upper {
		text-transform: uppercase;
		font-weight: 300;
	}
	.available p {
		margin-right: 5px;
		color: var(--text-secondary);
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		div[slot='right'] {
			margin: 5px 0px;
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 350px) {
		div[slot='right'] {
			margin: 15px 0px;
		}
	}
</style>
