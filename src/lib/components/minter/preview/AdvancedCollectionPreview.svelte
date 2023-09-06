<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import Img from '$lib/components/Img.svelte';
	import { getLinkIconProps } from '$utils/links';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import { getSumNftTotalSupply } from '$utils/collectionHelpers';
	import MissingImage from '../icons/MissingImage.svelte';
	import type { CollectionPricing, AdvancedCollection } from '$models/minter/collection-config';

	export let collection: AdvancedCollection;
	export let collectionPricing: CollectionPricing = null;

	const getCollectionPrice = (pricing: CollectionPricing) => {
		const symbol = pricing?.currency === 'USD' ? '$' : 'Ξ';
		const price = pricing?.price || 'n';
		return `${symbol} ${price}`;
	};

	$: collectionSupply = getSumNftTotalSupply(collection);
	$: collectionPrice = getCollectionPrice(collectionPricing || collection.pricing);
</script>

<section class="collection-preview">
	<h2>Preview</h2>
	<div class="preview">
		<div
			class="banner"
			style={`background-image: url(${replaceIpfsDomain(collection.banner)})`}
			class:missing={!collection.banner}
		>
			<div class="icon">
				<MissingImage width="40" height="37" />
				1400 x 400
			</div>
		</div>
		<div class="logo" class:missing={!collection.logo}>
			<div class="icon">
				<MissingImage width="40" height="37" />
				350 x 350
			</div>
			{#if collection.logo}
				<Img
					src={replaceIpfsDomain(collection.logo)}
					alt={collection.logo}
					style={{ width: '100%' }}
					placeholder="https://via.placeholder.com/350?text=..."
				/>
			{/if}
		</div>
		<div class="collection-info">
			<h1>{collection.name || 'Name'}</h1>
			<div class="links">
				{#if collection.links?.length > 0}
					{#each collection.links as link}
						<a href={link} target="_blank" rel="noreferrer">
							<Icon {...getLinkIconProps(link)} />
							{getLinkIconProps(link).name === 'twitter' || getLinkIconProps(link).name === 'globe'
								? link
								: ''}
						</a>
					{/each}
				{/if}
			</div>
			<p class="description">{collection.description}</p>
			<div class="stats">
				<div class="box">
					<span class="value">{collectionSupply || 0}</span>
					items
				</div>
				<div class="box">
					<span class="value">0</span>
					owners
				</div>
				<div class="box">
					<span class="value">{collectionPrice}</span>
					floor price
				</div>
				<div class="box">
					<span class="value">0,00</span>
					volume traded
				</div>
			</div>
		</div>
		<div class="mint-info">
			<h2>Mint</h2>
			<span>Total Supply: {collectionSupply || 'n/a'}</span>
			<span>Total Earned: 0</span>
		</div>
		<div class="mint-container">
			<Icon name="minusCircle" />
			<div class="wrapper">
				<div class="image-container">
					<div class="placeholder" class:missing={!collection.defaultImage}>
						<div class="icon">
							<MissingImage width="40" height="37" />
							600 x 400
						</div>
						{#if collection.defaultImage}
							<Img
								src={replaceIpfsDomain(collection.defaultImage)}
								alt={collection.defaultImage}
								styles={{ height: '100%' }}
								placeholder="https://via.placeholder.com/600?text=..."
							/>
						{/if}
					</div>
					<div class="mint-amount">
						<p class="labels">
							<span>Amount</span>
							<span class="price">Mint Price</span>
						</p>
						<p class="amount">
							<span>n/{collectionSupply || 0}</span>
							<span class="price">{collectionPrice}</span>
						</p>
					</div>
				</div>
				<Button size="md">Mint</Button>
			</div>
			<Icon name="plusCircle" />
		</div>
	</div>
</section>

<style lang="scss">
	.collection-preview {
		display: flex;
		flex-direction: column;
		padding-left: 24px;
		border-left: 1px solid var(--stroke-secondary);
		flex-basis: 50%;
		h2 {
			font-size: 21px;
			color: var(--text-header);
			margin-bottom: 16px;
		}

		.preview {
			position: relative;
			display: flex;
			flex-direction: column;
			justify-content: center;
			height: 100%;

			.banner {
				width: 100%;
				height: 160px;
				background-repeat: no-repeat;
				background-size: cover;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: var(--background-l1) 10px 10px;

				.icon {
					display: none;
					margin-bottom: 40px;
				}
			}

			.missing {
				background: var(--background-l2);
				display: flex;
				align-items: center;
				justify-content: center;

				.icon {
					display: flex !important;
					font-size: 12px;
					color: var(--text-tertiary);
					flex-direction: column;
					align-items: center;
				}
			}

			.logo {
				display: flex;
				align-items: center;
				justify-content: center;
				margin: -75px auto 0;
				width: 150px;
				height: 150px;

				.icon {
					display: none;
				}
			}

			.collection-info {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin: 16px 0;
				padding-bottom: 32px;
				border-bottom: 1px solid var(--stroke-tertiary);

				h1 {
					font-size: 36px;
					line-height: 48px;
					margin: 16px 0;
				}

				.links {
					width: 100%;
					gap: 16px;
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					color: var(--text-action-primary);
				}

				.description {
					margin: 16px 0;
					color: var(--text-tertiary);
					text-align: justify;
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

			.mint-info {
				display: flex;
				flex-direction: column;
				gap: 8px;
				margin-bottom: 16px;
				h2 {
					color: var(--text-header);
					margin: 0;
				}
				span {
					color: var(--text-secondary);
				}
			}
			.mint-container {
				width: 100%;
				display: flex;
				justify-content: center;
				border: 0.4px solid var(--stroke-tertiary);
				padding: 16px;
				align-items: center;
				gap: 16px;
				font-size: 21px;
				color: var(--icon-tertiary);

				.wrapper {
					display: flex;
					flex-direction: column;
					gap: 8px;
					width: 50%;
					max-width: 300px;
				}
				.image-container {
					display: flex;
					flex-direction: column;
					border: 0.4px solid var(--stroke-tertiary);
					.placeholder {
						display: flex;
						align-items: center;
						justify-content: center;
						height: 200px;
						.icon {
							display: none;
							font-size: 14px;
						}
					}
					.mint-amount {
						padding: 7px 13px;
						display: flex;
						justify-content: space-between;
						gap: 10px;
						font-size: 14px;

						.labels {
							margin: 0;
							span {
								text-align: start;
							}
						}
						.amount {
							margin: 0;
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
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		.collection-preview {
			border-left: none;
			padding: 0;
			border-top: 1px solid var(--stroke-secondary);
			padding-top: 16px;
		}
	}
</style>
