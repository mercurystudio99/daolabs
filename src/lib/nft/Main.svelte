<script lang="ts">
	import { onMount } from 'svelte';
	import {
		type Event,
		type Token,
		type Sale as SaleType,
	} from '@zoralabs/zdk/dist/queries/queries-sdk';
	import { OpenSea, type OpenSeaAssetContract } from '$data/opensea';

	import Icon from '$lib/components/Icon';
	import NftContractDetailsBox from '$lib/components/NftContractDetailsBox.svelte';
	import DetailSection from '$lib/components/minter/review-drawer/DetailSection.svelte';
	import Paragraph from '$lib/components/Paragraph.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import Attributes from './Attributes.svelte';
	import Header from './Header.svelte';
	import ItemActivity from './ItemActivity.svelte';
	import MetaInfo from './MetaInfo.svelte';
	import SaleInfo from './SaleInfo.svelte';
	import Graph from './Graph';
	import DisplayContent from './DisplayContent.svelte';
	import Listings from './Listings.svelte';
	import Offers from './Offers.svelte';
	import type { EventRef } from './Graph/types';

	export let events: Event[];
	export let nft: Token;
	export let sales: SaleType[];

	let contractInfo: OpenSeaAssetContract;
	let priceEvents: EventRef[] = [];

	type SnakeCaseAttribue = {
		trait_type: string;
		value: string;
		display_type?: string;
	};

	type ERC721Metadata = {
		title: string;
		type: string;
		name: string;
		description: string;
		image: string;
		attributes: SnakeCaseAttribue[];
	};

	async function loadMetadataFromUrl(url: string) {
		try {
			const response = await fetch(url);
			const json = (await response.json()) as ERC721Metadata;
			const attributes = json.attributes.map((attribute: SnakeCaseAttribue) => {
				return {
					traitType: attribute.trait_type,
					value: attribute.value,
					displayType: attribute.display_type,
				};
			});
			// set nft metadata to the json values
			// TODO: Check here about the NFT tank shared - we probably want to check for more keys than image
			// say animation url, video, music.
			nft = {
				...nft,
				...json,
				attributes,
				image: {
					url: json.image,
				},
			};
		} catch (e) {
			// if starts with ipfs:// then we can try to load it from a gateway
			if (url.startsWith('ipfs://')) {
				const cid = url.replace('ipfs://', '');
				const gatewayUrl = ipfsCidUrl(cid);
				void loadMetadataFromUrl(gatewayUrl);
			}
			console.error(e);
		}
	}

	function loadEvents() {
		sales?.forEach((x) => {
			priceEvents.push({
				value: x.price.chainTokenPrice.decimal,
				timestamp: new Date(x.transactionInfo.blockTimestamp).getTime(),
			});
		});
		priceEvents = priceEvents.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
	}

	onMount(async () => {
		contractInfo = (await OpenSea.getContractInfo(nft.collectionAddress)) as OpenSeaAssetContract;

		if (!nft.content && !nft.image && nft.tokenUrl) {
			void loadMetadataFromUrl(nft.tokenUrl);
		}
		loadEvents();
	});

	$: loading = !contractInfo;

	$: details = {
		contractAddress: nft.collectionAddress,
		tokenId: nft.tokenId,
		tokenURI: nft.tokenUrl,
		tokenStandard: (contractInfo || {}).schema_name,
		creator: contractInfo?.collection.payout_address,
		// Hardcoded for now as we don't have this data and it can't be anything else than ethereum
		chain: 'Ethereum',
		royalty:
			contractInfo?.collection?.fees?.seller_fees[contractInfo.collection.payout_address] / 100,
	};
</script>

<a href="/user/{nft.owner}" class="back-icon">
	<Icon name="collectionBack" viewBox="0 0 18 16" />
</a>
<Header {contractInfo} {loading} />

<div class="wrapper">
	<div class="left">
		<DisplayContent content={nft.content} image={nft.image} />
		<div class="gap" />
		{#if nft.description}
			<h2>Description</h2>
			<Paragraph description={nft.description} />
		{/if}
		<div class="gap" />
		<Attributes {nft} />
		<DetailSection header="Details" classes="full-border" arrowBelowHeader={false}>
			<NftContractDetailsBox {details} />
		</DetailSection>
	</div>
	<div class="right">
		<MetaInfo {nft} />
		<div class="gap" />
		<SaleInfo {sales} {nft} />
		<div class="gap" />
		<Graph events={priceEvents} />
		<div class="gap" />
		<Listings />
		<div class="gap" />
		<Offers />
		<div class="gap" />
		<ItemActivity {events} {sales} />
	</div>
</div>

<style>
	.back-icon {
		cursor: pointer;
		color: var(--text-action-primary);
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}
	h2 {
		color: var(--text-header);
		font-size: 1em;
	}

	.gap {
		height: 2em;
	}
	.wrapper {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 2.5em;
		flex-wrap: wrap;
	}

	.left,
	.right {
		flex: 1;
		max-width: 50%;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		.wrapper {
			flex-direction: column;
		}
		.left,
		.right {
			max-width: 100%;
		}
	}
</style>
