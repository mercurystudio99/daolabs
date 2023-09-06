<script lang="ts">
	import { onMount } from 'svelte';
	import { objectToStyleString } from '$utils/string';
	import Icon from './Icon';
	import type * as CSS from 'csstype';

	export let alt = '';
	export let failed = false;
	export let src: string;
	export let placeholder: string;
	export let options: {
		root?: any;
		rootMargin?: string;
		threshold?: number;
	} = { root: null, rootMargin: '0px 0px 0px 0px', threshold: 1.0 };

	export let styles: CSS.Properties = {};
	export let overlay = false;

	let imgRef: HTMLImageElement;
	let observer: IntersectionObserver;
	let intersected = false;
	let path: string;
	let loaded = false;
	let isVideo = false;

	function handleError() {
		failed = true;
	}

	function handleLoad() {
		if (!loaded && path === src) {
			loaded = true;
		}
	}

	function handleLegacyDoubleHttps(pathString: string) {
		// If path string starts with /images/ then it's a static path
		// and we don't need to do anything
		if (pathString.startsWith('/images/') || pathString.startsWith('blob')) {
			return pathString;
		}

		// This is a legacy fix for a bug in the old version of the app
		const isHttp = path.startsWith('http://');
		return `http${isHttp ? '' : 's'}://${path.replace(/(https?:?\/\/)*/, '')}`;
	}

	onMount(() => {
		observer = new IntersectionObserver((entries, self) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					isVideo = src.includes('.mp4');
					intersected = true;
					self.unobserve(imgRef);
				}
			});
		}, options);
		observer.observe(imgRef);
		return () => {
			if (observer) {
				observer.unobserve(imgRef);
			}
		};
	});

	$: failed = Boolean(!src);
	$: path = intersected ? src : placeholder;
	$: path = handleLegacyDoubleHttps(path);
</script>

{#if $$slots.failed && failed && !isVideo}
	<slot name="failed" />
{/if}

{#if !$$slots.failed && failed}
	<div class="failed" style={objectToStyleString(styles)}>
		<div class="message">
			<Icon name="404" style="fill: none" />
		</div>
	</div>
{/if}

{#if isVideo}
	<div class="isVideo">Is video</div>
{/if}

<img
	src={path}
	{alt}
	bind:this={imgRef}
	{...$$restProps}
	on:load={handleLoad}
	on:error={handleError}
	style={objectToStyleString(styles)}
	class:no-visible={failed || isVideo}
	class:loading={!intersected && !failed}
	class:overlay
/>
{#if overlay}
	<div class="overlay" style={objectToStyleString(styles)}>
		<slot name="overlay" />
	</div>
{/if}

<style lang="scss">
	img {
		max-width: 100%;
	}
	.isVideo {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 20px;
		background: linear-gradient(0deg, var(--background-l1), var(--background-l2));
	}
	.failed {
		display: flex;
		justify-content: space-between;
		width: 100%;
		height: 100%;
		font-size: 20px;
		background: linear-gradient(0deg, var(--background-l1), var(--background-l2));
	}
	.failed .message {
		margin-left: 2px;
	}
	.visible {
		display: block;
		transition: opacity 0.3s ease-in-out;
	}

	.no-visible {
		display: none;
	}

	.loading {
		animation: fadeIn 3s ease-in-out infinite;
	}

	img.overlay {
		position: relative;
	}

	div.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--background-overlay);
		border-top-left-radius: var(--radius-lg);
		border-top-right-radius: var(--radius-lg);
	}

	@keyframes fadeIn {
		0% {
			opacity: 0.9;
		}
		50% {
			opacity: 0.6;
		}
		100% {
			opacity: 0.9;
		}
	}
</style>
