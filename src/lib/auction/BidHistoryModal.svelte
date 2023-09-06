<script>
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import BidList from './BidList.svelte';

	export let close;
	export let data;
</script>

<ActionModal title="Bid history">
	<section>
		<BidList bids={data.bids} />
	</section>
	<div slot="footer">
		<Button size="sm" on:click={close}>Close</Button>
	</div>
</ActionModal>

<style>
	section {
		width: 450px;
	}
</style>
