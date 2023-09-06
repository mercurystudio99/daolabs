<script lang="ts">
	import { objectToStyleString, toSentenceCase } from '$utils/string';
	import Icon from '$lib/components/Icon';
	import Img from '$lib/components/Img.svelte';
	import { copyToClipboard } from '$utils/clipboard';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import {
		getNftContractAddress,
		getNftIconName,
		isAdvancedCollection,
		isCollectionDeployed,
		isSimpleCollection,
	} from '$utils/collectionHelpers';
	import { page } from '$app/stores';
	import Popover from './Popover.svelte';
	import CloseButton from './CloseButton.svelte';
	import EnsOrAddress from './EnsOrAddress.svelte';
	import SlideUpInfo from './SlideUpInfo.svelte';
	import type { Collection } from '$models/minter/collection-config';

	export let collection: Collection;
	export let selectCollection: (id: string, open?: boolean) => void = () => {};
	export let deleteCollection: () => void = () => {};
	export let example = false;
	export let selected = false;
	export let loading = false;
	export let deleteCollectionAvailable: boolean = false;

	let isTouchMove = false;

	$: nftContractAddress = getNftContractAddress(collection);
	$: collectionLogo = (isSimpleCollection(collection) && collection.file) || collection.logo;
</script>

<div class="wrapper" class:loading class:selected>
	{#if !example}
		<div class="tooltip">
			<div class="content">
				<a href={`${$page.url.origin}/collection/${collection.id}`}>
					{`${$page.url.origin}/collection/${collection.id}`}
				</a>

				<Popover placement="top">
					<div slot="content">Copy to clipboard</div>
					<Icon
						name="copy"
						on:click={() => copyToClipboard(`${$page.url.origin}/collection/${collection.id}`)}
					/>
				</Popover>
			</div>
		</div>
	{/if}
	<div
		class="collection"
		on:click={() => {
			selectCollection(collection.id, true);
		}}
		on:touchend|preventDefault={() => {
			if (!isTouchMove) {
				selectCollection(collection.id);
			}
			isTouchMove = false;
		}}
		on:touchmove={() => {
			isTouchMove = true;
		}}
		on:keydown
	>
		{#if collection.banner}
			<Img
				src={replaceIpfsDomain(`${collection.banner}`, '500x72')}
				alt={'Collection banner'}
				overlay={true}
				placeholder={`https://via.placeholder.com/${72}?text=...`}
				styles={{
					width: '100%',
					height: '72px',
					objectFit: 'cover',
					borderTopLeftRadius: 'var(--radius-lg)',
					borderTopRightRadius: 'var(--radius-lg)',
					position: 'absolute',
					top: 0,
				}}
			/>
		{:else}
			<div class="placeholder-banner" />
		{/if}
		<div class="main">
			{#if !collectionLogo}
				<div class="logo missing">
					<Icon name="missingImage" viewBox="0 0 18 16" />
				</div>
			{:else}
				<Img
					src={collectionLogo}
					alt={'Collection logo'}
					placeholder={`https://via.placeholder.com/${100}?text=...`}
					styles={{
						position: 'absolute',
						objectFit: 'cover',
						width: '100px',
						height: '100px',
						borderRadius: 'var(--radius-lg)',
					}}
				/>
			{/if}
			<div class="info">
				<h3>
					{collection.name}
					<Icon
						name={getNftIconName(collection)}
						style={objectToStyleString({
							fontSize: '12px',
						})}
					/>
				</h3>
				<div class="sub">
					<span class="creator-wrapper">
						by
						<span class="creator">
							<EnsOrAddress address={collection.creator} showTooltip={!example} />
						</span>
					</span>
					<span class="list">
						{#if collection.symbol}
							<div class="divider" />
							<span>{collection.symbol}</span>
						{/if}
						<div class="divider" />
						<span class="network">
							<Icon name="ethereum" />
							{toSentenceCase(collection.network)}
						</span>
					</span>
					<span class="description">
						{collection.description}
					</span>
				</div>
			</div>
		</div>
	</div>
	{#if deleteCollectionAvailable}
		<div
			class="delete"
			style={selected ? 'visibility: visible;' : ''}
			on:click|stopPropagation={deleteCollection}
			on:keydown
		>
			<CloseButton
				size="0.7rem"
				position="0"
				color="--icon-action-primary"
				background="transparent"
			/>
		</div>
	{/if}
	<!-- TODO condition for when simple NFT is deployed -->
	{#if isAdvancedCollection(collection)}
		<div class="verticalLabel">
			{#if !collection?.nfts?.length || !collection?.pricing}
				<p>Draft</p>
			{:else if collection?.pricing && !isCollectionDeployed(collection)}
				<p>Ready</p>
			{/if}
		</div>
	{/if}
	{#if nftContractAddress}
		<div class="horizontalLabel">
			<SlideUpInfo onClick={async () => copyToClipboard(nftContractAddress)}>
				<p>
					{nftContractAddress}
				</p>
			</SlideUpInfo>
		</div>
	{/if}
</div>

<style lang="scss">
	.wrapper {
		max-width: 500px;
		position: relative;
		min-height: 136px;
		height: 100%;
		border: 0.4px solid var(--stroke-tertiary);
		border-radius: var(--radius-lg);

		&:hover {
			.tooltip {
				display: flex;
			}
			.delete {
				visibility: visible;
			}
		}
		.tooltip {
			display: none;
			position: absolute;
			left: 25%;
			top: -10%;
			max-width: var(--maxWidth);
			background: var(--background-l0);
			box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
			transition: visibility 0.3s cubic-bezier(0.75, -0.02, 0.2, 0.97);
			padding: 10px;
			z-index: 999;
			white-space: normal;
			text-transform: none;
			width: 300px;
			font-weight: 300;

			a {
				&:hover {
					text-decoration: underline;
				}
			}
		}
	}

	.verticalLabel {
		color: var(--text-brand-primary);
		background: var(--background-brand-secondary);
		position: absolute;
		transform: translate(0px, 0%);
		height: 100%;
		top: 0px;
		left: 0px;
		font-size: 0.8rem;
		text-align: center;
		font-weight: 500;
		text-transform: uppercase;
		writing-mode: vertical-rl;
		text-orientation: upright;
		border-top-left-radius: var(--radius-lg);
		border-bottom-left-radius: var(--radius-lg);

		p {
			margin: 0;
			padding: 1px;
		}
	}

	.horizontalLabel {
		color: black;
		background: var(--background-action-primary);
		position: absolute;
		transform: translate(0px, 0%);
		height: 22px;
		width: 100%;
		top: 0px;
		right: 0px;
		font-size: 0.8rem;
		text-align: center;
		font-weight: 500;
		writing-mode: horizontal-tb;
		text-orientation: upright;
		border-top-right-radius: var(--radius-lg);
		border-top-left-radius: var(--radius-lg);

		p {
			margin: 0;
			padding: 1px;
			cursor: crosshair;
		}
	}

	.loading {
		opacity: 0.8;
		animation: loading 1.5s infinite;
	}
	.collection {
		display: flex;
		flex-direction: column;
		max-width: 500px;
		position: relative;
		cursor: pointer;
		justify-content: center;
		height: 100%;

		.description {
			margin-top: 6px;
			min-height: 26px;
			color: var(--text-tertiary);
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 1;
			line-clamp: 1;
			-webkit-box-orient: vertical;
			word-break: break-word;
		}

		.main {
			position: relative;
			display: flex;
			gap: 10px;
			align-items: flex-end;
			padding-left: 32px;
			padding-right: 4px;
			top: 17px;

			.logo {
				position: absolute;
				object-fit: cover;
				width: 100px;
				height: 100px;
				border-radius: var(--radius-lg);
			}

			.missing {
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 20px;
				background: var(--background-l1);
				color: var(--accent);
			}

			.info {
				margin-left: 110px;
				display: flex;
				flex-direction: column;
				overflow: hidden;
				position: relative;

				h3 {
					color: var(--text-primary);
					font-size: 21px;
					font-weight: 700;
					margin-bottom: 0;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.sub {
					display: flex;
					flex-wrap: wrap;
					color: var(--text-tertiary);
					min-width: 40px;
					min-height: 50px;

					.creator-wrapper {
						align-items: center;
						display: flex;
						gap: 4px;
					}
					.creator {
						color: var(--text-action-primary);
					}
					.divider {
						width: 4px;
						height: 4px;
						border-radius: 50%;
						background-color: var(--text-action-primary);
						margin: 0 12px;
					}

					.list {
						display: flex;
						align-items: center;
					}

					.network {
						display: flex;
						align-items: center;
						gap: 4px;
					}
				}
			}
		}
	}
	.placeholder-banner {
		background: var(--background-l2);
		width: 100%;
		height: 72px;
		border-top-left-radius: var(--radius-lg);
		border-top-right-radius: var(--radius-lg);
		position: absolute;
		top: 0;
	}

	.delete {
		position: absolute;
		top: 4px;
		right: 8px;
		visibility: hidden;
		z-index: 1;
	}
	.tooltip {
		word-break: break-all;
		cursor: pointer;
		font-size: 14px;
	}

	.selected {
		border: 0.4px solid var(--stroke-action-primary);
	}
	@media (hover: none) {
		.wrapper {
			&:hover {
				.tooltip {
					visibility: hidden;
				}
				.delete {
					visibility: hidden;
				}
			}
		}
	}

	@keyframes loading {
		0% {
			border: 0.4px solid var(--stroke-action-primary);
		}
		50% {
			border: 0.4px solid var(--stroke-tertiary);
		}
		100% {
			border: 0.4px solid var(--stroke-action-primary);
		}
	}
</style>
