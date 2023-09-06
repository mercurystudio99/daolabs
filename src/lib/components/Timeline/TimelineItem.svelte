<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import type { TimelinePosition, ParentPosition, TimelineConfig } from './types';

	export let position: ParentPosition | null = null;
	export let style: string = null;

	const config = getContext<TimelineConfig>('TimelineConfig');
	const itemPosition = position || config.rootPosition;
	setContext<TimelinePosition>('ParentPosition', itemPosition);
</script>

<li class={`timeline-item ${itemPosition}`} {style}>
	<slot />
</li>

<style>
	:global(.alternate:nth-of-type(even) > .timeline-content) {
		text-align: right;
	}

	:global(.alternate:nth-of-type(odd) > .timeline-opposite-content) {
		text-align: right;
	}

	.opposite-block {
		flex: 1;
		margin: 6px 16px;
	}

	.timeline-item {
		list-style: none;
		display: flex;
		position: relative;
		min-height: 120px;
	}
	:global(.timeline-item:last-of-type) {
		min-height: 60px;
	}

	.left {
		flex-direction: row-reverse;
	}

	.right {
		flex-direction: row;
	}

	.alternate:nth-of-type(even) {
		flex-direction: row-reverse;
	}

	.alternate:nth-of-type(odd) {
		flex-direction: row;
	}
</style>
