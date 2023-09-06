<script lang="ts">
	import { getContext } from 'svelte';
	import { BigNumber } from 'ethers';
	import { connectedAccount, readNetwork } from '$stores/web3';
	import { DistributionLimitType } from '$constants';
	import Money from '$lib/components/Money.svelte';
	import { getDistributionLimitType } from '$utils/v2/distributions';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import { getEthBalance } from '$data/eth';
	import Icon from '$lib/components/Icon';
	import EthAmount from '$lib/components/ETHAmount.svelte';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');

	$: currentDistributionLimitType = getDistributionLimitType($project.distributionLimit);
	$: currency = $project.distributionLimitCurrency;

	let ethBalancePromise;
	$: if ($readNetwork && $connectedAccount) {
		ethBalancePromise = getEthBalance($connectedAccount);
	}
</script>

<!-- TODO: rename this component, quite undescriptive given other sibling is "Funding" -->
<InfoSpaceBetween>
	<div slot="left">
		<PopInfo message="The balance of this project in the Treasury contracts."
			><p>In treasury</p></PopInfo
		>
	</div>
	<p slot="right" class="money"><Money {currency} /></p>
</InfoSpaceBetween>
<InfoSpaceBetween>
	<div slot="left">
		<PopInfo
			message="The amount that has been distributed from the Treasury balance in this funding cycle, out of the current distribution limit. No more than the distribution limit can be distributed in a single funding cycle—any remaining ETH in Juicebox is overflow, until the next cycle begins."
		>
			<p>Distributed</p>
		</PopInfo>
	</div>
	<div slot="right">
		{#if currentDistributionLimitType === DistributionLimitType.None}
			<PopInfo
				placement="left"
				message="The target for this funding cycle is 0, meaning all funds in the Treasury are currently considered overflow. Overflow can be redeemed by token holders, but not distributed."
				><p>100% Overflow</p></PopInfo
			>
		{:else if currentDistributionLimitType === DistributionLimitType.Infinite}
			<Money {currency} />/ NO LIMIT
		{:else}
			<Money {currency} />/ <Money
				{currency}
				amount={$project.distributionLimit ?? BigNumber.from(0)}
			/>
		{/if}
	</div>
</InfoSpaceBetween>
{#if currentDistributionLimitType === DistributionLimitType.Specific}
	<progress max="100" value="" />
{/if}
<InfoSpaceBetween>
	<div slot="left">
		<PopInfo message="The balance of the project owner's wallet.">
			<p>In wallet</p>
		</PopInfo>
	</div>
	<div slot="right">
		{#await ethBalancePromise}
			<Icon name="loading" spin />
		{:then amount}
			<EthAmount {amount} precision={2} />
		{/await}
	</div>
</InfoSpaceBetween>

<style>
	p {
		font-size: 0.8rem;
		text-transform: uppercase;
		font-weight: 500;
		margin: 5px 0px;
		display: inline-block;
	}
	div[slot='left'],
	div[slot='right'],
	p {
		color: var(--text-tertiary);
	}
	.money {
		color: var(--text-brand-primary);
	}

	progress {
		width: 100%;
		height: 8px;
		background: var(--background-l0);
		margin: 10px 0px;
	}

	progress::-webkit-progress-bar {
		background-color: var(--background-l1);
		border-radius: 7px;
	}
	progress::-webkit-progress-value {
		background-color: var(--text-brand-primary);
		border-radius: 7px;
	}
</style>
