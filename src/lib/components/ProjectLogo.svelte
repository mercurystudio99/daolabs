<script lang="ts">
	import Img from './Img.svelte';

	export let uri: string;
	export let size: number | undefined = 80;
</script>

<div class="project-logo" style={`width: ${size}px; height: ${size}px;`}>
	{#if uri}
		<Img
			src={`${uri}?size=${size}x${size}`}
			placeholder={`https://via.placeholder.com/${size}?text=...`}
			alt="The project logo"
		>
			<div slot="failed" class="no-logo">🏦</div>
		</Img>
	{:else}
		<div class="no-logo">🏦</div>
	{/if}
</div>

<style>
	.project-logo :global(img) {
		min-width: 100%;
		max-height: 100%;
		object-fit: cover;
		object-position: center center;
	}

	.project-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border-radius: var(--radius-lg);
	}

	.no-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		background: var(--background-l1);
		width: 100%;
		height: 100%;
		min-width: 100px;
		min-height: 100px;
	}
</style>
