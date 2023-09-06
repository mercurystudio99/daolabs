<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unsafe-assignment */
	/* eslint-disable @typescript-eslint/no-unsafe-call */
	import { formattedNum } from '$utils/formatNumber';
	import Ethereum from '$lib/components/Ethereum.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import AggregatedGroup from './AggregatedGroup.svelte';
	import AssetCard from './AssetCard.svelte';
	import Filters from './Filters.svelte';
	import Group from './Group.svelte';
	import { groupByCollection } from './utils';
	import { fetchNfts } from './services';
	import type { Collection, FloorPrice, Sorting, View } from './types';
	import type { IFloorPrice } from './interfaces/IFloorPrice';

	export let address: string;
	export let setTotalNftValue: (val: number) => void;

	let sorting: Sorting = 'Minted descend';
	// let filter: Filter = 'collection';
	let view: View = 'list';
	let large = false;

	let data: Collection[] = [];
	let endCursor: string = null;
	let errorMessage: string = '';
	let hasNextPage: boolean = true;
	let floorPrice: FloorPrice = {};
	let loading = false;
	let totalValue = 0;

	function setFloorPrice(contractAddress: string, price: IFloorPrice) {
		floorPrice = {
			...floorPrice,
			[contractAddress]: { ...price },
		};
	}

	function setTotalValue(value: number) {
		totalValue += value;
	}

	function clearErrorMessage() {
		errorMessage = '';
	}

	function resetCurrentQuery() {}

	async function getNfts(ownerAddress: string, _endCursor: string) {
		if (!ownerAddress) return;
		if (loading) return;
		loading = true;
		try {
			const response = await fetchNfts(ownerAddress, _endCursor);
			if (response.pageKey) {
				endCursor = response.pageKey;
				hasNextPage = true;
			} else {
				endCursor = '';
				hasNextPage = false;
			}
			const moreData = groupByCollection(response, data);

			moreData.forEach((collection) => {
				if (
					collection?.contractMetadata &&
					collection?.contractMetadata.openSea &&
					collection?.contractMetadata?.openSea?.floorPrice
				) {
					setFloorPrice(String(collection.contract.address), {
						floorPrice: collection?.contractMetadata?.openSea?.floorPrice || 0,
					});
					setTotalValue(
						collection.nfts.length * Number(collection?.contractMetadata?.openSea?.floorPrice),
					);
				}
			});
			data = data.concat(moreData);
			setTotalNftValue(totalValue);
			loading = false;
		} catch (e) {
			console.error('Fetch', e);
			errorMessage = 'There seems to be an issue, try again?';
			endCursor = null;
			resetCurrentQuery();
			loading = false;
			return;
		}
	}

	async function getMoreNfts(e?: any) {
		clearErrorMessage();
		await getNfts(address, endCursor);
	}

	$: {
		if (address) {
			data = [];
			endCursor = '';
			clearErrorMessage();
			void getMoreNfts();
		}
	}

	$: {
		if (sorting.startsWith('Minted')) {
			if (sorting === 'Minted descend') {
				data = data.sort(
					(a, b) => new Date(b.timeLastUpdated).getTime() - new Date(a.timeLastUpdated).getTime(),
				);
			} else {
				data = data.sort(
					(a, b) => new Date(a.timeLastUpdated).getTime() - new Date(b.timeLastUpdated).getTime(),
				);
			}
		}
	}

	$: {
		if (sorting.startsWith('Price')) {
			if (sorting === 'Price ascend') {
				data = data.sort((a, b) => {
					return a.contractMetadata.openSea.floorPrice - b.contractMetadata.openSea.floorPrice;
				});
			} else {
				data = data.sort((a, b) => {
					return b.contractMetadata.openSea.floorPrice - a.contractMetadata.openSea.floorPrice;
				});
			}
		}
	}
</script>

<section>
	<br />
	<div class="totalFloorPrice">
		<p class="valueLabel">
			<PopInfo
				message="The floor price is the lowest price that an NFT can be sold for, if you have many NFTs you may need to scroll down to load more."
			>
				Total value by floor price (<i>of loaded NFTs</i>)
			</PopInfo>
		</p>
		<h1><Ethereum /> {formattedNum(totalValue, { precision: 4 })}</h1>
	</div>
	<!-- <Filters bind:sorting bind:filter bind:view bind:large /> -->
	<Filters bind:sorting bind:view bind:large />

	<div class:aggregatedGroup={view === 'group' && !large} class:list={view === 'list'}>
		{#if data}
			{#each data as collection}
				{#if view === 'group'}
					{#if large}
						<Group data={collection} floorPrice={floorPrice[collection.contract.address]} />
					{:else}
						<AggregatedGroup
							data={collection}
							floorPrice={floorPrice[collection.contract.address]}
						/>
					{/if}
				{:else}
					{#each collection.nfts as nft}
						<AssetCard
							{nft}
							floorPrice={floorPrice[collection.contract.address]}
							small={!large}
							square
							showCollectionName
						/>
					{/each}
				{/if}
			{/each}
		{/if}
	</div>

	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
	<InfiniteScroll bodyAsElement threshold={80} hasMore={hasNextPage} on:loadMore={getMoreNfts} />
	{#if loading}
		<br />
		<Loading />
	{/if}
</section>

<style>
	section {
		margin-bottom: 4rem;
	}
	.aggregatedGroup {
		margin-top: 2em;
		display: grid;
		grid-column-gap: 12px;
		grid-row-gap: 4px;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
	}

	:global(.center button.link) {
		display: block;
		margin: 0 auto;
	}

	.list {
		margin-top: 2em;
		display: flex;
		flex-wrap: wrap;
		gap: 18px;
		justify-content: center;
	}

	.totalFloorPrice {
		margin-top: 2em;
		display: flex;
		align-items: center;
		max-width: 500px;
		justify-content: space-between;
	}
	.valueLabel {
		color: var(--text-tertiary);
		text-transform: uppercase;
		font-size: 12px;
	}

	@media (max-width: 400px) {
		.totalFloorPrice {
			flex-direction: column;
		}
	}
</style>
