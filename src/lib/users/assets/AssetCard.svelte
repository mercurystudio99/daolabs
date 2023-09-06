<script lang="ts">
	import { BigNumber } from 'ethers';
	import { formattedNum } from '$utils/formatNumber';
	import EthAmount from '$lib/components/ETHAmount.svelte';
	import Ethereum from '$lib/components/Ethereum.svelte';
	import Icon from '$lib/components/Icon';
	import Img from '$lib/components/Img.svelte';
	import LongWord from '$lib/components/LongWord.svelte';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import type { IFloorPrice } from './interfaces/IFloorPrice';

	export let floorPrice: IFloorPrice;
	export let nft: {
		contract: {
			address: string;
		};
		metadata: {
			image: string;
			name: string;
		};
		media: {
			raw: string;
		}[];
		contractMetadata?: {
			name: string;
		};
		id: {
			tokenId: string;
		};
		tokenUri: {
			raw: string;
		};
	};
	export let small = false;
	export let showCollectionName = false;
	export let showMintInfo = false;
	export let square = false;

	function tokenId() {
		try {
			return BigNumber.from(nft.id.tokenId).toString();
		} catch (e) {
			return nft.id.tokenId;
		}
	}

	function generateUrl() {
		return replaceIpfsDomain(nft.metadata.image, '240x240');
	}

	function isVideo() {
		return nft.metadata?.image?.includes('.mp4');
	}

	let maxHeight: string;

	$: {
		if (small && square) {
			maxHeight = '116px';
		} else if (!small && square) {
			maxHeight = '160px';
		}
	}
</script>

<a class="card" class:small class:large={!small} href="/nft/{nft.contract.address}/{tokenId()}">
	{#if !isVideo()}
		<Img
			src={generateUrl()}
			alt={nft.metadata.name}
			styles={{
				maxHeight,
				maxWidth: maxHeight,
				objectFit: 'contain',
				width: '240px',
				height: '240px',
			}}
			placeholder={`https://via.placeholder.com/${maxHeight}?text=...`}
		>
			<div slot="failed" style="height: {small ? 116 : 160}px;">
				<Icon name="ethereumDainty" />
			</div>
		</Img>
	{/if}

	<div class="info">
		{#if showCollectionName}
			<p class="collectionName">
				<LongWord width={small ? 116 : 160} ellipsis>
					{nft.contractMetadata.name}
				</LongWord>
			</p>
		{/if}
		<p>
			<LongWord width={small ? 116 : 160} ellipsis>
				{#if nft.metadata.name}
					{nft.metadata.name}
				{:else}
					#{tokenId()}
				{/if}
			</LongWord>
		</p>
		{#if floorPrice}
			{#if !small}
				<span>Floor price</span>
			{/if}
			{#if floorPrice}
				<span class="action">
					<Ethereum />{formattedNum(floorPrice?.floorPrice, { precision: 4 })}
				</span>
			{/if}
		{/if}
		{#if showMintInfo && nft.mintInfo?.price}
			{#if !small}
				<span>Mint price</span>
			{/if}
			<span class="action"> <EthAmount amount={nft.mintInfo.price.nativePrice.raw} /></span>
		{/if}
	</div>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		cursor: pointer;
		box-shadow: 0 1px 3px 0 var(--stroke-secondary), 0 1px 2px 0 var(--stroke-tertiary),
			0 2px 1px -1px rgba(0, 0, 0, 0.12);
	}

	.info p {
		margin: 0;
		padding: 0 5px;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 800;
	}

	.info p.collectionName {
		font-size: 10px;
		color: var(--text-tertiary);
	}

	.info span {
		color: var(--text-tertiary);
		font-size: 10px;
		font-weight: 400;
		padding: 0 0px 0 5px;
	}

	.info span.action {
		color: var(--icon-action-primary);
		font-size: 12px;
	}

	.small {
		width: 116px;
	}

	.large {
		width: 160px;
	}

	div[slot='failed'] {
		font-size: 75px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
