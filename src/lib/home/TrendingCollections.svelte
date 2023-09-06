<script lang="ts">
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import ETHAmount from '$lib/components/ETHAmount.svelte';
	import { formatHistoricalDate } from '$utils/formatDate';
	import Trans from '$lib/components/Trans.svelte';
	import { readNetwork } from '$stores/web3';
	// import Button from '$lib/components/Button.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import SplitPanels from '$lib/components/layouts/SplitPanels.svelte';
	import { getRecentMints, getCollections } from '$data/nft';
	import Loading from '$lib/components/Loading.svelte';
	import TrendingCollectionsCard from '$lib/components/TrendingCollectionsCard.svelte';
	import type { NftToken } from '$models/subgraph-entities/v2/nft-contract';

	let recentMints: Promise<NftToken[]>;
	let collections: Promise<any[]>;

	$: if ($readNetwork) {
		recentMints = getRecentMints();
		collections = getCollections();
	}
</script>

<SplitPanels>
	<svelte:fragment slot="left">
		<h1>
			<Trans>Trending collections</Trans>
		</h1>
		{#await collections}
			<Loading fullWidth={true} />
		{:then loadedCollections}
			{#each loadedCollections.slice(0, 6) as collection}
				<TrendingCollectionsCard {collection} />
			{/each}
			{#if !loadedCollections?.length}
				No collections found on {$readNetwork.alias}.
			{/if}
		{:catch error}
			<p style="color: var(--text-failure)">{error}</p>
		{/await}
		<!-- TODO: Commented out until we can actually have a collections page -->
		<!-- <a href="/projects?tab=trending"> -->
		<!-- 	<Button fullWidth type="secondary" size="md">More trending treasuries</Button> -->
		<!-- </a> -->
	</svelte:fragment>
	<svelte:fragment slot="right">
		<h1><Trans>Recently minted</Trans></h1>
		<div class="payments">
			{#await recentMints}
				<Loading fullWidth={true} />
			{:then mints}
				{#each mints as mint}
					<div class="payment">
						<InfoSpaceBetween>
							<div slot="left">
								<a id="link" href="/collections/{mint.contractAddress}">
									#{mint.tokenId}
								</a>
								<p>{mint.contract.name}</p>
								<ETHAmount amount={mint.price} precision={4} />
							</div>
							<div slot="right">
								<p class="timestamp">
									{mint.createdAt && formatHistoricalDate(mint.createdAt * 1000)}
								</p>
								<p class="address"><EnsOrAddress address={mint.mintReceiver} /></p>
							</div>
						</InfoSpaceBetween>
					</div>
				{/each}
				{#if !mints?.length}
					No recent mints found on {$readNetwork.alias}.
				{/if}
			{/await}
		</div>
	</svelte:fragment>
</SplitPanels>

<style>
	h1 {
		color: var(--text-header);
		font-weight: 600;
		font-size: 1.3rem;
		margin-bottom: 2rem;
	}

	.payments {
		max-height: 1070px;
		overflow: auto;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.payments::-webkit-scrollbar {
		display: none;
	}

	p {
		margin: 0;
	}

	#link {
		color: var(--text-primary);
		font-weight: 700;
	}

	#link:hover {
		color: var(--text-action-primary);
	}

	.address {
		font-weight: 300;
	}

	.timestamp {
		color: var(--text-secondary);
		font-size: 0.7rem;
		font-weight: 300;
	}

	.payment {
		padding-top: 10px;
		margin-bottom: 10px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--stroke-tertiary);
	}

	a[href='/projects?tab=all'] {
		margin-top: 20px;
	}
</style>
