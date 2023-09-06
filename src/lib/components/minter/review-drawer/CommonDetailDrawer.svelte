<script lang="ts">
	import CloseButton from '$lib/components/CloseButton.svelte';
	import { TokenStandard } from '$models/minter/token-standard';
	import Img from '$lib/components/Img.svelte';
	import Attributes from '$lib/components/NftAttributes/Attributes.svelte';
	import Stats from '$lib/components/NftAttributes/Stats.svelte';
	import Rankings from '$lib/components/NftAttributes/Rankings.svelte';
	import Boosts from '$lib/components/NftAttributes/Boosts.svelte';
	import NftContractDetailsBox from '$lib/components/NftContractDetailsBox.svelte';
	import { ipfsCidToWorkerUrl, replaceIpfsDomain } from '$utils/ipfs';
	import { getNftBaseUri, getNftContractAddress } from '$utils/collectionHelpers';
	import LinksDisplay from '$lib/components/LinksDisplay.svelte';
	import MissingImage from '../icons/MissingImage.svelte';
	import Drawer from '../drawer/Drawer.svelte';
	import DetailSection from './DetailSection.svelte';
	import type { AdvancedCollection } from '$models/minter/collection-config';
	import type { Attribute, NftConfig } from '$models/minter/nft-config';

	export let isOpen: boolean;
	export let nft: NftConfig;
	export let collection: AdvancedCollection;

	function closeDrawer() {
		isOpen = false;
	}

	function calculateRarity(attribute: Attribute): string {
		const amount = collection.nfts.reduce((acc, value) => {
			const found = value.attributes?.properties?.some(
				(prop) => prop.name === attribute.name && prop.value === attribute.value,
			);
			if (found) {
				acc += 1;
			}
			return acc;
		}, 0);
		const percentage = (amount / collection.nfts.length) * 100;
		return `${percentage.toFixed(0)}%`;
	}

	// TODO: This is a quick fix as I'm not finding where the token id is being appended
	// to video and image nfts.
	const shouldAppendTokenId =
		collection.standard === TokenStandard.ERC721 && nft._token && !/\d$/.test(nft.name);

	function getBaseUrl() {
		const nftBaseUri = getNftBaseUri(collection);
		if (nftBaseUri) {
			return `${ipfsCidToWorkerUrl(nftBaseUri)}/${nft._token}`;
		}
		return;
	}
</script>

<Drawer open={isOpen} on:clickAway={closeDrawer} size="650px">
	<CloseButton on:click={closeDrawer} />
	<div class="container">
		<h1 class="drawer-title">
			{nft.name}
			{shouldAppendTokenId ? `#${nft._token}` : ''}
		</h1>
		<div class="content">
			<DetailSection
				header={collection.name}
				expandable={!!(collection.description || collection.links?.length > 0)}
			>
				<div class="collection-info">
					<div class="collection-logo" class:missing={!collection.logo}>
						{#if collection.logo}
							<Img
								src={replaceIpfsDomain(collection.logo)}
								alt={collection.logo}
								styles={{ height: '100%', maxWidth: 'fit-content' }}
								placeholder="https://via.placeholder.com/350?text=..."
							/>
						{:else}
							<div class="icon">
								<MissingImage width="40" height="37" />
							</div>
						{/if}
					</div>
					<div class="collection-detail">
						<p>{collection.description}</p>
						<div class="links">
							{#if collection.links?.length > 0}
								<LinksDisplay links={collection.links} />
							{/if}
						</div>
					</div>
				</div>
			</DetailSection>
			<slot />
			{#if nft.attributes?.properties?.length > 0}
				{@const attributes = nft.attributes.properties.map((prop) => ({
					label: prop.name,
					value: prop.value,
					rarity: calculateRarity(prop),
				}))}
				<DetailSection header="Attributes">
					<Attributes {attributes} />
				</DetailSection>
			{/if}
			{#if nft.attributes?.levels?.length > 0}
				{@const rankings = nft.attributes.levels.map((level) => ({
					label: level.name,
					value: Number(level.value),
					max: Number(level.max),
				}))}
				<DetailSection header="Rankings">
					<Rankings {rankings} />
				</DetailSection>
			{/if}
			{#if nft.attributes?.stats?.length > 0}
				{@const stats = nft.attributes.stats.map((stat) => ({
					label: stat.name,
					value: Number(stat.value),
					max: Number(stat.max),
				}))}
				<DetailSection header="Stats">
					<Stats {stats} />
				</DetailSection>
			{/if}
			{#if nft.attributes?.boosts?.length > 0}
				{@const boosts = nft.attributes.boosts.map((boost) => ({
					label: boost.name,
					value: Number(boost.value),
					type: boost.type,
				}))}
				<DetailSection header="Boosts">
					<Boosts {boosts} />
				</DetailSection>
			{/if}
			<DetailSection header="Details" classes="full-border">
				<NftContractDetailsBox
					details={{
						tokenId: nft._token,
						tokenStandard: collection.standard,
						chain: nft.blockchain,
						royalty: collection.royalty?.royalty ?? 0,
						contractAddress: getNftContractAddress(collection),
						creator: collection.creator,
						tokenURI: getBaseUrl(),
					}}
				/>
			</DetailSection>
		</div>
	</div>
</Drawer>

<style lang="scss">
	.container {
		font-size: 14px;
		line-height: 1.5715;
		word-wrap: break-word;
		.drawer-title {
			color: var(--text-header);
			font-size: 28px;
			margin-bottom: 32px;
		}

		.content {
			padding: 2rem;
			margin-bottom: 10px;
			background: var(--background-l2);
			box-shadow: var(--background-l1) 10px 10px;
			border-radius: 1px;
			stroke: none;
			color: var(--text-primary);
			position: relative;

			.collection-info {
				display: flex;
				background: var(--background-l0);
				padding: 16px;
				color: #aaaaaa;

				.collection-logo {
					width: 100px;
					height: 100px;
					display: flex;
					justify-content: center;
					flex-direction: column;
					float: left;
					margin-right: 16px;
				}
				.collection-detail {
					display: flex;
					flex-direction: column;
					justify-content: center;
				}
				.links {
					display: flex;
					align-items: center;
					position: relative;
					gap: 18px;
					flex-wrap: wrap;
				}
			}
			.missing {
				background: var(--background-l2);
				.icon {
					display: flex;
					flex-direction: column;
					align-items: center;
					color: var(--text-tertiary);
				}
			}
		}
	}
</style>
