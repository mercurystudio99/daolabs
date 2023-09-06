<script lang="ts">
	import { collectionCategory } from '$models/collection-visibility';
	import CollectionsTab from './CollectionsTab.svelte';
	import type { CollectionCategory } from '$models/collection-visibility';

	const TAB_TYPE_NAMES: { [k in CollectionCategory]: string } = {
		all: 'All',
		trending: 'Trending',
	};
</script>

<nav>
	{#each collectionCategory as category}
		<div class="tab">
			<CollectionsTab type={category} title={TAB_TYPE_NAMES[category]} />
		</div>
	{/each}
</nav>

<style>
	nav {
		display: flex;
		align-items: center;
	}
	.tab {
		font-size: 14px;
		margin: 0px 15px;
	}

	.tab:first-of-type {
		margin-left: 0;
	}

	/* Query */
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		nav {
			width: 100%;
			justify-content: center;
		}
	}
	@media (max-width: 400px) {
		.tab {
			font-size: 12px;
		}
	}
</style>
