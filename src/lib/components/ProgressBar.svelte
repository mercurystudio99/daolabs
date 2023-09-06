<script lang="ts">
	export let percentage = 0;

	$: style = `--percentage: ${percentage}%;`;
</script>

<div class="progress-bar" {style} />

<style lang="scss">
	.progress-bar {
		width: 100%;
		height: 100%;
		border: 0.4px solid var(--stroke-secondary);
		background: linear-gradient(
			90deg,
			var(--color) 0 var(--percentage),
			transparent var(--percentage)
		);
	}
</style>
