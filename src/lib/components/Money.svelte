<script lang="ts">
	import { BigNumber } from 'ethers';
	import Ethereum from '$lib/components/Ethereum.svelte';
	import USD from '$lib/components/USD.svelte';
	import { V2_CURRENCY_ETH, V2_CURRENCY_USD } from '$utils/v2/currency';
	import EthAmount from './ETHAmount.svelte';
	import UsdAmount from './USDAmount.svelte';

	export let currency: BigNumber = BigNumber.from(V2_CURRENCY_ETH);
	export let amount: BigNumber | string = BigNumber.from('0');
	export let formatWad = true;
	export let precision = 0;

	$: if (typeof amount === 'number') {
		console.log(amount);
	}
</script>

<span>
	{#if formatWad}
		{#if BigNumber.from(currency ?? BigNumber.from(0)).eq(V2_CURRENCY_USD)}
			<UsdAmount {amount} {precision} />
		{:else}
			<EthAmount {amount} {precision} />
		{/if}
	{:else if BigNumber.from(currency).eq(V2_CURRENCY_USD)}
		<USD />{amount}
	{:else}
		<Ethereum />{amount}
	{/if}
</span>

<style>
	span {
		display: inline-flex;
	}
</style>
