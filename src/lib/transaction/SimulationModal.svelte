<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { readNetwork } from '$stores/web3';
	import Icon from '$lib/components/Icon';
	import type { ContractTransaction, PopulatedTransaction } from 'ethers';

	export let submit: () => Promise<ContractTransaction>;
	export let close: () => void;
	export let populatedTransaction: PopulatedTransaction;
	export let functionName: string;

	let simulation: {
		success: boolean;
		id: string;
		error?: string;
	} = undefined;

	let pending = false;

	async function simulateTxn() {
		if (pending) return;
		pending = true;
		try {
			const response = await fetch(`https://juicebox.wtf/simulate/`, {
				method: 'POST',
				body: JSON.stringify({
					save: true,
					save_if_fails: true,
					simulation_type: 'quick',
					network_id: Number($readNetwork.id),
					from: populatedTransaction.from,
					to: populatedTransaction.to,
					input: populatedTransaction.data,
					value: populatedTransaction.value?.toString() ?? '0',
					gas: populatedTransaction.gasLimit ?? 8000000,
					gas_price: populatedTransaction.gasPrice ?? 0,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			simulation = {
				success: Boolean(data?.transaction?.status),
				id: data?.simulation?.id,
				error: data?.error?.slug,
			};
		} catch (error) {
			console.error(error);
		}
		pending = false;
	}

	let submiting = false;
	async function submitTransaction() {
		submiting = true;
		const txnResponse = await submit();
		submiting = false;
		if (txnResponse) {
			close();
		}
	}
</script>

<section>
	<h3>Review Transaction Details</h3>
	<span>
		<p>
			The following action requires an on-chain transaction from <a
				href="https://etherscan.io/address/{populatedTransaction.from}"
				target="_blank"
				rel="noreferrer"><EnsOrAddress address={populatedTransaction.from} /></a
			>
			to an Ethereum smart contract
			<a
				href="https://etherscan.io/address/{populatedTransaction.to}"
				target="_blank"
				rel="noreferrer"><EnsOrAddress address={populatedTransaction.to} /></a
			>, at the function
			<b
				>{#if functionName} {functionName}{/if}</b
			>.
		</p>
		<p>
			As a precaution, we are providing you with an ability to simulation the transaction using
			<a href="https://dashboard.tenderly.co/" target="_blank" rel="noreferrer">Tenderly</a>.
		</p></span
	>
	<div />

	<div class="align-right" />
	{#if pending}
		<div class="loading">
			<Loading height={40} />
		</div>
	{:else if simulation?.id}
		<div class="simulate" class:success={simulation.success} class:failure={!simulation.success}>
			<h4>Simulation: {simulation.success ? 'Success' : 'Failed'}</h4>
			<span>
				{#if simulation.success}
					The transaction executing the {#if functionName} {functionName}{/if} function with
					<a
						href="https://etherscan.io/address/{populatedTransaction.to}"
						target="_blank"
						rel="noreferrer"><EnsOrAddress address={populatedTransaction.to} /></a
					> was successfully simulated.
				{:else}
					The transaction was simulated.
				{/if}
				The full report is available
				<a
					href="https://dashboard.tenderly.co/public/safe/safe-apps/simulator/{simulation.id}"
					target="_blank"
					rel="noreferrer">on Tenderly</a
				>
			</span>
		</div>
	{:else if simulation?.error}
		<div class="simulate" class:success={simulation.success} class:failure={!simulation.success}>
			<span>
				{simulation?.error?.replace(/[_]+/g, ' ')}
			</span>
		</div>
	{:else}
		<br />
	{/if}
	<div class="align-right">
		<Button size="md" type="secondary" disabled={pending} on:click={simulateTxn}>
			Simulate{#if pending}<Icon name="loading" spin />{/if}
		</Button>
		<Button size="md" disabled={submiting} on:click={submitTransaction}>
			Submit{#if submiting}<Icon name="loading" spin />{/if}
		</Button>
	</div>
</section>

<style>
	section {
		max-width: 409.6px;
		width: 100%;
		margin-bottom: -1.2rem;
	}
	h3 {
		font-weight: bold;
		margin-top: -1.5rem;
	}
	.simulate {
		box-sizing: border-box;
		font-size: 0.8rem;
		border-radius: 5px;
		margin: 1rem 0;
	}
	.simulate h4 {
		font-weight: bold;
		margin: 0rem 0;
	}
	.simulate.success {
		border-color: var(--text-success);
	}
	.simulate.failure {
		border-color: var(--text-failure);
	}
	.align-right {
		width: 400px;
		max-width: 90vw;
		margin: 0.25rem 0;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	.loading {
		margin: 2rem 0;
	}
</style>
