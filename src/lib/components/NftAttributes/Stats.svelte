<script lang="ts">
	import { objectToStyleString } from '$utils/string';
	import type * as CSS from 'csstype';
	export let stats: Attributes.Stat[] = [];

	export let styles: CSS.Properties = {};
</script>

<div class="details-container" style={objectToStyleString(styles)}>
	{#each stats as stat}
		<p>
			<span>{stat.label}</span>
			{#if stat.max}
				<span>{stat.value} of {stat.max}</span>
			{:else}
				<span>{stat.value}</span>
			{/if}
		</p>
	{/each}
</div>

<style>
	.details-container {
		display: flex;
		flex-direction: column;
		color: var(--text-tertiary);
	}

	p {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	p:last-child {
		margin-bottom: 0;
	}
</style>
