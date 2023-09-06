<script lang="ts">
	import { objectToStyleString } from '$utils/string';
	import Button from '$lib/components/Button.svelte';
	import InfiniteScroll from './InfiniteScroll.svelte';
	import type * as CSS from 'csstype';

	export let hasMore = false;
	export let loadMore: () => void = null;
	export let loading = false;
	export let maxHeight: CSS.Properties['maxHeight'] = '100%';
	export let ref: HTMLElement = undefined;
	export let styles: CSS.Properties = {};
	export let threshold: number = 100;
</script>

<section
	class="indicateScroll"
	style={`${objectToStyleString(styles)}; max-height: ${maxHeight}`}
	bind:this={ref}
>
	<slot />
	{#if hasMore}
		<Button on:click={loadMore} disabled={loading} {loading} type="secondary" size="sm"
			>Load More</Button
		>
	{/if}

	<InfiniteScroll
		elementScroll={ref}
		{hasMore}
		disableBody={false}
		{threshold}
		on:loadMore={loadMore}
	/>
</section>

<style>
	:global(html.lightmode .indicateScroll) {
		--background-anim-l0: #7d6b488c;
		--background-anim-l1: #e7e3dc8c;
	}
	:global(html.darkmode .indicateScroll) {
		--background-anim-l0: #1c1b218c;
		--background-anim-l1: #2e2b3c8c;
	}

	:global(.indicateScroll button.link) {
		margin: 0 auto;
		display: block;
	}

	/* .loading {
		animation: fade 1s infinite ease-in-out;
	} */

	@keyframes fade {
		from {
			background-color: var(--background-anim-l0);
		}
		to {
			background-color: var(--background-anim-l1);
		}
	}

	section {
		overflow: auto;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	section::-webkit-scrollbar {
		display: none;
	}
</style>
