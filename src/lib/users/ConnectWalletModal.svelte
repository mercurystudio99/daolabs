<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';

	export let close;
	export let confirmCallback;

	const proceed = () => {
		confirmCallback();
		close();
	};
</script>

<ActionModal title="Information">
	<p>In order to save your user information, you are being asked to authenticate.</p>
	<div slot="footer">
		<Button size="md" on:click={proceed} type="secondary">Continue</Button>
	</div>
</ActionModal>

<style lang="scss">
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
</style>
