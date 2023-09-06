<script lang="ts">
	import Icon from '$lib/components/Icon';

	export let advancedMode: boolean;
	export let id = '';
	export let onChange = null;

	const expand = () => {
		advancedMode = !advancedMode;
		if (onChange) {
			onChange(advancedMode);
		}
	};
</script>

<div class="advanced-arrow">
	<div class="advanced-icon" on:click={expand} {id} on:keydown>
		{#if advancedMode}
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
		border-top: 1px solid var(--stroke-secondary);
		padding-top: 16px;
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
