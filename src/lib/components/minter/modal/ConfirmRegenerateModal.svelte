<script>
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';

	// Function to close this modal
	export let close;

	export let onConfirm;

	function confirm() {
		onConfirm();
		close();
	}
</script>

<ActionModal title="Regenerate share link">
	<p>Do you want to regenerate the share link?</p>

	<div slot="footer">
		<Button size="md" type="secondary" on:click={close}>Cancel</Button>
		<Button size="md" on:click={confirm}>Regenerate</Button>
	</div>
</ActionModal>
