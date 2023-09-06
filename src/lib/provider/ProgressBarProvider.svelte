<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { page } from '$app/stores';

	let progress = 0;

	function handleLinkClick(event: MouseEvent) {
		if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
		let target = <HTMLAnchorElement>event.target;

		const checkATag = () =>
			target && target.tagName !== 'A' && target.tagName !== 'BODY' && target.tagName !== 'HTML';

		while (checkATag()) {
			target = <HTMLAnchorElement>target.parentElement;
		}

		if (
			target &&
			target.tagName === 'A' &&
			target.getAttribute('rel') !== 'external' &&
			!target.getAttribute('target') &&
			$page.url.pathname !== new URL(target.href).pathname &&
			$page.url.origin === new URL(target.href).origin
		) {
			let intervalId: number = 0;
			if (progress === 0)
				intervalId = setInterval(() => {
					progress += 0.1;
					if (progress > 100) {
						clearInterval(intervalId);
						progress = 0;
					}
				}, 25);
			let i = 0;
			const unsub = page.subscribe(() => {
				if (i++) {
					clearInterval(intervalId);
					progress = 0;
					unsub();
				}
			});
		}
	}
</script>

<svelte:window on:click={handleLinkClick} />

{#if progress > 0}
	<div class="progress-bar">
		<ProgressBar percentage={progress} />
	</div>
{/if}

<slot />

<style>
	.progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 4px;
		--color: var(--text-action-primary);
	}
</style>
