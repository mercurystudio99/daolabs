<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';

	import PopInfo from '$lib/components/PopInfo.svelte';
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import { formattedNum } from '$utils/formatNumber';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import FormError from '$lib/components/minter/form/FormError.svelte';
	import type { CurrencyName } from '$constants/currency';

	// Export variables
	export let price: number;
	export let currency: CurrencyName;
	export let handleChange;
	export let title = 'Price per NFT';
	export let showError = false;
	export let errorMessage = '';

	// Local variables
	let ethToUsdRate = 0;

	// Functions
	function convertPrice(sourcePrice: number, currencyName: CurrencyName, currencyRate: number) {
		return `$${formattedNum(sourcePrice * currencyRate, { precision: 2 })} total`;
	}

	function setCurrency(e) {
		currency = e.detail.currency.eq(V2_CURRENCY_ETH) ? 'ETH' : 'USD';
	}

	// Reactive
	$: priceConverted = convertPrice(price, currency, currency === 'ETH' ? ethToUsdRate : 1);

	// Hooks
	onMount(async () => {
		try {
			const result = await axios.post(
				'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
			);
			ethToUsdRate = result.data.USD;
		} catch (e) {
			console.log(`error getting eth conversion rate ${String(e)}`);
		}
	});
</script>

<div class="price-input">
	<label for="price">
		<PopInfo message="Tooltip text">{title}</PopInfo>
	</label>
	<CurrencyInput
		bind:inputValue={price}
		on:change={handleChange}
		on:switchCurrency={setCurrency}
		step={0.001}
	/>
	<div class="additional">
		<span class="conversion">{priceConverted}</span>
		{#if showError}
			<FormError error={errorMessage} />
		{/if}
	</div>
	<!-- <span class="total-supply">Total supply: {collectionSupply} NFTs</span> -->
</div>

<style lang="scss">
	.price-input {
		display: flex;
		flex-direction: column;
		margin-bottom: 16px;

		label {
			color: var(--text-header);
			margin-bottom: 8px;
			display: flex;
		}
		.additional {
			display: flex;
			flex-direction: row-reverse;
			align-items: center;
		}
		.conversion {
			margin-left: auto;
			font-size: 11px;
			font-weight: 300;
			color: var(--text-secondary);
			margin-top: 4px;
		}
	}
</style>
