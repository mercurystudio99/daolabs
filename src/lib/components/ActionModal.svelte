<script lang="ts">
	/**
	 * Creates a modal with a primary colour header and a
	 * footer with items floated right.
	 */
	export let title: string;
	export let width: string = '450px';
</script>

<main style={`max-width: ${width}`}>
	<h3>
		{title}
	</h3>
	<slot />
	<footer>
		<slot name="footer" />
	</footer>
</main>

<style>
	h3 {
		color: var(--text-header);
		margin-bottom: 40px;
	}
	footer {
		margin-top: 40px;
		display: flex;
		justify-content: flex-end;
	}
</style>
