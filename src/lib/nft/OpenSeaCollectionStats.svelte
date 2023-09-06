<script lang="ts">
	import { OpenSea } from '$data/opensea';
	import Icon from '$lib/components/Icon';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import OwnersModal from '$lib/nft/OwnersModal.svelte';

	export let contractInfo: any = {};
	export let truncate: boolean = false;

	let collectionStats: any = {};

	async function getStats() {
		collectionStats = await OpenSea.getCollectionStats(contractInfo.collection.slug as string);
		collectionStats = collectionStats.stats;
	}

	function openOwnerList() {
		openModal(bind(OwnersModal, { tokenAddress: contractInfo.address, close }));
	}

	$: {
		if (contractInfo.collection) {
			getStats().catch((e) => console.log(e));
		}
	}
</script>

<div class="stats" style={truncate ? 'justify-content: center ;' : ''}>
	{#if collectionStats?.num_owners}
		<div class="stat" on:click={openOwnerList} on:keydown>
			<Icon name="users" />
			{collectionStats.num_owners} <span>Owners</span>
		</div>
	{/if}
	{#if collectionStats?.total_supply}
		<div class="stat">
			<Icon name="assets" style="width: 18px;" />
			{collectionStats.total_supply} <span>items</span>
		</div>
	{/if}
	{#if collectionStats?.floor_price}
		<div class="stat">
			<Icon name="ethereum" />
			{collectionStats.floor_price} <span>floor price</span>
		</div>
	{/if}
	{#if collectionStats?.total_volume}
		<div class="stat">
			<Icon name="ethereum" />
			{collectionStats.total_volume.toFixed(2)} <span>total volume</span>
		</div>
	{/if}
</div>

<style>
	span {
		color: var(--text-tertiary);
	}

	.stats {
		display: flex;
		flex-direction: row;
		width: 100%;
		gap: 1em;
		margin-top: 1em;
		align-items: center;
		flex-wrap: wrap;
	}

	.stat {
		color: var(--text-action-primary);
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 0.5em;
		text-transform: uppercase;
		margin-right: 1em;
	}
</style>
