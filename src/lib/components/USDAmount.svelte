<script lang="ts">
	import { onMount } from 'svelte';
	import { BigNumber } from 'ethers';
	import { fromWad, formatWad, parseWad } from '$utils/formatNumber';
	import { betweenZeroAndOne } from '$utils/bigNumbers';
	import { getCurrencyConverter } from '$data/currency';
	import USD from '$lib/components/USD.svelte';
	import Popover from './Popover.svelte';

	export let amount: BigNumber | string;
	export let precision = 0;
	export let padEnd = false;

	let converter: any;
	let ETHAmount = BigNumber.from(0);

	// Account for being passed a string amount or a BigNumber amount
	const isBetweenZeroAndOne =
		(BigNumber.isBigNumber(amount) && betweenZeroAndOne(amount)) ||
		betweenZeroAndOne(parseWad(amount));

	const precisionAdjusted = isBetweenZeroAndOne ? 4 : precision;

	const formattedUSDAmount = formatWad(amount, {
		precision: precisionAdjusted ?? 0,
		padEnd: padEnd ?? false,
	});

	const formattedETHAmount = formatWad(ETHAmount, {
		precision: precisionAdjusted ?? 0,
		padEnd: padEnd ?? false,
	});

	onMount(async () => {
		converter = await getCurrencyConverter();
		ETHAmount = converter.usdToWei(fromWad(amount));
	});
</script>

{#if amount}
	<Popover message={`${formattedETHAmount}Ξ`}>
		<USD />{formattedUSDAmount}
	</Popover>
{/if}
