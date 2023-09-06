<script lang="ts">
	import Icon from '$lib/components/Icon';
	import P5ScriptPreviewBox from '$lib/components/P5ScriptPreviewBox.svelte';
	import CommonNftPreview from './CommonNftPreview.svelte';
	import type { P5NftConfig } from '$models/minter/nft-config';
	import type { TokenStandard } from '$models/minter/token-standard';
	import type { P5Collection } from '$models/minter/collection-config';

	export let standard: TokenStandard;
	export let nft: P5NftConfig;
	export let collection: P5Collection;
	export let template: string;

	export let iframeRef: HTMLIFrameElement;
	// let tried = 0;
</script>

<CommonNftPreview {standard} {collection} {nft}>
	<div class="preview" class:template>
		{#if template}
			<P5ScriptPreviewBox script={template} bind:iframeRef />
		{:else}
			<div class="missing">
				<Icon name="missingImage" viewBox="0 0 18 16" />
			</div>
		{/if}
	</div>
</CommonNftPreview>

<style lang="scss">
	.preview {
		border-bottom: 1px solid var(--stroke-tertiary);
		width: 100%;
		max-width: 500px;
		height: 500px;
		margin: 16px auto;
		position: relative;

		.missing {
			display: flex;
			align-items: center;
			justify-content: center;
			aspect-ratio: 1;
			border: 0.4px solid rgba(0, 0, 0, 0.2);
			font-size: 100px;
			color: rgba(245, 163, 18, 0.24);
		}
	}
	.template {
		display: flex;
		align-items: center;
	}
</style>
