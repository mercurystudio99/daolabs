<script lang="ts">
	import { getCollectionPrice, getNftContractAddress } from '$utils/collectionHelpers';
	import { getNftHolders } from '$data/nft';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import OwnersModal from '$lib/nft/OwnersModal.svelte';
	import { browser } from '$app/environment';
	import type { Collection } from '$models/minter/collection-config';
	import type { NftContract, NftHolder } from '$models/subgraph-entities/v2/nft-contract';

	export let collection: Collection;
	export let collectionSupply: number;
	export let collectionStats: NftContract;
	const contractAddress = getNftContractAddress(collection);

	$: price = getCollectionPrice(collection);
	$: totalEarned = collectionStats?.totalSupply * Number(price) || 0;

	let owners: NftHolder[] = [];

	async function getOwners() {
		if (!contractAddress) return;
		const { nftHolders } = await getNftHolders(contractAddress);
		owners = nftHolders;
	}

	function openOwnerList() {
		openModal(
			bind(OwnersModal, {
				tokenAddress: contractAddress,
				close: () => {},
				owners: owners.map((owner) => ({
					count: owner.tokens.length,
					owner: owner.address,
					name: '',
				})),
			}),
		);
	}

	$: browser && void getOwners();
</script>

<div class="stats">
	<div class="box">
		<span class="value">{collectionSupply || 'Unlimited'}</span>
		items
	</div>
	<div class="box" on:click={openOwnerList} on:keydown>
		<span class="value">{owners.length}</span>
		owners
	</div>
	<div class="box">
		<span class="value">{getCollectionPrice(collection)}</span>
		floor price
	</div>
	<div class="box">
		<span class="value">{totalEarned}</span>
		volume traded
	</div>
</div>

<style>
	.stats {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 21px;
	}
	.box {
		background: var(--background-l2);
		box-shadow: var(--background-l1) 10px 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 118px;
		height: 90px;
	}

	.value {
		color: var(--text-header);
		font-size: 16px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 1000px) {
		.box {
			margin-bottom: 21px;
		}
	}

	@media (max-width: 768px) {
		.box {
			margin-bottom: 21px;
		}
	}
</style>
