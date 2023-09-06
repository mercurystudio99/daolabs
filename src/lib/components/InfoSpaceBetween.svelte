<script>
	export let stack = false;
</script>

<!-- Provided two elements, place them with as much space inbetween as the parent allows
Seen in the preview of jb for "In Juicebox..."
-->
<section on:click class:stack on:keydown>
	<slot name="left" />
	<slot name="right" />
</section>

<style>
	section {
		display: flex;
		justify-content: space-between;
	}

	.stack {
		flex-direction: column;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 350px) {
		section {
			flex-direction: column;
		}
	}
</style>
