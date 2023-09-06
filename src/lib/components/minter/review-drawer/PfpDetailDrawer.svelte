<script lang="ts">
	import ImageViewer from '$lib/components/ImageViewer.svelte';
	import PfpLayering from '../preview/PFPLayering.svelte';
	import CommonDetailDrawer from './CommonDetailDrawer.svelte';
	import DetailSection from './DetailSection.svelte';
	import type { PfpCollection } from '$models/minter/collection-config';
	import type { NftConfig, PfpProperty } from '$models/minter/nft-config';

	export let isOpen: boolean;
	export let nft: NftConfig;
	export let collection: PfpCollection;
	export let selectedNft: { [key: string]: PfpProperty };
	export let calculateRarityForLayer: (layer: string, attribute: PfpProperty) => string;

	let displayViewer = false;
	const entries: [string, PfpProperty][] = Object.entries(selectedNft.layers);
</script>

<CommonDetailDrawer bind:isOpen {nft} {collection}>
	<div on:click={() => (displayViewer = true)} on:keydown>
		<PfpLayering layers={Object.values(selectedNft.layers)} imgStyle={{ minHeight: '300px' }} />
	</div>
	<div class="content">
		<DetailSection header="Attributes">
			<div class="attribute-container">
				{#each entries as [layer, attribute]}
					<div class="attribute">
						<span class="name">{layer}</span>
						<span class="value">{attribute.name?.replace(/_/g, ' ')}</span>
						<span class="rarity">{calculateRarityForLayer(layer, attribute)} have this trait</span>
					</div>
				{/each}
			</div>
		</DetailSection>
	</div>
</CommonDetailDrawer>
{#if displayViewer}
	<ImageViewer
		layers={Object.values(selectedNft.layers)}
		style={{ height: '100vh', width: '100vw' }}
		close={() => (displayViewer = false)}
		type="pfp"
	/>
{/if}

<style lang="scss">
	.content {
		margin-top: 1rem;
		border-radius: 1px;
		stroke: none;
		color: var(--text-primary);
		position: relative;
	}
	.attribute-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, 150px);
		column-gap: 28px;
		row-gap: 16px;
		align-self: center;
		width: 100%;

		.attribute {
			width: 100%;
			background: var(--background-l0);
			border: 1px solid var(--stroke-secondary);
			padding: 10px;
			display: flex;
			flex-direction: column;

			.name {
				font-size: 11px;
				color: #7fcec9;
			}
			.value {
				font-size: 14px;
				line-height: 24px;
			}
			.rarity {
				font-size: 11px;
				line-height: 24px;
				color: var(--text-secondary);
			}
		}
	}
</style>
