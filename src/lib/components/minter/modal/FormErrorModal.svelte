<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';

	export let errorList: { field: string; message: string }[];
	export let close = () => {};
</script>

<ActionModal title="Errors">
	<p>Please fix errors in the following fields:</p>
	<div class="list">
		{#each errorList as error}
			<p><span>{error.field}</span> - {error.message}</p>
		{/each}
	</div>
	<div slot="footer">
		<Button on:click={close} size="md">OK</Button>
	</div>
</ActionModal>

<style lang="scss">
	p {
		color: var(--text-tertiary);
		font-weight: 300;
	}

	span {
		font-weight: 500;
		color: var(--text-failure);
	}
	.list {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
	}
</style>
