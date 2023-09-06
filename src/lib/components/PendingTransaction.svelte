<script lang="ts">
	import { onMount } from 'svelte';
	import Trans from '$lib/components/Trans.svelte';
	import Icon from '$lib/components/Icon';
	import { createCustomNotification } from '$utils/notification';
	import { readNetwork } from '$stores/web3';
	import type { UpdateNotification } from '@web3-onboard/core';
	import type { ContractTransaction } from 'ethers';

	export let txnResponse: ContractTransaction;
	export let functionName: string = '';
	export let notify = true;
	export let close: () => void;

	let errorMessage = '';

	onMount(async () => {
		try {
			let update: UpdateNotification;
			if (notify) {
				const { update: updateFunc } = createCustomNotification({
					message: 'Your transaction has been submitted and is awaiting confirmation.',
					link: `https://${
						$readNetwork.alias === 'mainnet' ? '' : `${String($readNetwork.alias)}.`
					}etherscan.io/tx/${txnResponse.hash}`,
					type: 'pending',
				});
				update = updateFunc;
			}
			try {
				await txnResponse.wait();
			} catch (error) {
				errorMessage = error?.message || 'Transaction was failed';
			}
			if (notify && update) {
				update({
					message: errorMessage || 'Your transaction has been confirmed successfully',
					link: `https://${
						$readNetwork.alias === 'mainnet' ? '' : `${String($readNetwork.alias)}.`
					}etherscan.io/tx/${txnResponse.hash}`,
					type: errorMessage ? 'error' : 'success',
					autoDismiss: 3000,
				});
			}
			close();
		} catch (error) {
			errorMessage = error.message?.match(/^[\w\s]+/)?.[0];
		}
	});
</script>

<section>
	<div>
		{#if errorMessage}
			<h2>
				<Icon name="exclamationCircle" style="color: red; transform: translateY(3px)" /> Error
			</h2>
			<p class="error">{errorMessage}</p>
		{:else}
			<img src="/images/fire.gif" alt={'Movement transaction pending animation'} />
			{#if functionName}
				<h3 style="margin-top: 0.5rem; font-weight: bold;text-transform:capitalize">
					Executing {functionName}
				</h3>
			{/if}
			<h2>
				<Trans>Transaction pending</Trans>
			</h2>
			<p>
				<Trans
					>Your transaction has been submitted and is awaiting confirmation. Note that it may take a
					few moments for your transaction to be displayed in the activity feed due to latency
					between finalization and the Graph indexing the transaction.</Trans
				>
			</p>
		{/if}
	</div>
</section>

<style>
	img {
		max-width: 100px;
	}
	section {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 2rem 0;
	}

	div {
		max-width: 400px;
		text-align: center;
	}
</style>
