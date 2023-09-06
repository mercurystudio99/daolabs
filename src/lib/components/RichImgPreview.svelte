<script lang="ts" context="module">
	export const supportedContentTypes: string[] = [
		'image/jpeg',
		'image/jpg',
		'image/gif',
		'image/png',
		'image/svg',
		'image/svg+xml',
		'image/webp',
	];
	export async function getContentType(url: string): Promise<string> {
		const headers = url.includes(String(import.meta.env.VITE_FIREBASE_FUNCTIONS_URL))
			? { apiKey: String(import.meta.env.VITE_API_KEY) }
			: {};
		const controller = new AbortController();
		return fetch(url, {
			headers,
			signal: controller.signal,
		})
			.then((res) => {
				controller.abort();
				return res.headers.get('content-type');
			})
			.catch(() => '');
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import { objectToStyleString } from '$utils/string';
	import Icon from '$lib/components/Icon';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import Img from './Img.svelte';
	import ImageViewer from './ImageViewer.svelte';

	import type * as CSS from 'csstype';

	export let alt: string = 'Payment memo';
	export let src: string | undefined = undefined;
	export let width: CSS.Properties['width'] | undefined = undefined;
	export let height: CSS.Properties['height'] | undefined = undefined;
	export let style: CSS.Properties = {};
	export let imgStyle: CSS.Properties = {};
	export let contentType: string | undefined = undefined;

	const w = width ?? '100px';
	const h = height ?? '100px';

	let displayViewer = false;
	let failed = false;

	function success() {
		failed = false;
	}

	function error() {
		failed = true;
	}

	function generateSizeImage() {
		const H = h.toString().includes('%') ? null : h.toString().replace('px', '');
		const W = w.toString().includes('%') ? null : w.toString().replace('px', '');
		if (H && W) {
			return `${W}x${H}`;
		}
	}

	onMount(() => {
		src = replaceIpfsDomain(src, generateSizeImage());
		if (src.startsWith('https://')) {
			success();
		}
		// Check if tile and add animate query param if so
		const isTile = src?.includes('tiles/render/svg');
		if (isTile) {
			src += '?animate';
		}
	});

	$: placeholderWidth = w.toString().includes('%') ? '500' : (w as string).replace('px', '');
</script>

<div style={style && objectToStyleString(style)}>
	{#if ['image/svg+xml', 'image/svg'].includes(contentType)}
		<object
			title="An SVG element"
			data={src}
			type={contentType}
			on:load={success}
			on:error={error}
			style={objectToStyleString({
				width: w,
				height: h,
				maxWidth: w,
				maxHeight: h,
			})}
			{alt}
		/>
	{:else}
		<Img
			{src}
			bind:failed
			on:load={success}
			on:error={error}
			styles={{
				maxWidth: w,
				maxHeight: h,
				...imgStyle,
			}}
			{alt}
			placeholder="https://via.placeholder.com/{placeholderWidth}?text=..."
		/>
	{/if}
	{#if !failed}
		<div
			class="overlay"
			on:click={() => (displayViewer = true)}
			on:keypress={() => (displayViewer = true)}
			style={objectToStyleString(imgStyle)}
		>
			<span>
				<Icon name="eye" />
				Preview
			</span>
		</div>
	{/if}
</div>
{#if displayViewer}
	<ImageViewer {src} close={() => (displayViewer = false)} type={contentType} />
{/if}

<style lang="scss">
	div {
		position: relative;
		width: fit-content;

		.overlay {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--text-over-brand-primary);
			background: #00000080;
			cursor: pointer;
			opacity: 0;
			transition: opacity 0.3s;
			width: 100%;

			&:hover {
				opacity: 1;
			}
			span {
				display: flex;
				gap: 4px;
				align-items: center;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}
	}
</style>
