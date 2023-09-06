<script lang="ts">
	import Img from '$lib/components/Img.svelte';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import { NftStatus } from '$models/minter/nft-config';
	import MissingImage from '../icons/MissingImage.svelte';
	import type { SimpleCollection } from '$models/minter/collection-config';

	export let nft: SimpleCollection;

	$: totalSupply = nft.editions.reduce((acc, edition) => acc + Number(edition.totalSupply), 0);

	$: price = nft.editions.length
		? nft.editions.reduce((acc, edition) => {
				const editionPrice = Number(edition.price);
				if (editionPrice < acc) {
					return editionPrice;
				}
				return acc;
		  }, Number.MAX_SAFE_INTEGER)
		: 0;

	$: savedNfts = nft.editions.filter((edition) => edition._status === NftStatus.SAVED);
</script>

<section class="collection-preview">
	<h2>Preview</h2>
	<div class="preview">
		{#if !savedNfts.length}
			<div class="image missing">
				<MissingImage width="40" height="37" />
			</div>
		{/if}
		<div class="preview-container">
			{#each savedNfts as edition}
				<div class="preview-image">
					<Img
						placeholder={`https://via.placeholder.com/${500}?text=...`}
						src={replaceIpfsDomain(`${String(edition.file)}`, '500x500')}
						alt=""
					/>
				</div>
			{/each}
		</div>
		<!-- {#if !nft.file} -->
		<!-- 	<div class="image missing"> -->
		<!-- 		<MissingImage width="40" height="37" /> -->
		<!-- 	</div> -->
		<!-- {:else} -->
		<!-- {/if} -->
		<div class="collection-info">
			<h1>{nft.name || 'Edition name'}</h1>
			{#if nft.symbol}
				<p class="symbol">{nft.symbol}</p>
			{/if}
			<p class="description">{nft.description}</p>
			<div class="stats">
				<div class="box">
					<span class="value">{totalSupply || 'Unlimited'}</span>
					items
				</div>
				<div class="box">
					<span class="value">{price || '---'}</span>
					floor price
				</div>
			</div>
		</div>
	</div>
</section>

<style lang="scss">
	.collection-preview {
		display: flex;
		flex-direction: column;
		padding-left: 20px;
		border-left: 1px solid var(--stroke-secondary);
		flex-basis: 50%;
		h2 {
			font-size: 21px;
			color: var(--text-header);
			margin-bottom: 16px;
		}

		.preview-container {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 16px;
			flex-wrap: wrap;
			gap: 16px;
		}
		.preview-container > * {
			flex-basis: calc(50% - 8px);
		}

		.preview-image {
			border: 1px solid var(--stroke-secondary);
			width: fit-content;
			max-width: 500px;
			object-fit: cover;
			margin-left: auto;
			margin-right: auto;
		}

		.preview {
			position: relative;
			display: flex;
			flex-direction: column;
			height: 100%;

			.missing {
				background: var(--background-l2);
				display: flex;
				min-height: 300px;
				aspect-ratio: 1;
				align-items: center;
				justify-content: center;
			}

			.collection-info {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-top: 16px;

				h1 {
					font-size: 36px;
					margin: 8px 0;
					line-height: 40px;
				}
				.symbol {
					text-transform: uppercase;
					font-size: 14px;
					color: var(--text-tertiary);
					margin: 0;
				}
				.description {
					margin-top: 18px;
					color: var(--text-tertiary);
					text-align: justify;
					word-break: break-word;
				}

				.stats {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					gap: 21px;

					.box {
						background: var(--background-l2);
						box-shadow: var(--background-l1) 10px 10px;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						width: 118px;
						height: 90px;

						.value {
							color: var(--text-header);
							font-size: 16px;
						}
					}
				}
			}
		}
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		.collection-preview {
			border: none;
			padding: 0;
		}
	}
</style>
