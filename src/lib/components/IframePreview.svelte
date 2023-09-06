<script lang="ts">
	import Icon from '$lib/components/Icon';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { objectToStyleString } from '$utils/string';
	import IframeViewer from './IframeViewer.svelte';
	import type * as CSS from 'csstype';

	export let src: string | undefined = undefined;
	export let style: CSS.Properties = {};
	export let iframeStyle: CSS.Properties = {};
	export let title: string = 'An iframe element';

	let displayViewer = false;
	let failed = false;
	let loading = true;

	function displayPreview() {
		displayViewer = true;
	}

	function error() {
		failed = true;
		loading = false;
	}

	function success() {
		loading = false;
	}
</script>

<div style={style && objectToStyleString(style)}>
	{#if loading}
		<Skeleton style={objectToStyleString(iframeStyle)} />
	{/if}
	<iframe
		class:hidden={loading}
		{src}
		{title}
		style={objectToStyleString(iframeStyle)}
		on:load={success}
		on:error={error}
	/>
	{#if !failed}
		<div class="topRight" on:click={displayPreview} on:keypress={displayPreview}>
			<Icon name="maximize" />
		</div>
	{/if}
</div>
{#if displayViewer}
	<IframeViewer {src} {title} close={() => (displayViewer = false)} />
{/if}

<style lang="scss">
	iframe {
		width: 100%;
		height: 500px;
		border-radius: 20px;
		border: none;
	}

	div {
		position: relative;

		.topRight {
			position: absolute;
			border-radius: 20px;
			top: 10px;
			right: 16px;
			color: var(--text-over-brand-primary);
			background: #00000080;
			cursor: pointer;
			opacity: 0.15;
			transition: opacity 0.3s;
			font-size: 20px;
			line-height: 1;
			padding: 2px;
			display: flex;
			align-items: center;
			&:hover {
				opacity: 1;
			}
		}
	}

	.hidden {
		display: none;
	}
</style>
