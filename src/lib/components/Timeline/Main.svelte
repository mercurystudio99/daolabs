<script lang="ts">
	import Timeline from './Timeline.svelte';
	import TimelineItem from './TimelineItem.svelte';
	import TimelineSeparator from './TimelineSeparator.svelte';
	import TimelineDot from './TimelineDot.svelte';
	import TimelineConnector from './TimelineConnector.svelte';
	import TimelineContent from './TimelineContent.svelte';
	import type { Step } from './types';

	export let steps: Step[] = [];
	export let activeIndex = 0;
	export let errored = false;
</script>

<Timeline>
	{#each steps as step, index}
		{@const isLast = index === steps.length - 1}
		{@const done = index < activeIndex}
		{@const next = index === activeIndex}
		<TimelineItem>
			<TimelineSeparator>
				<TimelineDot active={done} {next} {errored} />
				{#if !isLast}
					<TimelineConnector active={done} />
				{/if}
			</TimelineSeparator>
			<TimelineContent>
				<slot {step} current={index} {done} />
			</TimelineContent>
		</TimelineItem>
	{/each}
</Timeline>
