<script lang="ts">
	import axios from 'axios';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon';

	let baseGasFee = '';
	const gasUnit = 'gwei';
	// let blockNumber = 0;

	onMount(async () => {
		const result = await axios.get<{
			blockPrices: { baseFeePerGas: string }[];
			currentBlockNumber: number;
		}>(`${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string}/app/web3/currentGas`, {
			headers: {
				apikey: import.meta.env.VITE_API_KEY,
			},
		});
		if ((result.status <= 200 || result.status < 400) && result.data) {
			const response = result.data;
			baseGasFee = Math.round(parseFloat(response?.blockPrices?.[0]?.baseFeePerGas));
			// blockNumber = response.currentBlockNumber;
		}
	});
</script>

{#if baseGasFee}
	<div class="gasStatus">
		<Icon name="gas" style="font-size: 14px;" viewBox="0 0 512 512" />
		{baseGasFee}
		{gasUnit}
	</div>

	<!--    
    <div class="left">{baseGasFee} {gasUnit}</div>
	<div class="right">{blockNumber}</div>
    -->
{/if}

<style>
	.gasStatus {
		display: flex;
		gap: 8px;
		align-items: center;
	}
</style>
