<script lang="ts">
	import { fade } from 'svelte/transition';
	import { objectToStyleString } from '$utils/string';
	import Img from '$lib/components/Img.svelte';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import type * as CSS from 'csstype';
	import type { PfpProperty } from '$models/minter/nft-config';

	export let layers: PfpProperty[];
	export let style: CSS.Properties = {};
	export let imgStyle: CSS.Properties = {};

	let showSlot = false;

	// TODO: identify *which* layer has been clicked on
	// inspired by: https://jsfiddle.net/ey1d5vgr/
	// let imgData;
	// let width = 600;
	// let height = 400;

	// function onClick(ev) {
	//   if (!imgData) {
	//     initCanvas();
	//   }
	//   const mask = document.getElementById("mask");
	//   const imgPos = mask.offset();
	//   const mousePos = { x: ev.pageX - imgPos.left, y: ev.pageY - imgPos.top };
	//   const pixelPos = 4 * (mousePos.x + width * mousePos.y);
	//   const alpha = imgData.data[pixelPos + 3];

	//   const opacity = ((100 * alpha) / 255) << 0;
	//   if (opacity > 0.1) {
	//     console.log("Opacity = " + opacity + "%");
	//   }
	// }

	// function initCanvas() {
	//   const canvas = document.createElement("canvas");
	//   canvas.width = width;
	//   canvas.height = height;
	//   const ctx = canvas.getContext("2d");

	//   const img = document.getElementById("mask");

	//   ctx.drawImage(img, 0, 0);
	//   imgData = ctx.getImageData(0, 0, width, height);
	//   // Need to replace the image with the canvas
	//   img.parentNode.replaceChild(canvas, img);
	// }
</script>

<div
	on:click
	class="layering"
	style={style && objectToStyleString(style)}
	on:mouseenter={() => (showSlot = true)}
	on:mouseleave={() => (showSlot = false)}
	on:keydown
	out:fade
>
	{#each layers as layer}
		{#if layer.file}
			<Img
				class="layer"
				src={replaceIpfsDomain(layer.file.preview)}
				styles={{ position: 'absolute', maxHeight: '100%', ...imgStyle }}
				alt="A layer"
				placeholder="https://via.placeholder.com/300?text=..."
			>
				<div
					slot="failed"
					style={objectToStyleString({
						position: 'absolute',
					})}
				>
					<p>404 layer.</p>
				</div>
			</Img>
		{/if}
	{/each}
	{#if showSlot}
		<slot />
	{/if}
</div>

<style>
	.layering {
		position: relative;
		height: 350px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	div[slot='failed'] {
		font-size: 8px;
		bottom: 0;
	}
</style>
