<script lang="ts">
	import ActionModal from './ActionModal.svelte';
	import Button from './Button.svelte';

	export let close;
	export let confirmCallback;

	const proceed = () => {
		confirmCallback();
		close();
	};
</script>

<ActionModal title="Create a profile">
	<p>Please create a profile before starting NFT creation</p>
	<div slot="footer">
		<Button size="md" on:click={proceed}>Proceed</Button>
	</div>
</ActionModal>

<style lang="scss">
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
</style>
