<script lang="ts">
	import { BigNumber } from 'ethers';
	import { formattedNum, fromWad, parseWad } from '$utils/formatNumber';
	import { betweenZeroAndOne } from '$utils/bigNumbers';
	import Ethereum from '$lib/components/Ethereum.svelte';

	export let amount: BigNumber | string;
	export let precision = 4;

	$: amount = amount || BigNumber.from(0);

	$: isBetweenZeroAndOne = BigNumber.isBigNumber(amount)
		? betweenZeroAndOne(amount)
		: betweenZeroAndOne(parseWad(amount));

	$: precisionAdjusted = isBetweenZeroAndOne ? 4 : precision;
	$: formattedETHAmount = formattedNum(Number(fromWad(amount)).toString(), {
		precision: precisionAdjusted,
		thousandsSeparator: ',',
	});
</script>

{#if amount}
	<Ethereum />{formattedETHAmount}
{/if}
