<script lang="ts">
	import { setContext } from 'svelte';
	import type { TimelinePosition, TimelineConfig } from './types';

	export let position: TimelinePosition = 'right';
	export let style: string = null;

	setContext<TimelineConfig>('TimelineConfig', { rootPosition: position });
</script>

<ul class="timeline" {style}>
	<slot />
</ul>

<style>
	:global(.timeline) {
		--header-color: var(--text-action-primary);
		--active: var(--icon-action-primary);
		--secondary: var(--icon-action-secondary);
		--separator: var(--stroke-tertiary);
		--failed: var(--icon-failure);
	}
	.timeline {
		display: flex;
		flex-direction: column;
		padding: 26px 16px;
		flex-grow: 1;
	}
</style>
