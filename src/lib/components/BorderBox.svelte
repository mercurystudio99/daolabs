<script>
	export let padding = '2rem';
	export let margin = '10px';

	$: style = `--padding: ${padding}; --margin: ${margin};`;
</script>

<section {style}>
	<slot />
</section>

<style>
	section {
		padding: var(--padding);
		margin-bottom: var(--margin);
		background: var(--background-l2);
		border-radius: var(--radius-xl);
		border: 1px solid var(--stroke-secondary);
		stroke: none;
		color: var(--text-primary);
	}
</style>
