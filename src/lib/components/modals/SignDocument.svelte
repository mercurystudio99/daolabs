<script lang="ts">
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import { signDocument, type Template } from '$services/templates';
	import ActionModal from '../ActionModal.svelte';
	import Button from '../Button.svelte';

	export let template: Template;
	export let resolve: (value: any) => void;
	export let reject: (reason?: any) => void;
	export let close: () => void;

	let markdown: string;

	async function sign() {
		try {
			const result = await signDocument(template.id);
			resolve(result);
			close();
		} catch (error) {
			reject(error);
			close();
		}
	}

	function decline() {
		reject();
		close();
	}

	onMount(async () => {
		const data = await fetch(`/documents/${template.id}.md`);
		markdown = await data.text();
	});
</script>

<ActionModal title="Sign {template.title}" width="min-content">
	<article>
		{#if markdown}
			{@html marked(markdown)}
		{/if}
	</article>
	<div slot="footer">
		<Button type="secondary" on:click={decline}>Disconnect</Button>
		<Button on:click={sign} buttonProps={{ style: 'margin-left: 20px' }}>Sign</Button>
	</div>
</ActionModal>

<style>
	article {
		margin-bottom: 40px;
		min-width: 50vw;
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
