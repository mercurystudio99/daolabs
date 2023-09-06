<script lang="ts">
	import { formattedNum } from '$utils/formatNumber';
	import Icon from '$lib/components/Icon';
	import PopInfo from './PopInfo.svelte';

	export let exchangeName: 'Uniswap' | 'Sushiswap';
	export let exchangeLink: string;
	export let showExchangeName = true;
	export let tokenSymbol: string;
	export let WETHPrice: string;

	const icon = exchangeName?.toLowerCase() as 'uniswap' | 'sushiswap';
	const link =
		icon === 'uniswap'
			? `https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=${exchangeLink}`
			: `https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=${exchangeLink}`;
</script>

<div class="token-amm-price-row">
	<span class="left">
		<Icon name={icon} style={icon === 'sushiswap' ? 'width: 12px; height: 12px' : ''} />
		{#if showExchangeName}
			<span class="name">
				{exchangeName}
			</span>
		{/if}
	</span>
	<span class="right">
		{#if WETHPrice}
			<a href={link} target="_blank" rel="noreferrer">
				{`${formattedNum(WETHPrice)} ${tokenSymbol}`}
			</a>
		{:else}
			<PopInfo message={`${exchangeName} has no market for ${tokenSymbol}`} maxWidth="250px">
				Unavailable
			</PopInfo>
		{/if}
	</span>
</div>

<style>
	.token-amm-price-row {
		display: flex;
		font-size: 10px;
		padding: 0.25rem 0;
		gap: 8px;
		align-items: center;
	}
	.name {
		display: inline-block;
		transform: translateY(-2px);
	}

	a {
		display: flex;
		align-items: center;
		gap: 4px;
	}
</style>
