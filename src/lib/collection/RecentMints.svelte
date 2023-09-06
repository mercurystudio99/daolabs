<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import { ipfsCidToWorkerUrl } from '$utils/ipfs';
	import Img from '$lib/components/Img.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import type { NftToken } from '$models/subgraph-entities/v2/nft-contract';

	export let isConnectedUserOwner: boolean;
	export let recentMints: NftToken[] = [];

	let nfts = [];

	function getNfts(minters: NftToken[]) {
		const metadatas = minters.map((minter) => {
			const tokenUri = minter.tokenUri.replace('ipfs://', '');
			return ipfsCidToWorkerUrl(tokenUri);
		});
		// Reset nfts as otherwise the list will be duplicated
		nfts = [];
		metadatas.forEach(async (url, index) => {
			const metadata = await fetch(url);
			const nft = await metadata.json();
			const imageCid = nft.image.replace('ipfs://', '');
			nfts = [
				...nfts,
				{
					...nft,
					image: ipfsCidToWorkerUrl(imageCid as string),
					mintReceiver: minters[index].mintReceiver,
					createdAt: minters[index].createdAt,
				},
			].sort((a, b) => b.createdAt - a.createdAt);
		});
	}

	$: getNfts(recentMints);
</script>

<section class="additional-info">
	<div class="item" class:fullWidth={!isConnectedUserOwner}>
		<h2 class="sub-title">
			Recent mints
			{#if recentMints.length}
				<span class="timestamp">
					<i>latest </i>{formatDistanceToNow(new Date(recentMints[0].createdAt * 1000), {
						addSuffix: true,
					})}
				</span>
			{/if}
		</h2>
		<div class="minter-list-wrap">
			{#if nfts.length}
				<div class="list">
					{#each nfts as nft}
						<div class="minter" style="background: {nft.background_color}">
							<Img
								src={nft.image}
								placeholder="https://via.placeholder.com/200?text=..."
								styles={{ minHeight: '150px' }}
							/>
							<div class="overlay">
								<div class="overlay-content">
									<h3>{nft.name}</h3>
									<EnsOrAddress address={nft.mintReceiver} />
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p>This collection does not have any mints...yet.</p>
			{/if}
		</div>
	</div>
</section>

<style>
	.additional-info {
		--image-width: 190px;
	}

	.additional-info {
		display: flex;
		flex-wrap: wrap;
		gap: 32px;
		justify-content: space-between;
		margin-top: 16px;
	}

	.additional-info .item {
		flex-basis: 100%;
	}

	.additional-info .item .sub-title {
		color: var(--text-header);
		margin-bottom: 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.additional-info .item .sub-title .timestamp {
		color: var(--text-secondary);
		font-size: 14px;
	}

	.additional-info .item .minter-list-wrap {
		border: 0.4px solid var(--stroke-tertiary);
		padding: 16px;
	}

	.additional-info .item .minter-list-wrap .list {
		display: grid;
		grid-auto-flow: row;
		grid-template-columns: repeat(auto-fit, minmax(var(--image-width), 1fr));
		gap: 16px;
		justify-items: center;
	}

	.additional-info .item .minter-list-wrap .list .minter {
		display: inherit;
		font-weight: 300;
		color: var(--text-secondary);
		padding: 8px 16px;
		background: var(--background-l2);
		text-align: center;
		max-width: var(--image-width);
	}

	.additional-info .item .minter-list-wrap p {
		font-weight: 300;
		color: var(--text-secondary);
		margin: 0;
	}

	.additional-info .fullWidth {
		flex-basis: 100%;
	}

	@media (max-width: 768px) {
		.minter-list-wrap {
			width: 100%;
		}
	}
</style>
