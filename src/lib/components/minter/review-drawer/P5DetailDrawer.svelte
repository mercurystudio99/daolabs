<script lang="ts">
	import { generateP5Html } from '$lib/utils/p5Template';
	import P5ScriptPreviewBox from '$lib/components/P5ScriptPreviewBox.svelte';
	import Img from '$lib/components/Img.svelte';
	import CommonDetailDrawer from './CommonDetailDrawer.svelte';
	import type { P5Collection } from '$models/minter/collection-config';
	import type { P5NftConfig } from '$models/minter/nft-config';

	export let isOpen: boolean;
	export let nft: P5NftConfig;
	export let collection: P5Collection;

	let template: string;

	$: {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			template = generateP5Html(nft.script);
		} catch (e) {
			console.error(e);
		}
	}
</script>

<CommonDetailDrawer bind:isOpen {nft} {collection}>
	<div class="preview">
		{#if template}
			<P5ScriptPreviewBox script={template} />
		{:else}
			<div class="missing">
				<Img
					src={nft.previewImage}
					alt="missing"
					placeholder="https://via.placeholder.com/100?text=..."
				/>
			</div>
		{/if}
	</div>
</CommonDetailDrawer>

<style lang="scss">
	.preview {
		border-bottom: 1px solid var(--stroke-tertiary);
		width: 100%;
		max-width: 450px;
		margin: 16px auto;
		position: relative;

		.missing {
			height: 300px;
			width: 300px;
			margin: 0 auto;
			margin-bottom: 16px;
		}
	}
</style>
