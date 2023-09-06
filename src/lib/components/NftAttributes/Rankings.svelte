<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	export let rankings: Attributes.Ranking[] = [];
</script>

<div class="details-container">
	{#each rankings as ranking}
		<p class="level-label">
			<span>{ranking.label}</span>
			<span>{ranking.value} of {ranking.max}</span>
		</p>
		<div class="progress-bar">
			<ProgressBar percentage={(Number(ranking.value) / Number(ranking.max)) * 100} />
		</div>
	{/each}
</div>

<style>
	.details-container {
		display: flex;
		flex-direction: column;
		color: var(--text-tertiary);
	}

	.level-label {
		margin-top: 4px;
		margin-bottom: 4px;
	}

	.progress-bar {
		height: 16px;
		--color: #7fcec9;
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
