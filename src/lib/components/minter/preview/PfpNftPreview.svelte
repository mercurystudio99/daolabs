<script lang="ts">
	import Icon from '$lib/components/Icon';
	// import Toggle from '$lib/components/Toggle.svelte';
	import { createExampleLayering, type PfpPropertyLayer } from '$lib/utils/nftCreationUtils';
	import ExpandArrow from '../advanced-arrow/ExpandArrow.svelte';
	import CommonNftPreview from './CommonNftPreview.svelte';
	import PfpLayering from './PFPLayering.svelte';
	import type { PfpAttribute, PfpNftConfig } from '$models/minter/nft-config';
	import type { PfpCollection } from '$models/minter/collection-config';
	import type { TokenStandard } from '$models/minter/token-standard';

	export let standard: TokenStandard;
	export let nft: PfpNftConfig;
	export let collection: PfpCollection;
	export let expanded = {};

	const scaleUp = {};

	let exampleLayering: PfpPropertyLayer[][] = [];
	let fullpageLayer = undefined;
	const imgRefs: HTMLImageElement[] = [];
	const initialWidths = [];

	let combined: PfpNftConfig[] = [];

	function hasProperties(attribute: PfpAttribute) {
		// NOTE: Remove this at some point when we know where the empty population is coming from.
		return attribute?.properties?.length;
	}

	function toggleLayerFullpage(layerName: string) {
		if (fullpageLayer === layerName) {
			fullpageLayer = undefined;
		} else {
			fullpageLayer = layerName;
		}
	}

	// function removeProperty(populationIndex, attributeIndex, propertyIndex) {
	// TODO temporarily removed until I figure out why the rest of population won't update.
	// 	let properties = nft.population[populationIndex].attributes[attributeIndex].properties;
	// 	properties = [...properties.slice(0, propertyIndex), ...properties.slice(propertyIndex + 1)];
	// 	nft.population[populationIndex].attributes[attributeIndex].properties = properties;
	// }

	function extractNameFromLayerName(layername: string) {
		// Given a string in the form foo_foo_foo_, or foo-foo-foo,
		// return foo foo foo
		return layername.split(/[-_]/).join(' ');
	}

	function updateLayering(_nft: PfpNftConfig, _nftIndex: number) {
		const realAttributes = _nft.layers?.filter((attribute) => hasProperties(attribute));
		const realLayers = exampleLayering[_nftIndex]
			? exampleLayering[_nftIndex].filter((layer) => Object.keys(layer).length)
			: [];
		if (!exampleLayering[_nftIndex] || realLayers.length !== realAttributes.length) {
			return createExampleLayering(_nft, true);
		}
		// If same length, we need to make sure the order is the same
		let layers: PfpPropertyLayer[] = [];
		for (let index = 0; index < _nft.layers.length; index++) {
			const attribute = _nft.layers[index];
			const layer = exampleLayering[_nftIndex].find((l) =>
				attribute.name ? l.layer?.includes(attribute.name) : Object.keys(l).length === 0,
			);
			if (!layer) {
				// Ugly hack when the layer name has changed
				return exampleLayering[_nftIndex];
			}
			layers = [...layers, { ...layer, layer: attribute.name }];
		}
		return layers;
	}

	function setExampleLayer(nftIndex, attributeIndex, propertyIndex) {
		const attribute = combined[nftIndex].layers[attributeIndex];
		const layer = attribute.properties[propertyIndex];
		exampleLayering[nftIndex][attributeIndex] = { ...layer, layer: attribute.name };
	}

	function randomizeLayering(nftIndex) {
		exampleLayering[nftIndex] = createExampleLayering(combined[nftIndex], false);
	}

	function randomizeLayer(nftIndex, attributeIndex) {
		const attribute = combined[nftIndex].layers[attributeIndex];
		const randomProperty =
			attribute.properties[Math.floor(Math.random() * attribute.properties.length)];
		exampleLayering[nftIndex][attributeIndex] = { ...randomProperty, layer: attribute.name };
	}

	// NOTE: This is to combine the saved nfts when opening from edit, and the currently editing population...
	// not sure I like the approach but we'll make do.
	$: combined = [nft, ...(collection.nfts?.length ? collection.nfts : [])];

	$: exampleLayering = combined.map(updateLayering);

	// TODO: should probably check the first layer only of each population, assuming that's the background
	$: imgRefs.map((imgRef, index) => {
		if (imgRef && !initialWidths[index]) {
			initialWidths[index] = imgRef.width;
		}
	});
</script>

<CommonNftPreview {standard} {collection} {nft}>
	{#each combined as _nft, _nftIndex}
		<h1>{_nft.name}</h1>
		<!-- TODO: bring back, but need to check that all layers are under x -->
		<!-- {#if initialWidths[_nftIndex] < 200}
			<p class="scaleUp">
				Layers are very small! Should we scale up?
				<Toggle id={`${_nftIndex}`} bind:checked={scaleUp[_nftIndex]} />
			</p>
		{/if} -->
		{#if expanded[_nftIndex]}
			<div class="population">
				{#if exampleLayering[_nftIndex]?.some((layer) => Object.keys(layer).length)}
					<h2>Example layering</h2>
					<div class="exampleLayeringWrapper">
						<PfpLayering
							on:click={() => randomizeLayering(_nftIndex)}
							layers={exampleLayering[_nftIndex]}
							imgStyle={{ minHeight: scaleUp[_nftIndex] && '200px' }}
						>
							<div class="layeringOverlay">
								{#each exampleLayering[_nftIndex] as layer, layerIndex}
									{#if Object.keys(layer).length}
										<p
											on:click|stopPropagation={() => randomizeLayer(_nftIndex, layerIndex)}
											on:keydown
										>
											<span>{layer.layer}:</span>
											{extractNameFromLayerName(layer.name)}
										</p>
									{/if}
								{/each}
							</div>
						</PfpLayering>
					</div>
				{/if}
				{#each _nft.layers as attribute, attributeIndex}
					{#if hasProperties(attribute)}
						<h2>{attribute.name}</h2>
						<div
							id={`${_nftIndex}-${String(attribute.name)}`}
							class="layer"
							class:fullpage={fullpageLayer === `${_nftIndex}-${String(attribute.name)}`}
						>
							{#if fullpageLayer === `${_nftIndex}-${String(attribute.name)}`}
								<div on:click={randomizeLayering} on:keydown>
									<PfpLayering
										layers={exampleLayering[_nftIndex]}
										imgStyle={{ minHeight: scaleUp[_nftIndex] && '200px' }}
									/>
								</div>
							{/if}
							<span
								class="icon"
								role="button"
								on:click={() => toggleLayerFullpage(`${_nftIndex}-${String(attribute.name)}`)}
								on:keydown
							>
								<Icon name="maximize" />
							</span>
							{#each attribute.properties as property, propertyIndex}
								<div
									class="property"
									class:active={exampleLayering[_nftIndex]?.[attributeIndex]?.name ===
										property.name}
									on:click={() => setExampleLayer(_nftIndex, attributeIndex, propertyIndex)}
									on:keydown
								>
									<!-- <div class="closeButton" role="button">
										<CloseButton
											on:click={() => removeProperty(_nftIndex, attributeIndex, propertyIndex)}
										/>
									</div> -->
									<img
										bind:this={imgRefs[_nftIndex]}
										{...scaleUp[_nftIndex] ? { style: 'min-width: 200px' } : {}}
										src={property.file.preview}
										alt={property.file.pinInfo.IpfsHash}
									/>
								</div>
							{/each}
						</div>
					{/if}
				{/each}
			</div>
		{/if}
		<ExpandArrow bind:expanded={expanded[_nftIndex]} />
	{/each}
</CommonNftPreview>

<style>
	h1 {
		font-size: x-large;
	}
	h1,
	h2 {
		color: var(--text-header);
	}

	h2:not(:first-child) {
		margin-top: 40px;
	}

	img {
		object-fit: contain;
		width: 100%;
		max-width: 300px;
	}

	.active {
		filter: brightness(0.9);
		background: var(--background-l0);
	}

	.icon {
		position: absolute;
		top: 10px;
		right: 10px;
		font-size: 1rem;
	}

	.icon:hover {
		cursor: pointer;
		color: var(--icon-action-primary);
	}

	.exampleLayeringWrapper {
		position: relative;
	}

	.layer {
		position: relative;
		display: grid;
		gap: 40px;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		justify-content: center;
		justify-items: center;
		align-items: center;
		max-height: 515px;
		overflow: auto;
		border: 1px solid var(--stroke-secondary);
		border-radius: 2px;
		padding: 20px;
	}

	.layeringOverlay {
		position: absolute;
		top: 0;
		width: 350px;
		height: 100%;
		margin-left: auto;
		display: flex;
		flex-direction: column;
		justify-content: center;
		justify-items: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		font-weight: bold;
	}

	.layeringOverlay p {
		cursor: pointer;
		margin: 0px;
	}

	.layeringOverlay p span {
		color: cornsilk;
	}

	.fullpage {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: var(--background-l0);
		z-index: 1000;
		max-height: unset;
	}

	/* fullpage first element takes upp whole grid row */
	.fullpage > :first-child {
		grid-column: 1 / -1;
	}

	.property {
		position: relative;
	}

	.scaleUp {
		display: flex;
		gap: 20px;
	}

	/* .closeButton {
		display: none;
	}

	.property:hover .closeButton {
		display: block;
	} */
</style>
