<script lang="ts">
	import { constants } from 'ethers';
	import Button from '$lib/components/Button.svelte';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Input from '$lib/components/Input.svelte';
	import Slider from '../../slider/Slider.svelte';

	export let close;

	let benficiaryAddress = '';
	let percentAllocation = 0;
	let agree = false;

	function handleEdit() {
		close?.({
			benficiaryAddress,
			percentAllocation,
		});
	}
</script>

<div class="modal">
	<h2>Edit Payout receiver</h2>
	<span>Lorem, ipsum.</span>

	<h2>Benficiary Address*</h2>

	<Input type="address" bind:value={benficiaryAddress} placeholder={constants.AddressZero} />
	<span>This address will receive the payout from sold NFTs.</span>

	<h2>Percent allocation</h2>
	<div class="row">
		<Slider
			id="payout-percent-allocation"
			min={0}
			max={100}
			step={0.01}
			bind:value={percentAllocation}
		/>
		<input type="text" class="percent" value="{percentAllocation?.toFixed(0)}%" />
	</div>
	<span> The percent this individual receives of the total revenue. </span>
	<br />
	<div class="row">
		<Checkbox bind:checked={agree} />
		<span>
			I understand that these values can't be changed after deployment and I hereby accept the Token
			Agreement.
		</span>
	</div>
	<br />
	<Button
		type="secondary"
		fullWidth
		on:click={handleEdit}
		disabled={!benficiaryAddress || !percentAllocation || !agree}
	>
		Edit
	</Button>
</div>

<style>
	.modal {
		width: 600px;
	}
	h2 {
		color: var(--text-header);
		font-size: 0.9rem !important;
	}

	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.percent {
		width: 5rem;
		text-align: center;
		border: 1px solid gray;
		outline: none;
		background: transparent;
	}
</style>
