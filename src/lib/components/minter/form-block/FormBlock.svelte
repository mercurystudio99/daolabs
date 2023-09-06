<script lang="ts">
	import PopInfo from '$lib/components/PopInfo.svelte';

	export let title = '';
	export let info: string = '';
	export let borderRadius = '10px';

	$: style = `--radius: ${borderRadius}`;
</script>

<div class="container" {style}>
	{#if title}
		<span class="title">
			{title}
			{#if info}
				<PopInfo message={info} placement="bottom" />
			{/if}
		</span>
	{/if}
	<slot />
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		border: 0.4px solid rgba(0, 0, 0, 0.2);
		border-radius: var(--radius);
		padding: 16px;
		margin-bottom: 24px;

		.title {
			margin-left: 2px;
			margin-bottom: 10px;
			color: var(--text-header);
			font-size: 14px;
			font-weight: 500;
			display: flex;
		}
	}
</style>
