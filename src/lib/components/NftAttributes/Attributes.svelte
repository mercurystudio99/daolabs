<script lang="ts">
	import { objectToStyleString } from '$utils/string';
	import type * as CSS from 'csstype';

	export let attributes: Attributes.Property[];
	export let styles: CSS.Properties = {
		columnGap: '28px',
		rowGap: '16px',
	};
</script>

<div class="attribute-container" style={objectToStyleString(styles)}>
	{#each attributes as attribute}
		<div class="attribute">
			<span class="name">{attribute.label}</span>
			<span class="value">{attribute.value}</span>
			{#if attribute.rarity}
				<span class="rarity">{attribute.rarity} have this trait</span>
			{/if}
		</div>
	{/each}
</div>

<style>
	.attribute-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, 160px);
		column-gap: 28px;
		row-gap: 16px;
		align-self: center;
		width: 100%;
	}

	.attribute {
		width: 100%;
		background: var(--background-l0);
		border: 1px solid var(--stroke-secondary);
		padding: 10px;
		display: flex;
		flex-direction: column;
	}

	.name {
		font-size: 11px;
		color: #7fcec9;
	}
	.value {
		font-size: 14px;
		line-height: 24px;
		word-break: break-word;
	}
	.rarity {
		font-size: 11px;
		line-height: 24px;
		color: var(--text-secondary);
	}
</style>
