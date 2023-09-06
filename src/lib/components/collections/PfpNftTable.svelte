<script lang="ts">
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import { randomGenerator } from '$lib/utils/sfc32';
	import { samplePermutationsFromGenerator, calculateRarity, type ShuffledNft } from '$utils/pfp';
	import Icon from '$lib/components/Icon';
	import NftTableAsset from '$lib/collection/NftTableAsset.svelte';
	import { layouts } from '$constants/styles/layouts';
	import Dropdown from '../Dropdown.svelte';
	import PfpLayering from '../minter/preview/PFPLayering.svelte';
	import PfpDetailDrawer from '../minter/review-drawer/PfpDetailDrawer.svelte';
	import Popover from '../Popover.svelte';
	import { bind, openModal } from '../Modal.svelte';
	import ConfirmModal from '../ConfirmModal.svelte';
	import NftTableContainer from './NftTableContainer.svelte';
	import NftTableSidebar from './NftTableSidebar.svelte';
	import NftTableViewIcon from './NftTableViewIcon.svelte';
	import type { PfpAttribute, PfpNftConfig, PfpProperty } from '$models/minter/nft-config';
	import type { PfpCollection } from '$models/minter/collection-config';
	import type { DropzoneOutput } from '$models/minter/dropzone';

	export let collection: PfpCollection;
	export let saveCollection: (form: PfpCollection) => Promise<void>;
	export let view: 'small' | 'large' = 'large';
	export let showShuffle = true;
	export let currentNft = 0;

	let selectedNft: boolean | any = false;
	let isOpen = false;
	let shuffledNft: ShuffledNft[] = [];
	let nftFilters: { label: string; value: number }[];
	let scrollTarget: HTMLElement;
	let pageSize = 100;
	let initLoad = true;
	let sidebarView = false;
	let innerWidth: number = 1000;

	let attributeFilters: AttributeFilter[];

	type OptionValue = {
		name: string;
		file: DropzoneOutput;
	};

	type FilterOption = {
		label: string;
		selected: boolean;
		value: OptionValue;
	};

	type AttributeFilter = {
		label: string;
		options: FilterOption[];
	};

	function prepareName(name: string) {
		return name.replace(/[^a-zA-Z0-9]/g, ' ');
	}

	function getOptionsFromAttributeProperties(attribute: PfpAttribute) {
		const filter = {
			label: attribute.name,
			options: attribute.properties.map((property: PfpProperty) => {
				const name = prepareName(property.name);
				return {
					label: name,
					value: {
						name,
						file: property.file,
					},
					selected: true,
				};
			}),
		};
		filter.options = [{ label: '--', value: null, selected: true }, ...filter.options];
		return filter;
	}

	function getAttributeFilters(nfts: PfpNftConfig[], currentNftIndex: number): AttributeFilter[] {
		if (nfts && nfts.length > 0) {
			const nft = nfts[currentNftIndex];
			const attributes = nft.layers || [];
			const options = attributes.map(getOptionsFromAttributeProperties);
			sidebarView = innerWidth < layouts.screen.xs;
			return options;
		}
		return [];
	}

	function onSelect(e: CustomEvent<{ value: OptionValue }>, filter: AttributeFilter) {
		const { value } = e.detail;
		attributeFilters = attributeFilters.map((attr) => {
			if (attr.label === filter.label) {
				return {
					...attr,
					options: attr.options.map((opt) => {
						return {
							...opt,
							selected: value
								? opt.value && opt.value.name === value.name
								: opt.value !== undefined,
						};
					}),
				};
			}
			return attr;
		});
	}

	function samplePermutations(
		isInitial: boolean,
		attributes: PfpAttribute[],
		max: number,
	): ShuffledNft[] {
		const { seed, rand } = randomGenerator((isInitial && collection.nfts[currentNft].seed) || '');
		if (collection.nfts[currentNft].seed !== seed) {
			collection.nfts[currentNft].seed = seed;
			saveCollection(collection).catch((err) => console.error(err));
		}
		return samplePermutationsFromGenerator(rand, attributes, max);
	}

	function filtered(nft: ShuffledNft) {
		// TODO: refactor this filter thing, widly inefficient atm
		for (const file of Object.values(nft))
			for (const filter of attributeFilters)
				for (const option of filter.options) {
					if (file.name === option.label && !option.selected) return false;
				}
		return true;
	}

	function shuffleNft() {
		const attrs = collection.nfts[currentNft].layers;
		const totalAmount = collection.nfts[currentNft].totalSupply;
		shuffledNft = samplePermutations(initLoad, attrs, Number(totalAmount));
	}

	function confirmShuffleNft() {
		openModal(
			bind(ConfirmModal, {
				message: 'Are you sure you want to shuffle? You will not be able to undo this.',
				close: () => {},
				onConfirm: shuffleNft,
			}),
		);
	}

	const getMore = () => {
		if (pageSize < shuffledNft.length) pageSize += 100;
	};

	const nftDropdownSelected = (event: CustomEvent<{ value: number }>) => {
		currentNft = event.detail.value;
		initLoad = true;
	};

	const filterDropdownSelected =
		(filter: AttributeFilter) => (event: CustomEvent<{ value: OptionValue }>) => {
			onSelect(event, filter);
		};

	function calculateRarityForLayer(layer: string, attribute: PfpProperty) {
		return calculateRarity(shuffledNft, layer, attribute);
	}

	$: if (initLoad) {
		shuffleNft();
		initLoad = false;
	}
	$: attributeFilters = getAttributeFilters(collection.nfts, currentNft);
	$: nftFilters = collection.nfts.map((nft, index) => ({
		label: nft.name || `NFT ${index + 1}`,
		value: index,
	}));
</script>

<svelte:window bind:innerWidth />

<NftTableContainer bind:nftContainer={scrollTarget} bind:view bind:sidebarView>
	<svelte:fragment slot="headerAddons">
		<div class="nftFilters">
			{#if collection.nfts.length > 1}
				<Dropdown bind:value={currentNft} options={nftFilters} on:select={nftDropdownSelected} />
			{/if}
		</div>
		{#if showShuffle}
			<Popover placement="top" message="Shuffle PFPs into new combinations.">
				<NftTableViewIcon on:click={confirmShuffleNft}>
					<Icon name="shuffleLayers" style="height: 1.5em; width: 2em" />
				</NftTableViewIcon>
			</Popover>
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="sidebar">
		<NftTableSidebar
			label="Attributes"
			filters={attributeFilters}
			onSelect={filterDropdownSelected}
		/>
	</svelte:fragment>
	<svelte:fragment slot="nfts">
		{#each shuffledNft as nft, index}
			{#if attributeFilters && filtered(nft) && index < pageSize}
				<NftTableAsset
					name="{collection.nfts[currentNft || 0].name} #{index + 1}"
					on:click={() => {
						isOpen = true;
						selectedNft = {
							// TODO: this will be reset for each nft nft, which we switch in a dropdown,
							// so we need to add on the index from the previouses nfts supply/sum.
							_token: index + 1,
							layers: nft,
						};
					}}
				>
					<PfpLayering
						layers={Object.values(nft)}
						style={{ height: '100%', width: '100%' }}
						imgStyle={{ minHeight: view === 'large' ? '150px' : '100px' }}
					/>
				</NftTableAsset>
			{/if}
		{/each}
	</svelte:fragment>
	<svelte:fragment slot="footer">
		<InfiniteScroll
			elementScroll={scrollTarget}
			disableBody={false}
			threshold={100}
			hasMore={pageSize < shuffledNft.length}
			on:loadMore={() => getMore()}
		/>
	</svelte:fragment>
</NftTableContainer>

{#if isOpen}
	<PfpDetailDrawer
		{selectedNft}
		bind:isOpen
		{collection}
		nft={{ ...collection.nfts[currentNft || 0], _token: selectedNft._token }}
		{calculateRarityForLayer}
	/>
{/if}

<style lang="scss">
	.nftFilters {
		min-width: 175px;
	}
</style>
