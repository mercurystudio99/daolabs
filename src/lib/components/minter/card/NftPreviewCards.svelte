<script lang="ts">
	import { flip } from 'svelte/animate';
	import {
		NftType,
		type NftConfig,
		type PfpNftConfig,
		type ImageNftConfig,
		type MusicNftConfig,
		type VideoNftConfig,
		type P5NftConfig,
		isPfpNft,
		isImageNft,
		isEditionNft,
		isMusicNft,
		isVideoNft,
		isP5Nft,
		type BasicNftConfig,
		type EditionConfig,
	} from '$models/minter/nft-config';
	import Modal, { bind } from '$lib/components/Modal.svelte';

	import { getRandomColor } from '$utils/random';
	import touchHelperDirective from '$utils/touchHelper';
	import { getPreviewUrlForTokenId } from '$utils/p5js';

	import EditImageNft from '../edit/EditImageNft.svelte';
	import EditMusicNft from '../edit/EditMusicNft.svelte';
	import EditVideoNft from '../edit/EditVideoNft.svelte';
	import EditP5Nft from '../edit/EditP5Nft.svelte';
	import EditPfpNft from '../edit/EditPfpNft.svelte';
	import EditEditionNft from '../edit/EditEditionNft.svelte';
	import NftPreviewCard from './NftPreviewCard.svelte';

	export let savedNfts: BasicNftConfig[];
	export let deleteNft: (index: number) => void = null;
	export let updateNft: (form: BasicNftConfig) => void;
	export let updateOrder: (list: NftConfig[] | EditionConfig[]) => void;
	export let colors: string[];
	export let readonly: boolean = false;

	let formModal: ReturnType<typeof bind>;

	function getPreviewImageForNfts(nfts: BasicNftConfig[]) {
		if (!nfts || nfts.length === 0) return;
		if (isImageNft(nfts[0]) || isEditionNft(nfts[0])) {
			return (nfts as ImageNftConfig[]).map((nft) => nft.file);
		}
		if (isMusicNft(nfts[0])) {
			return (nfts as MusicNftConfig[]).map((nft) => nft.albums[0].cover);
		}
		if (isVideoNft(nfts[0])) {
			return (nfts as VideoNftConfig[]).map((nft) => nft.cover);
		}
		if (isP5Nft(nfts[0])) {
			return (nfts as P5NftConfig[]).map((nft) => getPreviewUrlForTokenId(nft, 1));
		}
		return;
	}

	const restoreProperties = (nft: NftConfig) => {
		if (!nft.attributes) {
			nft.attributes = {
				properties: [],
				levels: [],
				stats: [],
				boosts: [],
			};
		} else {
			nft.attributes = {
				properties: nft.attributes.properties ?? [],
				levels: nft.attributes.levels ?? [],
				stats: nft.attributes.stats ?? [],
				boosts: nft.attributes.boosts ?? [],
			};
		}
		return nft;
	};

	const openEditModal = (nft: NftConfig) => {
		let component: any;
		const nftForm = restoreProperties(nft);
		switch (nft._type) {
			case NftType.IMAGE:
				component = EditImageNft;
				break;
			case NftType.EDITION:
				component = EditEditionNft;
				break;
			case NftType.MUSIC:
				component = EditMusicNft;
				break;
			case NftType.VIDEO:
				component = EditVideoNft;
				break;
			case NftType.P5JS:
				component = EditP5Nft;
				break;
			case NftType.PFP:
				component = EditPfpNft;
				break;
		}
		formModal = bind(component, { nft: nftForm, updateNft });
	};
	const getBackgroundColor = (nft: BasicNftConfig) => {
		if (nft.defaultColor) {
			return nft.defaultColor;
		}
		if (isPfpNft(nft)) {
			return getRandomColor(nft.defaultColors ?? colors);
		}
		return getRandomColor(colors);
	};
	const getPfpDescription = (pfp: PfpNftConfig): string => {
		return pfp
			? `${pfp.layers.length} layer(s): ${pfp.layers.map((attr) => attr.name).join(', ')}`
			: '';
	};

	$: previewImages = getPreviewImageForNfts(savedNfts);
</script>

<div class="container">
	{#if savedNfts.length > 0}
		<section class="nfts-container" use:touchHelperDirective>
			{#each savedNfts as nft, index (nft._id || nft.name)}
				<div animate:flip>
					<NftPreviewCard
						{index}
						{nft}
						{savedNfts}
						previewImage={previewImages ? previewImages[index] : ''}
						{deleteNft}
						{updateOrder}
						{openEditModal}
						assetStyle={{ backgroundColor: getBackgroundColor(nft) }}
						description={isPfpNft(nft) && !nft.description
							? getPfpDescription(nft)
							: nft.description}
						{readonly}
					/>
				</div>
			{/each}
		</section>
		<div class="additional-info">
			{#if savedNfts.length > 1}
				<i>Drag to reorder</i>
			{/if}
			<i>Double-click to edit</i>
		</div>
	{/if}
</div>
<Modal
	on:close={() => {
		formModal = undefined;
	}}
	show={formModal}
/>

<style lang="scss">
	.additional-info {
		display: flex;
		flex-direction: column;
		font-size: 12px;
		color: var(--text-tertiary);
		text-align: right;
	}
	.container {
		display: flex;
		flex-direction: column;
	}
	.container .nfts-container {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>
