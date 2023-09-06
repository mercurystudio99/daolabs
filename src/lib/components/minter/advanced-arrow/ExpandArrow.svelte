<script lang="ts">
	import Icon from '$lib/components/Icon';

	export let expanded: boolean;
</script>

<div class="advanced-arrow">
	<div class="advanced-icon" on:click={() => (expanded = !expanded)} on:keydown>
		{#if expanded}
			<Icon name="chevronUp" />
		{:else}
			<Icon name="chevronDown" />
		{/if}
	</div>
</div>

<style lang="scss">
	.advanced-arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
		border-bottom: 1px solid var(--stroke-tertiary);
		padding-bottom: 16px;

		.advanced-icon {
			background-color: var(--stroke-secondary);
			border-radius: 50px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
			cursor: pointer;
			font-size: 16px;
		}
	}
</style>
