<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';

	export let close: () => void;
	export let message: string = 'Are you sure you want to do this?';
	export let onConfirm = () => {};

	function confirm() {
		onConfirm();
		close();
	}
</script>

<ActionModal title="Confirm action">
	<section>
		<p>
			{message}
		</p>
	</section>
	<div slot="footer">
		<Button size="sm" type="secondary" on:click={close}>Cancel</Button>
		<Button size="sm" on:click={confirm}>Confirm</Button>
	</div>
</ActionModal>

<style>
	p {
		font-weight: 300;
	}
</style>
