<script lang="ts">
	import { selectedCollectionsTab } from '$stores/collectionsForm';
	import { readNetwork } from '$stores/web3';
	import type { CollectionCategory } from '$models/collection-visibility';

	export let type: CollectionCategory;
	export let title: string;

	const handleClick = () => {
		selectedCollectionsTab.set(type);
	};
</script>

<div on:click={handleClick} on:keydown>
	<a
		href="/collections?tab={type}&network={$readNetwork?.alias}"
		class:selected={$selectedCollectionsTab === type}>{title}</a
	>
</div>

<style>
	a {
		text-transform: uppercase;
		cursor: pointer;
		border-bottom: '2px solid';
		padding-bottom: 6px;
		font-weight: 500;
		color: var(--text-secondary);
		border-color: transparent;
	}

	.selected {
		color: var(--text-primary);
		border-color: var(--text-primary);
		font-weight: 600;
		border-bottom: 2px solid var(--text-primary);
	}
</style>
