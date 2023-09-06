<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import NftPreviewCards from '$lib/components/minter/card/NftPreviewCards.svelte';
	import { TokenStandard } from '$models/minter/token-standard';
	import { startIntroTour, startHint } from '$utils/introjs/intro-js';
	import AdvancedNftTypeModal from '$lib/components/AdvancedNftTypeModal.svelte';
	import CreateImageNftModal from '$lib/components/minter/create/CreateImageNftModal.svelte';
	import CreateMusicNftModal from '$lib/components/minter/create/CreateMusicNftModal.svelte';
	import CreateP5NftModal from '$lib/components/minter/create/CreateP5NFTModal.svelte';
	import CreateVideoNftModal from '$lib/components/minter/create/CreateVideoNftModal.svelte';
	import CreatePfpNftModal from '$lib/components/minter/create/CreatePfpNFTModal.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';

	import { NftType, type NftConfig } from '$models/minter/nft-config';
	import type { AdvancedCollection } from '$models/minter/collection-config';
	import type Store from '$utils/Store';

	export let collection: AdvancedCollection;
	export let nfts: Store<NftConfig[]>;
	export let saveCollection: (collection: AdvancedCollection) => Promise<void>;
	export let createForm: (collection: AdvancedCollection) => NftConfig[];

	let changed = false;
	let introOptions: any;
	let hintOptions: any;

	const handleStartIntro = () => {
		if (introOptions) startIntroTour(introOptions);
		if (hintOptions) startHint(hintOptions);
	};

	const getIntro = (_introOptions, _hintOptions = null) => {
		introOptions = _introOptions;
		hintOptions = _hintOptions;
	};

	const deleteDumpNft = (index: number) => {
		nfts.update((tokens) => {
			tokens.splice(index, 1);
			return tokens;
		});
	};
	const deleteNft = (index: number) => {
		deleteDumpNft(index);
		collection.nfts = $nfts;
	};
	const updateOrder = (list: NftConfig[]) => {
		$nfts = list;
	};

	const updateNft = (form: NftConfig) => {
		const nftIndex = $nfts.findIndex((i) => i._id === form._id);
		$nfts[nftIndex] = form;
	};

	const saveChanges = async () => {
		collection.nfts = $nfts;
		await saveCollection(collection);
	};

	const openNftCreationModal = (type: NftType, standard: TokenStandard) => {
		let component: any;
		switch (type) {
			case NftType.IMAGE:
				component = CreateImageNftModal;
				break;
			case NftType.MUSIC:
				component = CreateMusicNftModal;
				break;
			case NftType.VIDEO:
				component = CreateVideoNftModal;
				break;
			case NftType.P5JS:
				component = CreateP5NftModal;
				break;
			case NftType.PFP:
				component = CreatePfpNftModal;
				break;
		}
		openModal(bind(component, { standard, collection, saveCollection, deleteDumpNft, getIntro }), {
			fullscreen: true,
			helpButton: true,
			handleStartIntro,
		});
	};

	const openNftTypeModal = () => {
		openModal(bind(AdvancedNftTypeModal, { openNftCreationModal, close }));
	};

	$: initialState = createForm(collection);
	$: {
		const faultySupplyExists = $nfts.some((nft) => {
			if (!nft.totalSupply) {
				return true;
			}
		});

		changed = faultySupplyExists ? false : JSON.stringify($nfts) !== JSON.stringify(initialState);
	}
</script>

<div class="box">
	<h4>Configure NFT setup</h4>
	{#if $nfts.length === 0}
		{#if initialState.length != 0}
			<p>You just removed all your NFTs for this collection. Create new one or save changes.</p>
		{:else}
			<p>You have not created any NFT for this collection yet</p>
		{/if}
		<Button size="md" on:click={openNftTypeModal}>Create</Button>
	{:else}
		<NftPreviewCards
			savedNfts={$nfts}
			{deleteNft}
			{updateOrder}
			{updateNft}
			on:seemlessInputChanged={() => nfts.update((tokens) => tokens)}
			colors={collection.defaultColors}
		/>
		<Button
			size="md"
			type="secondary"
			on:click={() =>
				openNftCreationModal(nfts.get()[0]._type, collection.standard || TokenStandard.ERC721)}
		>
			Open Creation Modal
		</Button>
	{/if}
	<Button
		size="md"
		type={changed ? 'primary' : 'tertiary'}
		on:click={saveChanges}
		disabled={!changed}
	>
		Save changes
	</Button>
</div>

<style lang="scss">
	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;

		h4 {
			font-size: 16px;
			font-weight: 400;
			color: var(--text-header);
			margin-bottom: 0;
		}
		p {
			font-weight: 400;
			color: var(--text-secondary);
			margin-bottom: 0;
		}
	}
</style>
