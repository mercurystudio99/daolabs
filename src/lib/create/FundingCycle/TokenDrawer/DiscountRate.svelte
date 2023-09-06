<script lang="ts">
	import AlertText from '$lib/components/AlertText.svelte';
	import Range from '$lib/components/Range.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import { formattedNum } from '$utils/formatNumber';
	import type { BigNumberish } from 'ethers';

	export let disabled = false;
	export let discountRate: number;
	export let issuanceRate: number;
	export let reservedRate: number;
	export let checked = discountRate > 0;

	let rangeValue: number[] = [discountRate];

	let secondIssuanceRate: BigNumberish;
	let thirdIssuanceRate: BigNumberish;

	$: {
		const reversedRateDecimal = reservedRate * 0.01;
		const initialIssuanceRate = issuanceRate - issuanceRate * reversedRateDecimal;
		discountRate = rangeValue[0];

		const discountRateDecimal = rangeValue[0] * 0.01;
		secondIssuanceRate = initialIssuanceRate - initialIssuanceRate * discountRateDecimal;
		thirdIssuanceRate = secondIssuanceRate - secondIssuanceRate * discountRateDecimal;
	}
</script>

<header>
	<Toggle id="discount" {disabled} bind:checked
		><h3>
			Discount rate
			{#if !disabled && !discountRate}
				<span>({disabled ? '' : '0%'})</span>
			{/if}
		</h3></Toggle
	>
</header>
{#if disabled}
	<AlertText>Disabled when your project's funding cycle has no duration.</AlertText>
{/if}
{#if checked}
	<Range bind:values={rangeValue} max={20} step={0.1} />
{/if}
<p>
	Your project token's issuance rate will decrease by this percentage every funding cycle. A higher
	discount rate will incentivize supporters to pay your project earlier.
</p>
{#if rangeValue[0] > 0}
	<InfoBox>
		The issuance rate of your second funding cycle will be
		<b>{formattedNum(secondIssuanceRate)} tokens / ETH</b>,
		<b>
			{formattedNum(thirdIssuanceRate)}
			tokens / ETH
		</b>for your third funding cycle, and so on.
	</InfoBox>
{/if}
