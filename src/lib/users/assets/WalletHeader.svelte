<script lang="ts">
	// import { BigNumber } from 'ethers';
	import { onDestroy, onMount } from 'svelte';
	import Icon from '$lib/components/Icon';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import Ethereum from '$lib/components/Ethereum.svelte';
	// import ETHAmount from '$lib/components/ETHAmount.svelte';
	// import USDAmount from '$lib/components/USDAmount.svelte';
	import {
		formattedNum,
		formatNumberToPercent,
		formatNumberToUSD /*, parseWad*/,
	} from '$utils/formatNumber';
	import Graph from './Graph';
	import { fetchPrice } from './services';

	export let totalEthBalance: number;
	export let totalNftValue: number;
	export let loading = false;
	export let address: string;
	export let typicalAssets: Array<{ name: string; balance: number }>;
	export let assetsLoading = false;

	let ethPrice: number = 0;
	let performance: number = 0;
	let otherAssetsBalance: number = 0;
	let totalBalance: number;

	let intervalGetUsdPrice: ReturnType<typeof setInterval>;

	type EthPriceApiType = {
		ethereum: {
			usd: number;
			usd_24h_change: number;
		};
	};

	$: totalBalance = totalEthBalance + (totalNftValue > 0 ? totalNftValue : 0);
	onMount(() => {
		fetchPrice()
			.then(({ ethereum }: EthPriceApiType) => {
				ethPrice = ethereum.usd;
				performance = ethereum.usd_24h_change;
			})
			.catch((err) => console.error(err));
		intervalGetUsdPrice = setInterval(fetchPrice, 60000);
	});
	onDestroy(() => {
		clearInterval(intervalGetUsdPrice as unknown as string);
	});
	$: if (typicalAssets.length > 0) {
		otherAssetsBalance = Math.abs(
			totalBalance -
				typicalAssets.reduce(
					(prev, curr) =>
						(curr.balance / totalBalance > 0.00005 || curr.name === 'Wallet' ? curr.balance : 0) +
						prev,
					0,
				),
		);
	}
	let clientWidth = 500;
</script>

<header bind:clientWidth>
	<div class="stats">
		<InfoSpaceBetween>
			<div slot="left">
				<h4>balance</h4>
				<Popover placement="right" message="The total funds in your wallet.">
					<Icon name="questionCircle" />
				</Popover>
			</div>
			<div slot="right">
				<span />
				<span class="amount">
					<Skeleton {loading} width="5rem" height="1rem" type="text">
						<!-- <USDAmount
							amount={totalEthBalance || BigNumber.from(0)}
							precision={(totalEthBalance || BigNumber.from(0)).lt(parseWad(10)) ? 4 : 2}
						/> -->
						<Ethereum />
						{formattedNum(totalEthBalance, { precision: 4 })}
					</Skeleton>
				</span>
			</div>
		</InfoSpaceBetween>
		<InfoSpaceBetween>
			<div slot="left">
				<h4>performance</h4>
				<Popover placement="right" message="Performance of your balance.">
					<Icon name="questionCircle" />
				</Popover>
			</div>
			<div slot="right">
				<span />
				<span class="amount">
					<Skeleton {loading} width="5rem" height="1rem" type="text">
						<span
							class="performance"
							style="color: {performance >= 0 ? 'var(--stroke-success)' : 'var(--stroke-failure)'};"
						>
							{performance >= 0 ? '+' : ''}{formatNumberToPercent(performance / 100)} ({formatNumberToUSD(
								ethPrice,
							)})
						</span>
					</Skeleton>
				</span>
			</div>
		</InfoSpaceBetween>
		{#if totalNftValue >= 0}
			<InfoSpaceBetween>
				<div slot="left">
					<h4>include nfts in total</h4>
					<Popover placement="right" message="Find more nfts on NFT to get total balance.">
						<Icon name="questionCircle" />
					</Popover>
				</div>
				<div slot="right">
					<span />
					<span class="amount">
						<Skeleton {loading} width="5rem" height="1rem" type="text">
							<!-- <USDAmount
							amount={totalEthBalance || BigNumber.from(0)}
							precision={(totalEthBalance || BigNumber.from(0)).lt(parseWad(10)) ? 4 : 2}
						/> -->
							<Ethereum />
							{formattedNum(totalBalance, { precision: 4 })}
						</Skeleton>
					</span>
				</div>
			</InfoSpaceBetween>
		{:else}
			<span class="discrete-info"
				>After visiting the NFT page, your total nft value will be shown here</span
			>
		{/if}
	</div>
	<Skeleton {loading} width="100%" height="300px">
		<Graph width={clientWidth} {address} />
	</Skeleton>

	<div class="assets">
		<h3>Assets</h3>
		<Popover placement="right" message="Typical assets in your wallet.">
			<Icon name="questionCircle" />
		</Popover>
	</div>
	<div class="stats">
		{#each typicalAssets as asset}
			{#if asset.balance / totalBalance > 0.00005 || asset.name === 'Wallet'}
				<Skeleton loading={assetsLoading} width="100%" height="1rem" type="text">
					<InfoSpaceBetween>
						<div slot="left">
							<h4>{asset.name}:</h4>
						</div>
						<div slot="right">
							<span class="amount" style="color: var(--text-tertiary);">
								{formatNumberToUSD(asset.balance * ethPrice)}
							</span>
							<span class="amount" style="color: var(--text-tertiary);">
								{formatNumberToPercent(asset.balance / totalBalance)}
							</span>
						</div>
					</InfoSpaceBetween>
				</Skeleton>
			{/if}
		{/each}
		<Skeleton loading={assetsLoading} width="100%" height="1rem" type="text">
			<InfoSpaceBetween>
				<div slot="left">
					<h4>Other:</h4>
				</div>
				<div slot="right">
					<span class="amount" style="color: var(--text-tertiary);">
						{formatNumberToUSD(otherAssetsBalance * ethPrice)}
					</span>
					{#if otherAssetsBalance > 0}
						<span class="amount" style="color: var(--text-tertiary);">
							{'<'}
							{formatNumberToPercent(otherAssetsBalance / totalBalance + 0.00005)}
						</span>
					{:else}
						<span class="amount" style="color: var(--text-tertiary);">
							{formatNumberToPercent(0)}
						</span>
					{/if}
				</div>
			</InfoSpaceBetween>
		</Skeleton>
	</div>
</header>

<style>
	header {
		margin-top: 2rem;
		font-size: 1rem;
		line-height: 1;
		border-bottom: 2px solid var(--stroke-tertiary);
		padding-bottom: 0.75rem;
	}
	.stats {
		display: flex;
		flex-direction: column;
		width: 100%;
		row-gap: 20px;
		margin: 20px 0px;
	}
	div[slot='left'],
	div[slot='right'] {
		display: flex;
		align-items: baseline;
		gap: 5px;
		text-transform: uppercase;
	}
	div[slot='left'] {
		flex-basis: 34%;
	}
	div[slot='right'] {
		flex-basis: 66%;
		justify-content: space-between;
	}
	div[slot='left'] h4 {
		color: var(--text-tertiary);
		margin-bottom: 0px;
		font-size: 0.8rem;
	}

	div[slot='left'] :global(.antd) {
		padding-top: 2px;
		width: 0.8rem;
		height: 0.8rem;
	}

	.performance {
		color: var(--stroke-success);
		font-size: 12px;
	}

	.assets {
		display: flex;
		gap: 5px;
		width: 100%;
		margin: 20px 0px;
		color: var(--text-brand-primary);
	}
	.assets h3 {
		color: var(--text-brand-primary);
	}
	.discrete-info {
		color: var(--text-tertiary);
		font-size: 11px;
		display: flex;
		gap: 0.5rem;
	}
</style>
