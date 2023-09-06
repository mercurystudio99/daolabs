<script lang="ts">
	import InfoBox from '$lib/components/InfoBox.svelte';
	import Img from '$lib/components/Img.svelte';
	import Icon from '$lib/components/Icon';
	import Loading from '$lib/components/Loading.svelte';
	import { getRandomColor } from '$utils/random';
	import { getLinkIconProps } from '$utils/links';
	import Ethereum from '$lib/components/Ethereum.svelte';
	import PfpNftTable from '$lib/components/collections/PfpNftTable.svelte';
	import NftTable from '$lib/components/collections/NftTable.svelte';
	import {
		getCollectionPrice,
		getSumNftTotalSupply,
		isPfpCollection,
	} from '$utils/collectionHelpers';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import type { AdvancedCollection } from '$models/minter/collection-config';

	export let collection: AdvancedCollection;
	const loading = false;
	let placeholders: string[] = [];

	function fillPlaceholders(colors: string[]) {
		for (let i = 0; i < 100; i++) {
			placeholders = [...placeholders, getRandomColor(colors)];
		}
	}

	$: fillPlaceholders(collection.defaultColors);
	$: supply = getSumNftTotalSupply(collection);
</script>

<!-- eslint-disable -->
<div class="container">
	<h1 class="title">Review Collection</h1>
	<div class="banner" class:missing={!collection.banner}>
		{#if collection.banner}
			<img id="banner" src={collection.banner} alt="" />
		{:else}
			<div class="icon">
				<Icon name="missingImage" viewBox="0 0 18 16" />
			</div>
			1400 x 400
		{/if}
	</div>
	<div class="collection-info">
		<div class="collection-logo" class:missing={!collection.logo}>
			{#if collection.logo}
				<img src={collection.logo} alt="" />
			{:else}
				<div class="icon">
					<Icon name="missingImage" viewBox="0 0 18 16" />
				</div>
				350 x 350
			{/if}
		</div>
		<h1>{collection.name}</h1>
		<div class="links">
			{#if collection.links?.length > 0}
				{#each collection.links as link}
					<a class="link" href={link} target="_blank" rel="noreferrer">
						<Icon {...getLinkIconProps(link)} />
						{getLinkIconProps(link).name === 'twitter' || getLinkIconProps(link).name === 'globe'
							? link
							: ''}
					</a>
				{/each}
			{/if}
		</div>
		<p class="description">
			{collection.description}
		</p>
		<div class="stats">
			<div class="box">
				<span class="value"> {supply}</span>
				items
			</div>
			<div class="box">
				<span class="value">0</span>
				owners
			</div>
			<div class="box">
				<span class="value">{getCollectionPrice(collection)}</span>
				floor price
			</div>
			<div class="box">
				<span class="value">0.00</span>
				volume traded
			</div>
		</div>
	</div>
	<div class="nft-info">
		<section>
			<div class="mint-info">
				<h2>Mint</h2>
				{#if collection.mintStart}
					<span>Reveal Date: {new Date(collection.mintStart).getTime()}</span>
				{/if}
				<span>Total Supply: {getSumNftTotalSupply(collection)}</span>
			</div>
			<div class="mint-configuration-container">
				<div class="mint-configuration">
					<Icon name="minusCircle" />
					<div class="mint-image-container">
						<div class="placeholder" class:missing-placeholder={!collection.defaultImage}>
							{#if collection.defaultImage}
								<Img
									src={replaceIpfsDomain(collection.defaultImage)}
									alt={String(collection.preRevealImage)}
									placeholder="https://via.placeholder.com/200?text=..."
									styles={{ width: '100%' }}
								/>
							{:else}
								<div class="icon">
									<Icon name="missingImage" viewBox="0 0 18 16" />
								</div>
								600 x 400
							{/if}
						</div>
						<div class="mint-amount">
							<p class="labels">
								<span>Amount</span>
								<span class="price">Mint Price</span>
							</p>
							<p class="amount">
								<span>n/{supply}</span>
								<span class="price"><Ethereum /> n</span>
							</p>
						</div>
					</div>
					<Icon name="plusCircle" />
				</div>
			</div>
		</section>
		{#if placeholders.length}
			<InfoBox info="Simulation" classes="margin" />
			{#if isPfpCollection(collection)}
				<PfpNftTable
					{collection}
					saveCollection={() => Promise.resolve()}
					showShuffle={false}
					view="small"
				/>
			{:else}
				<NftTable {collection} />
			{/if}
		{/if}
	</div>
</div>
{#if loading}
	<Loading overlay />
{/if}

<style lang="scss">
	.container {
		width: 100%;
		height: fit-content;
		padding-bottom: 32px;
		.title {
			color: var(--text-header);
			padding: 28px 32px;
			margin-bottom: 16px;
			display: flex;
			align-items: center;
		}
		.banner {
			box-shadow: var(--background-l1) 10px 10px;
			max-height: 212px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 100%;

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				height: 400px;
			}
		}
		.missing {
			background: var(--background-l2);
			height: 212px;
			color: var(--text-tertiary);
			.icon {
				display: flex;
				font-size: 40px;
				color: rgba(245, 163, 18, 0.24);
			}
		}
		.collection-info {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			max-width: 800px;
			margin: 100px auto 0 auto;
			padding: 0 24px;

			h1 {
				font-size: 40px;
				margin-bottom: 16px;
			}
			.collection-logo {
				position: absolute;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				bottom: 100%;
				margin-bottom: 10px;
				width: 150px;
				height: 150px;
				border: 1px solid var(--stroke-primary);

				img {
					width: 100%;
					height: 100%;
				}
			}

			.links {
				gap: 16px;
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				color: var(--text-action-primary);
				.link {
					display: flex;
					align-items: center;
					gap: 8px;
				}
			}

			.description {
				margin-top: 18px;
				color: var(--text-tertiary);
				text-align: justify;
			}
			.stats {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;

				&:last-child {
					margin-right: 0;
				}

				.box {
					margin-right: 21px;
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
		.nft-info {
			margin: 16px 32px;
			section {
				border-bottom: 1px solid var(--stroke-tertiary);
				padding-bottom: 16px;
			}
			.mint-info {
				display: flex;
				flex-direction: column;
				h2 {
					color: var(--text-header);
					margin-bottom: 16px;
				}
				span {
					margin-bottom: 16px;
					color: var(--text-secondary);
				}
			}
			.mint-configuration-container {
				width: 100%;
				display: flex;
				justify-content: center;
				border: 0.4px solid var(--stroke-tertiary);
				padding: 16px;
				font-size: 21px;
				.mint-configuration {
					display: flex;
					align-items: center;
					gap: 16px;
					.mint-image-container {
						display: flex;
						flex-direction: column;
						border: 0.4px solid var(--stroke-tertiary);
						width: 50vw;
						max-width: 300px;
						.placeholder {
							display: flex;
							flex-direction: column;
							align-items: center;
							justify-content: center;
							width: 100%;
							font-size: 14px;
						}

						.missing-placeholder {
							height: 200px;
							background: var(--background-l2);
							color: var(--text-tertiary);
							.icon {
								display: flex;
								flex-direction: column;
								align-items: center;
								font-size: 40px;
								color: rgba(245, 163, 18, 0.24);
							}
						}
						.mint-amount {
							padding: 7px 13px;
							display: flex;
							justify-content: space-between;
							gap: 10px;
							font-size: 14px;

							.labels {
								span {
									text-align: start;
								}
							}
							.amount {
								span {
									text-align: end;
								}
							}
							p {
								display: flex;
								flex-direction: column;
								gap: 4px;
								color: var(--text-secondary);
							}
							.price {
								color: #7fcec9;
							}
						}
					}
				}
			}
		}
	}
	@media (max-width: 1000px) {
		.container {
			.collection-info {
				.stats {
					.box {
						margin-bottom: 21px;
					}
				}
			}
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		.container {
			.title {
				padding: 28px 24px;
			}
			.collection-info {
				.stats {
					.box {
						margin-bottom: 21px;
					}
				}
			}
			.nft-info {
				margin: 16px 24px;
			}
		}
	}
</style>
