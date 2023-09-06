<script lang="ts">
	import { BigNumber } from 'ethers';
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import FormError from '../form/FormError.svelte';

	export let close;
	export let treasury: number;
	export let mode: string;
	export let action: (value: number) => void;

	let amount = 0;
	let showError = false;

	const confirm = () => {
		if (mode === 'Withdraw') {
			console.log(treasury);
			if (amount > treasury) {
				showError = true;
				return;
			}
		}
		action(Number(amount));
		close();
	};
</script>

<ActionModal title={`${mode} funds`}>
	<p>Placeholder text</p>
	<CurrencyInput
		currency={BigNumber.from(V2_CURRENCY_ETH)}
		placeholder="Amount"
		bind:inputValue={amount}
		disabledCurrency
	/>
	{#if showError}
		<FormError error={'Insufficient funds'} />
	{/if}
	<div slot="footer">
		<Button size="md" on:click={confirm}>Proceed</Button>
	</div>
</ActionModal>

<style lang="scss">
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
</style>
