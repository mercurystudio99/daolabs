<script lang="ts">
	import CollectionCard from '$lib/components/CollectionCard.svelte';
	import Icon from '$lib/components/Icon';
	import Pagination from '$lib/components/Pagination.svelte';
	import { connectedAccount } from '$stores/web3';
	import { currentPageNumber } from '$stores';
	import { goto } from '$app/navigation';
	import type { Collection } from '$models/minter/collection-config';

	export let collections: Collection[];
	export let deleteCollection: (index: number, page: number) => void;
	export let userAddress = '';
	const exampleCollection: Collection = {
		id: '',
		name: 'Example Collection',
		creator: '0x0000000000000000000000000000000000000000',
		network: 'mainnet',
		description: 'This is example collection description',
		symbol: 'ETH',
		banner: '',
		mintStart: 0,
		mintEnd: 0,
	};
	let loadingId: number | string = -1;
	let selectedCollection: string | null = null;

	const navigateToCollection = (collectionId: string) => {
		loadingId = collectionId;
		goto(`/collection/${collectionId}`).finally(() => {
			loadingId = -1;
		});
	};

	const selectCollection = (id: string, open: boolean) => {
		if (open || selectedCollection === id) {
			navigateToCollection(id);
			selectedCollection = null;
		} else {
			selectedCollection = id;
		}
	};

	$: isOwner = userAddress.toLowerCase() === $connectedAccount.toLowerCase();
</script>

{#if collections?.length > 0}
	<Pagination list={collections}>
		<section slot="content" let:listSlice>
			{#each listSlice as collection, index}
				<div id={index === 0 ? 'example-collection-card' : ''} on:keydown>
					<CollectionCard
						selected={selectedCollection === collection.id}
						loading={loadingId === collection.id}
						{collection}
						{selectCollection}
						deleteCollection={() => deleteCollection(index, $currentPageNumber)}
						deleteCollectionAvailable={isOwner}
					/>
				</div>
			{/each}
		</section>
	</Pagination>
	<div class="count">
		{collections.length} collection(s)
	</div>
	{#if isOwner}
		<p>
			<span>
				<Icon name="infoCircle" />
			</span>
			Collection(s) you have created.
		</p>
	{/if}
{:else}
	<section class="example-card">
		<span id="example-collection-card" style="width: 45%;">
			<CollectionCard collection={exampleCollection} deleteCollection={null} example={true} />
		</span>
		{#if userAddress && isOwner}
			<p>You haven't created any collection yet.</p>
		{:else}
			<p>This user hasn't created any collection yet.</p>
		{/if}
	</section>
{/if}

<style lang="scss">
	section {
		margin: 32px 0;
		display: grid;
		grid-column-gap: 80px;
		grid-row-gap: 32px;
		grid-template-columns: repeat(2, minmax(340px, 1fr));
		grid-auto-flow: row;
		grid-auto-rows: 1fr;
	}
	.example-card {
		display: flex;
		flex-direction: column;
	}

	.count {
		color: var(--text-secondary);
		padding: 20px;
		text-align: center;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 1000px) {
		section {
			grid-column-gap: 40px;
		}
		#example-collection-card {
			width: 100% !important;
		}
	}
	@media (max-width: 768px) {
		section {
			grid-template-columns: minmax(340px, 1fr);
		}
	}
</style>
