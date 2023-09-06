<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import BidList from '$lib/auction/BidList.svelte';
	import Button from '$lib/components/Button.svelte';

	export let close = () => {};
	export let bids;
</script>

<ActionModal title="Bids">
	<div class="list">
		<BidList {bids} />
	</div>
	<svelte:fragment slot="footer">
		<Button on:click={close} size="md">Close</Button>
	</svelte:fragment>
</ActionModal>

<style>
	.list {
		min-width: 400px;
	}
</style>
