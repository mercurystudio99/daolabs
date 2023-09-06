<script lang="ts">
	export let images;
</script>

<section>
	<h2>One character, everyday, for-banana.</h2>
	<div class="gallery">
		{#each images as src}
			<img {src} alt="test" />
		{/each}
	</div>
</section>

<style>
	.gallery {
		display: flex;
		gap: 10px;
		justify-content: center;
	}

	h2 {
		color: var(--text-header);
		text-align: center;
	}

	section {
		background: var(--background-l2);
		padding: 2rem;
	}

	img {
		background-color: var(--background-l1);
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
		max-height: 250px;
	}
</style>
