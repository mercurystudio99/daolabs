<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';

	export let open = false;
	export let duration = 0.2;
	export let placement = 'right';
	export let size: string = null;

	let mounted = false;
	const dispatch = createEventDispatcher();

	$: style = `--duration: ${duration}s; --size: ${size};`;

	function scrollLock(isOpen: boolean) {
		if (mounted) {
			const body = document.querySelector('body');
			body.style.overflow = isOpen ? 'hidden' : 'auto';
		}
	}

	$: scrollLock(open);
	function handleClickAway() {
		dispatch('clickAway');
	}

	onMount(() => {
		mounted = true;
		scrollLock(open);
	});
</script>

{#if open}
	<aside class="drawer" class:open {style}>
		<div class="overlay" on:click={handleClickAway} on:keydown />
		<div class="panel {placement}" class:size in:fly={{ x: 120 }} out:fly={{ x: 120 }}>
			<slot />
		</div>
	</aside>
{/if}

<style lang="scss" scoped>
	@import './drawer.scss';
</style>
