<script lang="ts">
	import { formattedNum } from '$utils/formatNumber';
	import Ethereum from '$lib/components/Ethereum.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import NftCollectionLogo from '$lib/components/NftCollectionLogo.svelte';
	import AssetCard from './AssetCard.svelte';
	import type { Collection } from './types';
	import type { IFloorPrice } from './interfaces/IFloorPrice';

	export let data: Collection;
	export let floorPrice: IFloorPrice;
</script>

{#if data.name}
	<div class="title">
		<div class="left">
			{#if data.logo}
				<img src={data.logo} alt="Group logo" />
			{:else}
				<NftCollectionLogo collectionName={data.name} />
			{/if}
			<p>{data.name}</p>
		</div>
		<div class="action">
			{#if !floorPrice}
				<Skeleton height="15px" width="100px" />
			{:else}
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
	<div class="group">
		{#each data.nfts as nft}
			<AssetCard {nft} {data} {floorPrice} />
		{/each}
	</div>
{/if}

<style>
	img {
		width: 40px;
		height: 40px;
		margin-left: 10px;
		margin-right: 10px;
	}

	.action {
		color: var(--text-action-primary);
	}

	.title {
		display: flex;
		align-items: center;
		margin-top: 2em;
		max-width: 400px;
		justify-content: space-between;
	}

	.title .left {
		display: flex;
		align-items: center;
	}

	.title p {
		margin: 0;
		color: var(--text-tertiary);
	}

	.group {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		margin-top: 10px;
	}

	.numberItems {
		margin-left: 2rem;
	}
</style>
