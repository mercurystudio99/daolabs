<script lang="ts">
	import { BigNumber } from 'ethers';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import { parseWad } from '$utils/formatNumber';
	import Button from './Button.svelte';
	import CurrencyInput from './CurrencyInput.svelte';

	export let onClose = () => {};
	export let close = () => {};
	export let onOk: (distributionLimit: number, distributionLimitCurrency: BigNumber) => void;
	export let distributionLimit = 0;
	export let distributionLimitCurrency = BigNumber.from(V2_CURRENCY_ETH);

	$: distributionLimit = distributionLimit || 0;
	$: if (!distributionLimitCurrency || distributionLimitCurrency.eq(0)) {
		distributionLimitCurrency = BigNumber.from(V2_CURRENCY_ETH);
	}

	function handleOkClick() {
		onOk(distributionLimit, BigNumber.from(distributionLimitCurrency));
		close();
	}
</script>

<h3>Set a distribution limit</h3>

<div>
	<CurrencyInput
		initialValue={BigNumber.from(parseWad(distributionLimit))}
		bind:inputValue={distributionLimit}
		bind:currency={distributionLimitCurrency}
	/>
	<small>Set this to the sum of all your payouts</small>

	<br />

	<div class="actions">
		<Button
			on:click={() => {
				close();
				onClose();
			}}
			size="md"
			type="secondary">Cancel</Button
		>
		<Button size="md" on:click={handleOkClick}>Ok</Button>
	</div>
</div>

<style>
	div {
		max-width: 100vw;
		width: 400px;
	}
	.actions {
		margin-top: 1rem;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
	}
</style>
