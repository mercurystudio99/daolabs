<script lang="ts">
	import { onMount } from 'svelte';
	import { ethers, type ContractTransaction } from 'ethers';
	import AdvancedNftTypeModal from '$lib/components/AdvancedNftTypeModal.svelte';
	import NftTable from '$lib/components/collections/NftTable.svelte';
	import PfpNftTable from '$lib/components/collections/PfpNftTable.svelte';
	import Icon from '$lib/components/Icon';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import CreateImageNftModal from '$lib/components/minter/create/CreateImageNftModal.svelte';
	import CreateMusicNftModal from '$lib/components/minter/create/CreateMusicNftModal.svelte';
	import CreateP5NftModal from '$lib/components/minter/create/CreateP5NFTModal.svelte';
	import CreatePfpNftModal from '$lib/components/minter/create/CreatePfpNFTModal.svelte';
	import CreateVideoNftModal from '$lib/components/minter/create/CreateVideoNftModal.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import PricingWarningModal from '$lib/components/pricing/PricingWarningModal.svelte';
	import { NftType } from '$models/minter/nft-config';
	import { TokenStandard } from '$models/minter/token-standard';
	import { connectedAccount } from '$stores/web3';
	import { userdata } from '$utils/firebase';
	import { advancedNftPageOptions, advancedNftPageOwnerOptions } from '$utils/introjs/options';
	import { startIntroTour, startHint } from '$utils/introjs/intro-js';
	import {
		getSumNftTotalSupply,
		isCollectionDeployed,
		isPfpCollection,
		getNftContractAddress,
	} from '$utils/collectionHelpers';
	import { mint as mintToken } from '$utils/web3/extensions/NFTokenWrapper';
	import CommonCollection from '$lib/collection/CommonCollection.svelte';
	import { page } from '$app/stores';
	import type { AdvancedCollection } from '$models/minter/collection-config';

	export let collection: AdvancedCollection;
	export let saveCollection: (form: AdvancedCollection) => Promise<void>;
	export let showTool = false;
	export let showSettings = false;

	const shortcutToPfp = $page.url.searchParams.get('shortcutToPfp') === 'true';

	let introOptions: any;
	let hintOptions: any;
	let readonly = isCollectionDeployed(collection);
	let showTable = true;
	let nftFilter = 0;

	$: isConnectedUserOwner = $connectedAccount.toLowerCase() === collection.creator.toLowerCase();

	let handleStartIntro = () => {
		if (introOptions) startIntroTour(introOptions);
		if (hintOptions) startHint(hintOptions);
	};

	let getIntro = (_introOptions, _hintOptions = null) => {
		introOptions = _introOptions;
		hintOptions = _hintOptions;
	};

	const openNftCreationModal = (type: NftType, standard: TokenStandard) => {
		let component = null;

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

		openModal(bind(component, { standard, collection, saveCollection, getIntro }), {
			fullscreen: true,
			helpButton: true,
			handleStartIntro,
		});
	};

	const openNftTypeModal = () => {
		openModal(bind(AdvancedNftTypeModal, { openNftCreationModal, close: () => {} }));
	};

	const openPricing = () => {
		openModal(bind(PricingWarningModal, { collection, saveCollection, close: () => {} }));
	};

	onMount(() => {
		if (isConnectedUserOwner) {
			if (!collection.nfts) {
				if (shortcutToPfp) {
					openNftCreationModal(NftType.PFP, TokenStandard.ERC721);
				} else if ($userdata?.nftSettings) {
					openNftCreationModal($userdata.nftSettings.nftType, $userdata.nftSettings.tokenStandard);
				} else {
					return openNftTypeModal();
				}
			} else if (!collection.pricing) {
				return openPricing();
			}
		}
	});

	const handleStartIntroTour = () => {
		document.cookie = 'introjs-dontShowAgain=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
		startIntroTour(isConnectedUserOwner ? advancedNftPageOwnerOptions : advancedNftPageOptions);
	};

	async function mint({
		price,
		mintAmount,
	}: {
		price: number;
		mintAmount: number;
	}): Promise<ContractTransaction> {
		const contractAddress = getNftContractAddress(collection);
		const value = price * mintAmount;

		console.log('🦄 minting with args', {
			platform: 'daolabs',
			contractAddress,
			metadata: '0x00',
			opts: {
				value: ethers.utils.parseEther(value.toString()),
			},
		});
		const tx = await mintToken('daolabs', contractAddress, undefined, {
			value: ethers.utils.parseEther(value.toString()),
		});
		console.info('Minting tx', tx);
		return tx;
	}

	$: collectionSupply = collection.nfts instanceof Array && getSumNftTotalSupply(collection);
	$: shouldShowSimulation = collection.nfts?.length && isConnectedUserOwner;
</script>

<CommonCollection
	{collection}
	{collectionSupply}
	{handleStartIntroTour}
	bind:showTool
	bind:showSettings
	{nftFilter}
	{saveCollection}
	mintFunc={mint}
	draftBannerSteps={[
		{ label: 'Collection' },
		{ label: 'NFT', active: !collection.nfts && !collection.pricing },
		{ label: 'Pricing', active: collection.nfts && !collection.pricing },
		{ label: 'Deploy', active: Boolean(collection.nfts && collection.pricing) },
	]}
/>
<div class="nft-info simulation">
	{#if shouldShowSimulation && collection.nfts?.length > 0}
		<InfoBox>
			{#if !readonly}
				{#if isPfpCollection(collection)}
					<b>NOTE</b> The simulation picks a number of layering at random depending on the set supply
					as well as the conditionals for each layer.
				{:else}
					Simulation
				{/if}
			{:else}
				<b>NOTE</b> Only you as the creator can see the full set of NFTs in this collection, regardless
				of their minted state.
			{/if}
		</InfoBox>
		{#if showTable}
			{#if isPfpCollection(collection)}
				<PfpNftTable
					showShuffle={!readonly}
					{collection}
					{saveCollection}
					bind:currentNft={nftFilter}
				/>
			{:else}
				<NftTable {collection} />
			{/if}
		{/if}
		<div
			class="advanced-icon"
			on:click={() => {
				showTable = !showTable;
			}}
			on:keyup
		>
			{#if showTable}
				<Icon name="chevronUp" />
			{:else}
				<Icon name="chevronDown" />
			{/if}
		</div>
	{/if}
</div>

<style>
	.nft-info {
		margin: 16px auto 32px;
		display: flex;
		flex-direction: column;
		max-width: 1104px;
		padding: 0 24px;
	}
	.simulation {
		max-width: 2000px;
	}
	.advanced-icon {
		background-color: var(--background-l1);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		cursor: pointer;
		font-size: 18px;
		margin-top: 8px;
	}
	@keyframes fade {
		0% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
