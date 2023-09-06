<script lang="ts">
	import { onMount } from 'svelte';
	import ActionModal from '$lib/components/ActionModal.svelte';
	import { getNftOwnersList } from '$services/nft/getNftMetadata';
	import Loading from '$lib/components/Loading.svelte';
	import ScrollBox from '$lib/components/ScrollBox.svelte';
	import { readNetwork } from '$stores/web3';
	import OwnerItem, { type OwnerInfo } from './OwnerItem.svelte';

	export let tokenAddress: string;
	export let close;
	export let owners: OwnerInfo[] = [];

	const OWNERS_LIMIT = 15;
	let loading = true;
	let hasNextPage = false;
	let endCursor: string;

	function getMoreOwners() {
		loading = true;
		getNftOwnersList(
			JSON.stringify({
				queryMethod: 'ownersListByAggregateStat',
				tokenAddress: tokenAddress,
				chain: $readNetwork.alias.toLocaleUpperCase(),
				after: endCursor,
				limit: OWNERS_LIMIT,
			}),
			fetch,
		)
			.then((response) => {
				if (!response.errors) {
					let newPartOwners = response.data.aggregateStat.ownersByCount.nodes;
					owners = [...owners, ...newPartOwners];
					if (response.data.aggregateStat.ownersByCount.pageInfo.hasNextPage) {
						hasNextPage = response.data.aggregateStat.ownersByCount.pageInfo.hasNextPage;
						endCursor = response.data.aggregateStat.ownersByCount.pageInfo.endCursor;
					} else {
						endCursor = '';
						hasNextPage = false;
					}
					// TODO: add getting name and image.
				}
				loading = false;
			})
			.catch((e) => {
				loading = false;
				console.error(e);
			});
	}

	onMount(() => {
		if (!owners.length) {
			getMoreOwners();
		}
	});
</script>

<ActionModal title="Owned by">
	<ScrollBox hasMore={hasNextPage} {loading} loadMore={() => getMoreOwners()}>
		<div class="list">
			{#if owners?.length === 0}
				{#if loading}
					<Loading fullWidth />
				{:else}
					No information about owners available
				{/if}
			{:else}
				{#each owners as owner}
					<OwnerItem {owner} />
				{/each}
			{/if}
		</div>
	</ScrollBox>
</ActionModal>

<style>
	.list {
		min-width: 400px;
	}
</style>
