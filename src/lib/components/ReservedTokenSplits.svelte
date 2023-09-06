<script lang="ts">
	import { type BigNumber, constants } from 'ethers';
	import { formatReservedRate } from '$utils/v2/math';
	import { getTotalSplitsPercentage } from '$utils/v2/distributions';
	import { formattedNum, formatWad } from '$utils/formatNumber';
	import DistributeTokens from '$lib/project/DistributeTokens.svelte';
	import { connectedAccount } from '$stores/web3';
	import { browser } from '$app/environment';
	import InfoSpaceBetween from './InfoSpaceBetween.svelte';
	import PopInfo from './PopInfo.svelte';
	import SimpleSplits from './SimpleSplits.svelte';
	import Trans from './Trans.svelte';
	import { bind, openModal } from './Modal.svelte';
	import OwnerCrown from './OwnerCrown.svelte';
	import EnsOrAddress from './EnsOrAddress.svelte';
	import Button from './Button.svelte';
	import LongWord from './LongWord.svelte';
	import type { V2FundingCycleMetadata } from '$models/v2/fundingCycle';
	import type { Split } from '$models/v2/splits';

	export let fundingCycleMetadata: V2FundingCycleMetadata;
	export let reservedTokensSplits: Split[];
	export let isPreview = false;

	export let reservedTokens: BigNumber;
	export let tokenSymbol: string | undefined = undefined;
	export let tokenAddress: string | undefined = undefined;
	export let hideHeader: boolean = false;
	export let projectOwnerAddress: string;

	$: totalSplitPercentageTokenSplits = getTotalSplitsPercentage(reservedTokensSplits || []);

	const stackLayoutBreakpoint = 500;

	function stack() {
		if (browser) {
			return window?.innerWidth < stackLayoutBreakpoint;
		}
		return false;
	}

	const distributeTokensClicked = () => {
		openModal(bind(DistributeTokens));
	};
</script>

{#if !hideHeader}
	<InfoSpaceBetween stack={stack()}>
		<div slot="left">
			<div class="available">
				<p>{reservedTokens ? formatWad(reservedTokens, { precision: 0 }) : '0'}</p>
				<PopInfo
					message="The amount of tokens this project has reserved. These tokens can be distributed to reserved token beneficiaries."
					><small class="upper">
						{#if tokenSymbol}
							<LongWord width={150}>{tokenSymbol}</LongWord>
						{:else}
							<Trans>Tokens</Trans>
						{/if}
						reserved</small
					></PopInfo
				>
			</div>
		</div>
		<div slot="right">
			<Button type="secondary" size="sm" disabled={isPreview} on:click={distributeTokensClicked}
				>Distribute {#if tokenSymbol}
					<LongWord>{tokenSymbol}</LongWord>
				{:else}
					<Trans>tokens</Trans>
				{/if}</Button
			>
		</div>
	</InfoSpaceBetween>
	{#if tokenAddress && tokenAddress !== constants.AddressZero}
		<p class="contract-address">
			{#if tokenSymbol}
				<LongWord>{tokenSymbol}</LongWord>
			{:else}
				<Trans>Tokens</Trans>
			{/if}
			<Trans>contract address</Trans>
			<EnsOrAddress address={tokenAddress} />
		</p>
	{/if}
{/if}
<h4>
	<PopInfo
		message="A project can reserve a percentage of tokens minted from every payment it receives. Reserved tokens can be distributed according to the allocation below at any time."
	>
		Reserved
		{#if tokenSymbol}
			<LongWord>{tokenSymbol}</LongWord>
		{:else}
			Tokens
		{/if}
		({formatReservedRate(fundingCycleMetadata.reservedRate)}%)
	</PopInfo>
</h4>
{#each (reservedTokensSplits || []).sort((a, b) => Number(b.percent) - Number(a.percent)) as split}
	<SimpleSplits {split} crown={split.beneficiary === projectOwnerAddress} />
{:else}
	{#if isPreview}
		<InfoSpaceBetween>
			<p slot="left">
				Project owner (you)
				<span class="crown"><OwnerCrown /></span>:
			</p>
			<p slot="right">{formattedNum(100 - totalSplitPercentageTokenSplits, { precision: 2 })}%</p>
		</InfoSpaceBetween>
	{/if}
{/each}
{#if reservedTokensSplits.length && projectOwnerAddress && 100 - totalSplitPercentageTokenSplits > 0.011}
	<InfoSpaceBetween>
		<p slot="left" class="split-address">
			{#if isPreview || projectOwnerAddress === $connectedAccount}
				Project owner (you)
			{:else}
				<EnsOrAddress address={projectOwnerAddress} />
			{/if}
			<span class="crown"><OwnerCrown /></span>:
		</p>
		<p slot="right">{formattedNum(100 - totalSplitPercentageTokenSplits, { precision: 2 })}%</p>
	</InfoSpaceBetween>
{/if}

<style>
	/* TODO these styles are a mess */
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
	.available p {
		margin-right: 5px;
		color: var(--text-secondary);
	}
	.contract-address {
		margin: 0;
		margin-bottom: 20px;
		color: var(--text-secondary);
		font-size: 0.7rem;
	}
	.upper {
		text-transform: uppercase;
		font-weight: 300;
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
