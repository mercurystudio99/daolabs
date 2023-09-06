<script lang="ts">
	import Icon from '$lib/components/Icon';
	import { currentPageNumber } from '$stores';

	export let list: any[] = [];
	export let pageSize = 10;

	let listSlice = [];

	$: maxPages = Math.ceil(list.length / 10);
	$: listSlice = list.slice($currentPageNumber * pageSize, ($currentPageNumber + 1) * pageSize);

	const turnPage = (index: number) => {
		const nextPage = $currentPageNumber + index;
		if (nextPage >= 0 && nextPage < maxPages) {
			currentPageNumber.set(nextPage);
		}
	};
</script>

<slot name="content" {listSlice} />

{#if maxPages > 1}
	<div class="controls">
		<div class="chevron" on:click={() => turnPage(-1)} on:keydown>
			<Icon name="chevronLeft" />
		</div>
		<span>Page {$currentPageNumber + 1} of {maxPages}</span>
		<div class="chevron" on:click={() => turnPage(1)} on:keydown>
			<Icon name="chevronRight" />
		</div>
	</div>
{/if}

<style lang="scss">
	.controls {
		display: flex;
		gap: 16px;
		font-weight: 300;
		color: var(--text-secondary);
		justify-content: center;
		margin-top: 16px;
		align-items: center;

		.chevron {
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			font-size: 16px;
			color: var(--text-over-action-primary);
			background-color: var(--background-l3);
			cursor: pointer;
		}
	}

	:global(.chevron svg) {
		stroke: var(--accent);
	}
</style>
