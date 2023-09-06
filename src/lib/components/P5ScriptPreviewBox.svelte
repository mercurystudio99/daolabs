<script lang="ts">
	import Skeleton from '$lib/components/Skeleton.svelte';

	export let iframeRef: HTMLIFrameElement = null;
	export let script: string;
	export let width = 450;
	export let height = 450;

	let tried = 0;

	let loading = true;

	let iframeDocumentStyles = `
	::-webkit-scrollbar {
		width: 8px; /* Mostly for vertical scrollbars */
		height: 8px; /* Mostly for horizontal scrollbars */
	}
	::-webkit-scrollbar-thumb {
		/* Foreground */
		background: #00000055;
	}
	::-webkit-scrollbar-track {
		/* Background */
		background: #e7e3dc;
	}
	`;

	function onIframeLoad(e: Event) {
		/**
		 * Set scroll-bars to center the iframe.
		 * Resets height and width depending on canvas.
		 * NOTE: don't remove the unneeded event argument above.
		 */
		const main = iframeRef?.contentDocument?.querySelector('main');
		if (!main) {
			if (tried > 9) {
				return;
			}
			tried += 1;
			setTimeout(() => onIframeLoad(e), tried * 100);
		}
		if (main) {
			let canvasStyles = '';

			const canvas = main.querySelector('canvas');
			const potentialMaxHeight = canvas.scrollHeight;
			const potentialMaxWidth = canvas.scrollWidth;

			width = Math.min(width, window.innerWidth - 100);
			height = Math.min(height, window.innerHeight - 100);

			const aspectRatio = potentialMaxWidth / potentialMaxHeight;

			if (aspectRatio > 1) {
				iframeRef.style.width = `${width + 2}px`;
				const newHeight = width / aspectRatio;
				iframeRef.style.height = `${newHeight + 2}px`;
				canvasStyles = `
					width: ${width}px !important; 
					height: auto !important;
				`;
			} else {
				iframeRef.style.height = `${height + 2}px`;
				const newWidth = height * aspectRatio;
				iframeRef.style.width = `${newWidth + 2}px`;
				canvasStyles = `
					width: auto !important;
					height: ${height}px !important;
				`;
			}

			iframeDocumentStyles += `
				canvas {
					${canvasStyles}
					margin: 0 auto;
					display: block;
				}
			`;

			const style = iframeRef.contentDocument.createElement('style');
			style.innerHTML = iframeDocumentStyles;
			iframeRef.contentDocument.head.appendChild(style);
			loading = false;
		}
	}
</script>

{#if loading}
	<div class="loading">
		<Skeleton width="{width}px" height="{height}px" />
	</div>
{/if}
<iframe
	frameborder="0"
	on:load={onIframeLoad}
	bind:this={iframeRef}
	title="p5.js preview"
	srcdoc={script}
	class:hidden={loading}
/>

<style lang="scss">
	iframe {
		width: 100%;
		height: 100%;
		border: 1px solid var(--stroke-tertiary);
		margin: 0 auto;
		display: block;
	}

	.hidden {
		visibility: hidden;
	}

	.loading {
		width: 100%;
	}

	.loading > :global(span) {
		margin: 0 auto;
		display: block;
	}
</style>
