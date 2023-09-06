<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';

	export let onConfirm = () => {};
	export let onCancel = () => {};
	export let close = () => {};
	export let label = '';

	function cancel() {
		onCancel();
		close();
	}

	function confirm() {
		onConfirm();
		close();
	}
</script>

<ActionModal title="Confirm Delete">
	<p>Are you sure you want to delete this{label ? ` ${label}` : ''}?</p>
	<div slot="footer">
		<Button size="md" type="secondary" on:click={cancel}>Cancel</Button>
		<Button size="md" on:click={confirm}>Delete</Button>
	</div>
</ActionModal>
