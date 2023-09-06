<script lang="ts">
	import { SearchIcon } from 'svelte-feather-icons';
	import { getRandomColor } from '$utils/random';
	import { TokenStandard } from '$models/minter/token-standard';
	import {
		NftType,
		type Attribute,
		type NftConfig,
		type P5NftConfig,
	} from '$models/minter/nft-config';
	import Icon from '$lib/components/Icon';
	import { getPreviewUrlForTokenId, getP5NftScripts } from '$utils/p5js';
	import {
		isImageCollection,
		isMusicCollection,
		isVideoCollection,
		isP5Collection,
	} from '$utils/collectionHelpers';
	import NftTableAsset from '$lib/collection/NftTableAsset.svelte';
	import Dropdown from '../Dropdown.svelte';
	import Input from '../Input.svelte';
	import ImageDetailDrawer from '../minter/review-drawer/ImageDetailDrawer.svelte';
	import MusicDetailDrawer from '../minter/review-drawer/MusicDetailDrawer.svelte';
	import P5DetailDrawer from '../minter/review-drawer/P5DetailDrawer.svelte';
	import VideoDetailDrawer from '../minter/review-drawer/VideoDetailDrawer.svelte';
	import NftTableContainer from './NftTableContainer.svelte';
	import NftTableSidebar from './NftTableSidebar.svelte';
	import type { AdvancedCollection } from '$models/minter/collection-config';

	export let collection: AdvancedCollection;

	let view: 'small' | 'large' = 'large';
	let sidebarView = false;
	const sorting = [
		{ label: 'Recently created', value: 'Recent' },
		{ label: 'A-z', value: 'A-z' },
		{ label: 'Z-a', value: 'Z-a' },
	];
	const sortingMethods = new Map<string, (a: NftConfig, b: NftConfig) => number>([
		['TokenID', (a, b) => a._token.localeCompare(b._token)], // TODO: creation time?
		['A-z', (a, b) => a.name.localeCompare(b.name)],
		['Z-a', (a, b) => b.name.localeCompare(a.name)],
	]);

	type NftTableItem = NftConfig & {
		previewImage?: string;
	};

	type Filter = {
		name: string;
		value: string;
	};

	type AttributeFilter = {
		label: string;
		options: any;
	};

	let sortBy = sorting[0].value;
	let searchText = '';
	let duplicatedNfts: NftTableItem[];
	let searchedNfts: NftTableItem[];
	let filteredNfts: NftTableItem[];
	let attributeFilters: AttributeFilter[] = [];
	let filters: Filter[] = [];
	let selectedNft: NftConfig;
	let detailComponent: any;
	let isDetailDrawerOpen = false;
	let asyncDetailDrawerData: { _token: string; data: Promise<string> }[] = [];

	function sortNfts(nfts: NftTableItem[], method: string) {
		return nfts.sort(sortingMethods.get(method));
	}

	function getPreviewImagesForCollection(_collection: AdvancedCollection) {
		if (!_collection.nfts || _collection.nfts.length === 0) return;
		if (isImageCollection(_collection)) {
			return _collection.nfts.map((nft) => nft.file);
		}
		if (isMusicCollection(_collection)) {
			return _collection.nfts.map((nft) => nft.albums[0].cover);
		}
		if (isVideoCollection(_collection)) {
			return _collection.nfts.map((nft) => nft.cover);
		}
		if (isP5Collection(_collection)) {
			const urls = _collection.nfts.flatMap((nft) =>
				Array.from({ length: nft.totalSupply }).map((_, index) =>
					getPreviewUrlForTokenId(nft, index + 1),
				),
			);
			return urls;
		}
		return;
	}

	function getAsyncDetailDrawerData(nfts: NftConfig[]) {
		if (isP5Collection(collection)) {
			return getP5NftScripts(nfts as P5NftConfig[]);
		}
		return Promise.resolve([]);
	}

	function duplicateNfts(_collection: AdvancedCollection) {
		let duplicates: NftTableItem[] = [];
		if (_collection.nfts && _collection.nfts.length > 0) {
			if (_collection.standard === TokenStandard.ERC1155) {
				return collection.nfts;
			}
			const previewImages = getPreviewImagesForCollection(_collection);
			const sharedPreview = !isP5Collection(_collection);

			let tokenId = 1;
			_collection.nfts.forEach((nft, index) => {
				let previewImage = '';
				if (previewImages) {
					previewImage = previewImages[index];
				}
				for (let i = 0; i < nft.totalSupply; i++) {
					if (!sharedPreview) {
						previewImage = previewImages[tokenId - 1];
					}
					const token = `${tokenId}`.padStart(4, '0');
					const name = `${nft.name} #${token}`;
					tokenId += 1;
					duplicates.push({ ...nft, name, _token: token, previewImage });
				}
			});
			getAsyncDetailDrawerData(duplicates)
				.then((data) => {
					asyncDetailDrawerData = data;
				})
				.catch((err) => {
					console.log(err);
				});
		}
		return duplicates;
	}

	function getAttributeFilters(nfts: NftConfig[]) {
		if (nfts && nfts.length > 0) {
			const allNftAttributes = nfts.reduce((attributes: Attribute[], nft) => {
				// This only allows for filter on properties?
				if (nft.attributes && nft.attributes.properties) {
					attributes = [...attributes, ...nft.attributes.properties];
				}
				return attributes;
			}, []);
			const allAttributes = [...new Set(allNftAttributes.map((attr) => attr.name))];
			if (allAttributes.length > 0) {
				sidebarView = true;
			}
			return allAttributes.map((name) => {
				const filtered = allNftAttributes.filter((nftAttr) => nftAttr.name === name);
				const values = filtered.map((attr) => attr.value);
				const options = [
					{ label: '---', value: '*' },
					...[...new Set(values)].map((value) => ({ label: value, value })),
				];
				return { label: name, options };
			});
		}
		return [];
	}

	function applyFilters(nfts: NftTableItem[]) {
		let filtered = nfts;
		filters.forEach((filter) => {
			if (filter.value !== '*') {
				filtered = filtered.filter((nft) =>
					nft.attributes?.properties.some(
						(attr) => attr.name === filter.name && attr.value === filter.value,
					),
				);
			}
		});
		return filtered;
	}

	function handleSearch(text: string, nfts: NftTableItem[]) {
		let result: NftConfig[];
		result = nfts.filter(
			(nft) =>
				nft._token.includes(text) ||
				nft.name.includes(text) ||
				nft.attributes?.properties.some((attr) => attr.value.includes(searchText)),
		);
		return result;
	}

	function handleFilter(filter: any) {
		return (event: CustomEvent) => {
			filters = filters.map((f) =>
				f.name === filter.label ? { name: f.name, value: event.detail.value } : f,
			);
			filteredNfts = applyFilters(searchedNfts);
		};
	}

	async function openDrawer(nft: NftConfig) {
		let additionalData: any;
		switch (nft._type) {
			case NftType.IMAGE:
				detailComponent = ImageDetailDrawer;
				break;
			case NftType.MUSIC:
				detailComponent = MusicDetailDrawer;
				break;
			case NftType.VIDEO:
				detailComponent = VideoDetailDrawer;
				break;
			case NftType.P5JS:
				// before opening the drawer, we need to await the script and set it on the nft
				additionalData = asyncDetailDrawerData.find((item) => item._token === nft._token);
				if (additionalData) {
					(nft as P5NftConfig).script = await additionalData.data;
				}
				detailComponent = P5DetailDrawer;
				break;
			default:
				detailComponent = ImageDetailDrawer;
		}
		selectedNft = nft;
		isDetailDrawerOpen = true;
	}

	let placeholders = [];
	function fillPlaceholders(colors: string[]) {
		const newArray = [];
		for (let i = 0; i < 100; i++) {
			newArray.push(getRandomColor(colors));
		}
		placeholders = newArray;
	}

	$: attributeFilters = getAttributeFilters(collection.nfts);
	$: filters = attributeFilters.map((filter) => ({
		name: filter.label,
		value: filter.options[0].value,
	}));
	$: fillPlaceholders(collection.defaultColors);
	$: searchedNfts = handleSearch(searchText, duplicatedNfts || []);
	$: filteredNfts = applyFilters(searchedNfts || []);
	$: sortedNfts = sortNfts(filteredNfts || [], sortBy);
	$: duplicatedNfts = duplicateNfts(collection);
</script>

<NftTableContainer bind:view bind:sidebarView>
	<svelte:fragment slot="headerAddons">
		<div class="search">
			<Input bind:value={searchText} placeholder="Search by name or trait" type="text">
				<div slot="addon" class="icon">
					<SearchIcon size="1.5x" />
				</div>
			</Input>
		</div>
		<div class="sorting">
			<Dropdown bind:value={sortBy} options={sorting} />
		</div>
	</svelte:fragment>
	<svelte:fragment slot="sidebar">
		<NftTableSidebar label="Attributes" filters={attributeFilters} onSelect={handleFilter} />
	</svelte:fragment>
	<svelte:fragment slot="nfts">
		{#if !collection.nfts || collection.nfts.length === 0}
			{#each placeholders as placeholder}
				<div class="placeholder" style="background-color: {placeholder};">
					<Icon name="missingImage" viewBox="0 0 18 16" />
				</div>
			{/each}
		{:else}
			{#each sortedNfts as nft}
				<NftTableAsset
					name={nft.name}
					background={nft.defaultColor || collection.defaultColors}
					src={nft.previewImage}
					on:click={() => openDrawer(nft)}
				/>
			{/each}
		{/if}
	</svelte:fragment>
</NftTableContainer>

{#if selectedNft}
	<svelte:component
		this={detailComponent}
		bind:isOpen={isDetailDrawerOpen}
		nft={selectedNft}
		{collection}
	/>
{/if}

<style>
	.search {
		min-width: 175px;
		flex-grow: 1;
	}

	.search .icon {
		display: flex;
		align-items: center;
	}
	.sorting {
		min-width: 175px;
	}

	.placeholder {
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28px;
		color: rgba(245, 163, 18, 0.24);
	}
</style>
