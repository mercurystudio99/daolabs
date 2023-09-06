<script lang="ts">
	import { onDestroy, createEventDispatcher } from 'svelte';

	export let threshold = 0;
	export let horizontal = false;
	export let elementScroll: HTMLElement | undefined = undefined;
	export let hasMore = true;
	export let disableBody = true;
	export let bodyAsElement = false;

	const dispatch = createEventDispatcher();
	let isLoadMore = false;
	let component: HTMLElement;

	const onScroll = (e: Event) => {
		let element = e.target;
		if (element === document) {
			element = document.scrollingElement;
		}
		let resolvedElement = element as HTMLElement;
		const offset = horizontal
			? resolvedElement.scrollWidth - resolvedElement.clientWidth - resolvedElement.scrollLeft
			: resolvedElement.scrollHeight - resolvedElement.clientHeight - resolvedElement.scrollTop;
		if (offset <= threshold) {
			if (!isLoadMore && hasMore) {
				dispatch('loadMore');
			}
			isLoadMore = true;
		} else {
			isLoadMore = false;
		}
	};

	$: {
		if (component || elementScroll) {
			let element: HTMLElement | Document;
			if (elementScroll) {
				element = elementScroll;
			} else if (bodyAsElement) {
				element = document;
			} else {
				element = component.parentNode as HTMLElement;
			}
			if (!bodyAsElement && disableBody) {
				document.body.style.overflow = 'hidden';
			}
			element.addEventListener('scroll', onScroll);
			element.addEventListener('resize', onScroll);
		}
	}

	onDestroy(() => {
		if (component || elementScroll) {
			const element = elementScroll ? elementScroll : component.parentNode;
			if (disableBody) {
				document.body.style.overflow = 'unset';
			}
			element.removeEventListener('scroll', null);
			element.removeEventListener('resize', null);
		}
	});
</script>

<div bind:this={component} style="width:0px" />
