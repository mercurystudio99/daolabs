<script lang="ts">
	export let title: string;
	export let icon: any = '';
</script>

<div class="radio-group">
	<span class="group-title">
		{title}
		{#if icon}
			<svelte:component this={icon} size="1x" />
		{/if}
	</span>
	<slot />
</div>

<style lang="scss" scoped>
	.group-title {
		color: var(--text-header);
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 15px;
		display: block;
	}

	.radio-group {
		border: 0.4px solid rgba(0, 0, 0, 0.2);
		border-radius: 10px;
		padding: 20px;
		margin: 20px 0;
	}
</style>
