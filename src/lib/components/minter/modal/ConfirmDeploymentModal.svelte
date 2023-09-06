<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import { copyToClipboard } from '$utils/clipboard';

	// Function to close this modal
	export let close;

	export let onConfirm;
	export let shareLink: { url: string; timestamp: string };

	function confirm() {
		onConfirm();
		close();
	}
</script>

<ActionModal title="Deployment">
	<p>Deploy services need approximately 30 min to finish.</p>

	{#if shareLink}
		<div class="link" on:click={() => copyToClipboard(shareLink.url)} on:keydown>
			{shareLink.timestamp}
			<Icon name="copy" />
		</div>
	{/if}

	<div slot="footer">
		<Button size="md" type="secondary" on:click={close}>Cancel</Button>
		<Button size="md" on:click={confirm}>Deploy</Button>
	</div>
</ActionModal>

<style lang="scss">
	.link {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		color: #7fcec9;
		cursor: pointer;
	}
</style>
