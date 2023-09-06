<script lang="ts">
	import { marked } from 'marked';
	import ActionModal from '../ActionModal.svelte';
	import Button from '../Button.svelte';

	export let close: () => void;
	export let markdown: string;
	export let title: string;
</script>

<ActionModal {title} width="min-content">
	<article>
		{#if markdown}
			{@html marked(markdown)}
		{/if}
	</article>
	<div slot="footer">
		<Button type="secondary" on:click={close}>Close</Button>
	</div>
</ActionModal>

<style>
	article {
		margin-bottom: 40px;
		min-width: 50vw;
		padding: 16px;
	}

	[slot='footer'] {
		margin-bottom: 16px;
	}

	@media (max-width: 768px) {
		article {
			min-width: 75vw;
		}
	}
</style>
