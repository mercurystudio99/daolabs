<script>
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';

	// Function to close this modal
	export let close;

	export let onConfirm;
	export let onCancel;

	function cancel() {
		onCancel();
		close();
	}
	function confirm() {
		onConfirm();
		close();
	}
</script>

<ActionModal title="Unsaved changes">
	<p>You have unsaved changes. Are you sure you want to discard them?</p>

	<div slot="footer">
		<Button size="md" type="secondary" on:click={cancel}>Discard</Button>
		<Button size="md" on:click={confirm}>Save</Button>
	</div>
</ActionModal>
