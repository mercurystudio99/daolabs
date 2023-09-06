<script lang="ts">
	import { onMount } from 'svelte';
	import { getPfpTokenIdMetadataJson, type OpenseaMetadata } from '$utils/collectionMetadata';
	import { getPFPLayerings, type ShuffledNft } from '$utils/pfp';
	import PreviewJsonModal from './PreviewJsonModal.svelte';
	import InfoSpaceBetween from './InfoSpaceBetween.svelte';
	import Dropdown from './Dropdown.svelte';
	import Icon from './Icon';
	import type { PfpNftConfig } from '$models/minter/nft-config';
	import type { PfpCollection } from '$models/minter/collection-config';
	import type { DropdownOption } from './Dropdown';

	/**
	 * There's a case where this is messed up; if assets are pushed, but then layers are
	 * updated and characters shuffled, the attributes won't be right
	 */

	export let collection: PfpCollection;

	let metadata: OpenseaMetadata;
	let currentNft: PfpNftConfig;
	let currentNftIndex = 0;
	let currentIndex = 0;
	let populationDropdownOptions: DropdownOption[] = [];

	let populationCharacters: ShuffledNft[][] = [];

	function initialise() {
		const characters = populationCharacters[currentNftIndex];
		metadata = getPfpTokenIdMetadataJson(collection, currentNftIndex, currentIndex, characters);
	}

	function changePopulation(e: CustomEvent) {
		currentIndex = 0;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		currentNftIndex = e.detail.value;
		currentNft = collection.nfts[currentNftIndex];
		if (!populationCharacters[currentNftIndex]) {
			const characters = getPFPLayerings(collection, currentNftIndex);
			populationCharacters[currentNftIndex] = characters;
		}
		initialise();
	}

	function changeTokenId(increment: number) {
		currentIndex = (currentIndex + increment) % +currentNft.totalSupply;
		initialise();
	}

	onMount(() => {
		const characters = getPFPLayerings(collection, 0);
		populationCharacters[0] = characters;
		currentNftIndex = collection.nfts.findIndex((nft) => nft.ipfs);
		currentNft = collection.nfts[currentNftIndex];
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
		populationDropdownOptions = collection.nfts
			.filter((p) => p.ipfs)
			.map((nft: PfpNftConfig, index: number) => {
				return {
					value: index,
					label: nft.name || `NFT ${index + 1}`,
				};
			});
		initialise();
	});
</script>

<header>
	<InfoSpaceBetween>
		<div slot="left">
			{#if currentIndex > 0}
				<button on:click={() => changeTokenId(-1)} class="noStyle">
					<Icon name="caret" direction="s" />
				</button>
			{/if}
			ID: {currentIndex + 1}/{currentNft?.totalSupply}
			{#if currentIndex < +currentNft?.totalSupply - 1}
				<button on:click={() => changeTokenId(1)} class="noStyle">
					<Icon name="caret" />
				</button>
			{/if}
		</div>
		<div slot="right">
			{#if populationDropdownOptions.length > 1}
				<Dropdown
					size="xs"
					options={populationDropdownOptions}
					value={populationDropdownOptions[0].value}
					on:select={changePopulation}
				/>
			{/if}
		</div>
	</InfoSpaceBetween>
</header>

<PreviewJsonModal json={JSON.stringify(metadata, null, 2)} />

<style>
	header {
		max-width: calc(100% - 2rem);
	}

	div[slot='left'] {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	div[slot='right'] {
		min-width: 100px;
	}

	button.noStyle {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		line-height: 0;
	}
</style>
