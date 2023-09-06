<script lang="ts">
	import { BigNumber, utils } from 'ethers';
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import ETH from '$lib/components/Ethereum.svelte';
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import { formatWad } from '$utils/formatNumber';
	import { getCurrencyConverter } from '$data/currency';
	import { V2_CURRENCY_ETH, V2_CURRENCY_USD } from '$utils/v2/currency';

	export let disabled = false;
	export let onClick: (weiAmount: BigNumber) => void;
	export let payButton: string = 'Pay';
	export let placeholder: string = '0.00';
	export let amount: string | BigNumber | number = '';
	export let disabledCurrency = false;
	export let minimum: string | BigNumber = '0.01';

	let buttonDisabled = true;
	let converter: any;
	let currency = BigNumber.from(V2_CURRENCY_ETH);
	let formattedETHAmount: string;
	let formattedUsdAmount: string;

	function onPay() {
		let weiAmount: BigNumber;
		if (currency.eq(V2_CURRENCY_ETH)) {
			weiAmount = utils.parseEther(amount.toString());
		} else {
			weiAmount = utils.parseEther(formattedETHAmount);
		}
		onClick(weiAmount);
	}

	onMount(async () => {
		converter = await getCurrencyConverter();
	});

	$: if (converter) {
		const ETHAmount: BigNumber = converter?.usdToWei(amount?.toString());
		if (amount) {
			const USDAmount = converter?.weiToUsd(utils.parseUnits(amount?.toString()));
			formattedUsdAmount = USDAmount.toString();
		}
		formattedETHAmount = formatWad(ETHAmount, {
			precision: 9,
		});
	}

	$: {
		if (currency.eq(V2_CURRENCY_ETH)) {
			buttonDisabled = disabled || amount < minimum;
		} else {
			buttonDisabled = disabled || Number(formattedETHAmount) < Number(minimum);
		}
	}
</script>

<div class="wrapper">
	<div class="stacked expand">
		<CurrencyInput
			bind:currency
			bind:inputValue={amount}
			{disabled}
			{disabledCurrency}
			{placeholder}
		/>
	</div>
	<div class="stacked">
		<Button disabled={buttonDisabled} size="md" on:click={onPay}>{payButton || 'Pay'}</Button>
		{#if currency.eq(V2_CURRENCY_USD)}
			<small>Paid as <ETH />{formattedETHAmount}</small>
		{:else if formattedUsdAmount}
			<small>Paid as ${formattedUsdAmount}</small>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		margin-top: 40px;
		display: flex;
	}

	.expand {
		flex: 1;
		margin-right: 10px;
	}

	.stacked {
		display: flex;
		flex-direction: column;
	}

	.stacked:last-of-type {
		text-align: center;
	}
</style>
