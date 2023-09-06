<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';

	export let close;
</script>

<ActionModal title="User tool">
	<p>Placeholder text</p>
	<div slot="footer">
		<Button size="md" on:click={close}>Ok</Button>
	</div>
</ActionModal>

<style lang="scss">
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
</style>
