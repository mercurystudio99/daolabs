<script lang="ts">
	import { goto } from '$app/navigation';

	import ActionModal from './ActionModal.svelte';
	import Button from './Button.svelte';

	export let close;

	const goToCreate = async () => {
		await goto('/create');
		close();
	};
</script>

<ActionModal title="Create a Treasury">
	<p>Please create a Treasury to route your fees.</p>
	<div slot="footer">
		<Button size="md" on:click={goToCreate}>Proceed</Button>
	</div>
</ActionModal>

<style lang="scss">
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
</style>
