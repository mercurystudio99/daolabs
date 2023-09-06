<script lang="ts">
	import CloseButton from '$lib/components/CloseButton.svelte';
	import Icon from '$lib/components/Icon';
	import { ipfsCidUrl } from '$utils/ipfs';
	import Img from '$lib/components/Img.svelte';
	import { isPfpNft, type BasicNftConfig, hasIpfsMetadata } from '$models/minter/nft-config';
	import { objectToStyleString } from '$utils/string';
	import DraggableListItem from '../draggable-list-item/DraggableListItem.svelte';
	import ExamplePfpLayering from '../preview/ExamplePFPLayering.svelte';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import type * as CSS from 'csstype';

	export let savedNfts: BasicNftConfig[];
	export let nft: BasicNftConfig;
	export let previewImage: string;
	export let index: number;
	export let deleteNft: (index: number) => void = null;
	export let description: string = null;
	export let updateOrder: (list: BasicNftConfig[]) => void;
	export let openEditModal: (nft: BasicNftConfig) => void;
	export let assetStyle: CSS.Properties = null;
	export let readonly: boolean = false;

	let hovering: boolean;

	$: style = `--bg-color: var(${!readonly ? '--background-l0' : '--background-l1'});`;
</script>

<DraggableListItem {index} bind:list={savedNfts} {updateOrder} bind:hovering {readonly}>
	<div class="nft" on:dblclick={() => !readonly && openEditModal(nft)} {style}>
		<div class="info-wrapper">
			{#if savedNfts.length > 1}
				<span class="order">{index + 1}</span>
			{/if}
			<div class="total-supply">
				&#931
				<span class="amount">
					<SeemlessInput
						on:seemlessInputChanged
						bind:value={nft.totalSupply}
						style="text-align: center"
						type="number"
						{...readonly ? { readonly } : {}}
					/>
				</span>
				{nft.totalSupply > 1 ? 'NFTs' : 'NFT'}
			</div>
			<div class="info">
				<div class="row">
					<SeemlessInput
						on:seemlessInputChanged
						bind:value={nft.name}
						style="height: max-content"
					/>
					{#if nft.externalLink}
						<a href={nft.externalLink} target="_blank" rel="noreferrer">
							<Icon name="globe" viewBox="0 0 24 24" />
						</a>
					{/if}
					{#if hasIpfsMetadata(nft)}
						{#if nft.ipfsMetadata}
							<a
								target="_blank"
								href={ipfsCidUrl(String(nft.ipfsMetadata.IpfsHash))}
								rel="noreferrer"
							>
								<Icon name="ipfs" style="transition: unset" />
							</a>
						{/if}
					{/if}
				</div>
				<p class="description">
					{description}
				</p>
			</div>
		</div>
		<div class="preview-container" style={objectToStyleString(assetStyle)}>
			{#if isPfpNft(nft)}
				<ExamplePfpLayering {nft} style={{ height: '100%' }} imgStyle={{ minWidth: '100px' }} />
			{:else if previewImage}
				<Img
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'contain',
					}}
					src={previewImage}
					alt={previewImage}
					placeholder="https://via.placeholder.com/{100}?text=..."
				/>
			{:else}
				<Icon name="missingImage" viewBox="0 0 18 16" />
			{/if}
		</div>
		{#if deleteNft && !readonly}
			<CloseButton
				size="0.5rem"
				position="8px"
				color="--icon-action-primary"
				on:click={() => deleteNft(index)}
			/>
		{/if}
	</div>
</DraggableListItem>

<style>
	.nft {
		position: relative;
		display: flex;
		gap: 8px;
		padding: 8px;
		padding-right: 21px;
		background: var(--bg-color);
		border: 0.4px solid var(--stroke-tertiary);
		color: var(--text-secondary);
		/* TODO figure out a way to indicated double click possibility */
		cursor: grab;
	}
	.nft:active {
		cursor: grabbing;
	}
	.nfts-container .nft .info-wrapper {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		width: 100%;
	}
	.nft .order {
		color: var(--text-header);
		font-weight: 500;
		text-align: right;
		min-width: 16px;
	}
	.nft .total-supply {
		color: var(--text-action-primary);
		display: flex;
		align-items: center;
		height: max-content;
	}
	.nft .total-supply .amount {
		width: 50px;
	}
	.nft .info {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		max-width: 280px;
		gap: 4px;
	}
	.nft .info a {
		display: flex;
		align-items: center;
	}
	.nft .info .description {
		font-size: 10px;
		font-weight: 400;
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		margin-bottom: 0;
	}
	.nft .preview-container {
		width: 100px;
		height: 100px;
		margin-left: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		color: rgba(245, 163, 18, 0.24);
	}
</style>
