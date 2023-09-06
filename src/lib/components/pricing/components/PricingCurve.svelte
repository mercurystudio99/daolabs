<script lang="ts">
	import CurveGraph from '$lib/components/CurveGraph.svelte';
	import Expandable from '$lib/components/Expandable.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Range from '$lib/components/Range.svelte';

	// Export variables
	export let rangeValue;
	export let price;
	export let currency;
</script>

<div class="curve">
	<Expandable titleColor="var(--text-header)">
		<div slot="title" class="expandable-title">
			<PopInfo message="Tooltip text">Price curve</PopInfo>
		</div>
		<Range bind:values={rangeValue} step={0.5} />
		{#key price}
			<!-- TODO set maxX and maxY depending on supply -->
			<div class="container">
				<CurveGraph xLable="Revenue {currency}" yLable="# of NFTs redeemed" rate={rangeValue[0]} />
			</div>
		{/key}
	</Expandable>
</div>

<style lang="scss">
	.expandable-title {
		color: var(--text-header);
		margin-bottom: 8px;
	}
	.curve {
		margin-bottom: 16px;
	}
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
	}
</style>
