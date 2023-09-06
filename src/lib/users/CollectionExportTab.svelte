<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import { exportCollectionConfig } from '$lib/utils/exportConfig';

	import type { Collection } from '$models/minter/collection-config';

	export let collection: Collection;
</script>

<HeavyBorderBox>
	<div class="box">
		<h4>Export collection configuration</h4>
		<p>Download collection configuration</p>
		<Button type="secondary" size="md" on:click={() => exportCollectionConfig(collection)}>
			Export
		</Button>
	</div>
</HeavyBorderBox>

<style lang="scss">
	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;

		h4 {
			font-size: 16px;
			font-weight: 400;
			color: var(--text-header);
			margin-bottom: 0;
		}
		p {
			font-weight: 400;
			color: var(--text-secondary);
			margin-bottom: 0;
		}
	}
</style>
