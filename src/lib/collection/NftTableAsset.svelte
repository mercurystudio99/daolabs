<script lang="ts">
	import Icon from '$lib/components/Icon';
	import Img from '$lib/components/Img.svelte';

	export let background: string | string[] = 'var(--background-l1)';
	export let name: string;
	export let src: string = '';

	function getNftBackgroundColor(): string {
		if (Array.isArray(background)) {
			return background[Math.floor(Math.random() * background.length)];
		}
		return background;
	}
</script>

<div
	class="preview-container"
	on:click
	style="background-color: {getNftBackgroundColor()};"
	on:keydown
>
	{#if $$slots.default}
		<slot />
	{:else if src}
		<Img
			{src}
			placeholder="https://via.placeholder.com/200?text=..."
			styles={{
				maxWidth: '100%',
				maxHeight: '100%',
				objectFit: 'contain',
			}}
		/>
	{:else}
		<Icon name="missingImage" viewBox="0 0 18 16" />
	{/if}
	<div class="overlay">
		{name}
	</div>
</div>

<style>
	.preview-container {
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 300;
		font-size: 28px;
		color: rgba(245, 163, 18, 0.24);
	}

	.preview-container:hover .overlay {
		visibility: visible;
	}

	.overlay {
		visibility: hidden;
		background-color: rgba(0, 0, 0, 0.5);
		font-size: 14px;
		color: var(--text-over-brand-primary);
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		top: 0;
	}
</style>
