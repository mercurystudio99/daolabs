<script lang="ts">
	import { formattedNum } from '$utils/formatNumber';
	import Ethereum from '$lib/components/Ethereum.svelte';
	import type { Collection } from './types';
	import type { IFloorPrice } from './interfaces/IFloorPrice';

	export let data: Collection;
	export let floorPrice: IFloorPrice;
</script>

<div class="card">
	<div class="left">
		{#if data.logo}
			<img src={data.logo} alt="Group logo" />
		{/if}
		<p>{data.name}</p>
	</div>
	<div class="action">
		{#if floorPrice}
			{@const holdings = floorPrice.floorPrice * data.nfts.length}
			{#if holdings > 0}
				<Ethereum />{formattedNum(holdings, { precision: 4 })}
			{/if}
		{/if}
	</div>
	<div class="numberItems">
		<p>{data.nfts.length} item{data.nfts.length > 1 ? 's' : ''}</p>
	</div>
</div>

<style>
	img {
		width: 40px;
		height: 40px;
		margin-left: 5px;
		margin-right: 10px;
	}

	.card {
		display: flex;
		align-items: center;
		margin-top: 0.5em;
		justify-content: space-between;
		border: 1px solid var(--stroke-tertiary);
		padding: 4px;
	}

	.card p {
		margin: 0;
	}

	.left {
		display: flex;
		align-items: center;
	}

	.action {
		color: var(--text-action-primary);
	}

	.numberItems {
		color: var(--text-tertiary);
	}
</style>
