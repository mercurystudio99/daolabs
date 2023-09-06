<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import EthAmount from '$lib/components/ETHAmount.svelte';

	export let close;
	export let weiAmount;

	function confirmBid() {
		close();
	}
</script>

<ActionModal title="Confirm bid">
	<section>
		<p>
			Are you sure you want to bid
			<EthAmount amount={weiAmount} />? This is a binding action.
		</p>
	</section>
	<div slot="footer">
		<Button size="sm" type="secondary" on:click={close}>Cancel</Button>
		<Button size="sm" on:click={confirmBid}>Bid</Button>
	</div>
</ActionModal>

<style>
	p {
		font-weight: 300;
	}
</style>
