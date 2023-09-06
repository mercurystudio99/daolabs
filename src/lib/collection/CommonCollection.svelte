<script lang="ts">
	import { onMount } from 'svelte';
	import {
		isCollectionDeployed,
		getNftContractAddress,
		isAdvancedCollection,
		isSimpleCollection,
	} from '$utils/collectionHelpers';
	import DropzoneModal from '$lib/components/DropzoneModal.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import SlideUpInfo from '$lib/components/SlideUpInfo.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import LinksDisplay from '$lib/components/LinksDisplay.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import { copyToClipboard } from '$utils/clipboard';
	import BannerNotice from '$lib/components/BannerNotice.svelte';
	import { connectedAccount } from '$stores/web3';
	import Icon from '$lib/components/Icon';
	import Img from '$lib/components/Img.svelte';
	import ImageViewer from '$lib/components/ImageViewer.svelte';
	import NavigationBar from '$lib/components/views/NavigationBar.svelte';
	import { replaceIpfsDomain, ipfsCidUrl } from '$utils/ipfs';
	import IpfsTooltip from '$lib/components/IpfsCidTooltip.svelte';
	import { getNftContracts, getRecentMints } from '$data/nft';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import { userdata } from '$utils/firebase';
	import CollectionStats from './CollectionStats.svelte';
	import RecentMints from './RecentMints.svelte';
	import MintSection from './MintSection.svelte';
	import EditionMintSection from './EditionMintSection.svelte';
	import type { Collection } from '$models/minter/collection-config';
	import type { NftContract } from '$models/subgraph-entities/v2/nft-contract';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	import type { ContractTransaction } from 'ethers';

	export let collection: Collection;
	export let collectionSupply: number;
	export let saveCollection: (form: Collection) => Promise<void>;
	export let handleStartIntroTour: () => void;
	export let draftBannerSteps: { label: string; active?: boolean }[] = [];
	export let mintFunc: (args: any) => Promise<ContractTransaction>;

	export let showTool: boolean;
	export let showSettings: boolean;
	export let nftFilter: number;

	let minters = [];
	let stats: NftContract;
	let showBannerUpload = false;
	let showLogoUpload = false;
	let displayViewer = false;

	const openTool = () => {
		showTool = true;
	};
	const openSettings = () => {
		showSettings = true;
	};

	async function readContract() {
		// Get recent NFTs
		const contractAddress = getNftContractAddress(collection);
		minters = await getRecentMints({ contractAddress, pageSize: 5 });
		// Get contract stats
		const response = await getNftContracts({ id: contractAddress.toLowerCase() });
		stats = response?.[0];
	}

	const openBannerDropzone = () => {
		openModal(
			bind(DropzoneModal, {
				title: 'Edit banner',
				accept: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
				saveChanges: (file: DropzoneOutput) => {
					if (!file) {
						collection.banner = '';
					} else {
						collection.banner = ipfsCidUrl(file.pinInfo.IpfsHash);
					}
					if ($userdata) {
						saveCollection(collection).catch((e) => console.log(e));
					}
				},
				close: () => {},
			}),
		);
	};

	const discardBanner = () => {
		collection.banner = '';
		saveCollection(collection).catch((e) => console.log(e));
	};

	const openLogoDropzone = (event: MouseEvent) => {
		event.stopPropagation();
		openModal(
			bind(DropzoneModal, {
				title: "Edit collection's profile picture",
				accept: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
				saveChanges: (file: DropzoneOutput) => {
					if (!file) {
						collection.logo = '';
					} else {
						collection.logo = ipfsCidUrl(file.pinInfo.IpfsHash);
					}
					if ($userdata) {
						saveCollection(collection).catch((e) => console.log(e));
					}
				},
				close: () => {},
			}),
		);
	};

	const discardLogo = () => {
		collection.logo = '';
		saveCollection(collection).catch((e) => console.log(e));
	};

	onMount(async () => {
		if (isCollectionDeployed(collection)) {
			await readContract();
		}
	});

	$: isDeployed = isCollectionDeployed(collection);
	$: isConnectedUserOwner = $connectedAccount.toLowerCase() === collection.creator.toLowerCase();
</script>

{#if isDeployed}
	{@const contractAddress = getNftContractAddress(collection)}
	<BannerNotice type="active">
		<div class="infoBanner contractAddress">
			<Popover message="Copy to clipboard">
				<SlideUpInfo onClick={() => copyToClipboard(contractAddress)}>
					<span class="active">{contractAddress}</span>
				</SlideUpInfo>
			</Popover>
		</div>
	</BannerNotice>
{:else if isConnectedUserOwner}
	{#if draftBannerSteps.length > 0}
		<BannerNotice type="info">
			<div class="infoBanner">
				{#each draftBannerSteps as step, index}
					<span class:active={step.active}>{step.label}</span>
					{#if index < draftBannerSteps.length - 1}
						<Icon name="arrowRight" />
					{/if}
				{/each}
			</div>
		</BannerNotice>
	{/if}
{:else}
	<BannerNotice type="active">
		<div class="infoBanner">
			<span class="active">Draft</span>
		</div>
	</BannerNotice>
{/if}
{#if collection.banner}
	<div
		class="banner"
		class:logoOverlap={collection.logo}
		on:mouseleave={() => {
			showBannerUpload = false;
		}}
		on:touchend={() => {
			showBannerUpload = false;
		}}
		on:mouseenter={() => {
			showBannerUpload = true;
		}}
		on:touchstart={() => {
			showBannerUpload = true;
		}}
	>
		{#if showBannerUpload && isConnectedUserOwner && !isDeployed}
			<div class="banner-edit">
				<div class="icon" on:click={openBannerDropzone} on:keydown>
					<Icon name="edit" viewBox="0 0 36 36" />
				</div>
			</div>
			<CloseButton position="8px" on:click|once={discardBanner} color="--icon-action-primary" />
		{/if}
		<Img
			src={replaceIpfsDomain(collection.banner)}
			placeholder={`https://via.placeholder.com/${212}?text=...`}
			alt="Collection banner"
			styles={{
				width: '100%',
				height: '212px',
				objectFit: 'cover',
			}}
		/>
	</div>
{/if}
{#if collection.logo}
	<div
		class="logo"
		class:hover={showLogoUpload}
		on:mouseleave={() => {
			showLogoUpload = false;
		}}
		on:touchend={() => {
			showLogoUpload = false;
		}}
		on:mouseenter={() => {
			showLogoUpload = true;
		}}
		on:touchstart={() => {
			showLogoUpload = true;
		}}
		on:click={() => (displayViewer = true)}
		on:keydown
	>
		{#if showLogoUpload && isConnectedUserOwner && !isDeployed}
			<div class="logo-edit">
				<div class="icon" on:click={openLogoDropzone} on:keydown>
					<Icon name="edit" viewBox="0 0 36 36" />
				</div>
			</div>
			<CloseButton
				size="0.5rem"
				position="8px"
				on:click|once={discardLogo}
				color="--icon-action-primary"
			/>
		{/if}
		<Img
			src={replaceIpfsDomain(collection.logo)}
			alt="Collection logo"
			placeholder={`https://via.placeholder.com/${100}?text=...`}
			styles={{ borderRadius: '10px', maxHeight: '100%' }}
		/>
	</div>
{/if}

<div class="collection-info" class:margin={!collection.logo}>
	<NavigationBar
		{handleStartIntroTour}
		{openTool}
		{openSettings}
		collectionCreator={collection.creator}
		connectedAccount={$connectedAccount}
	/>
	<h2>{collection.name}</h2>
	<div class="row">
		<div>
			by
			<span class="owner">
				<EnsOrAddress address={collection.creator} />
			</span>
		</div>
	</div>
	<!-- NOTE: for some reason I just can't specify this row in css; .collection-info .row:last-of-type -->
	<div class="row" style="margin-top: 4px;">
		{#if collection.symbol}
			<span class="symbol">
				${collection.symbol}
			</span>
		{/if}
		{#if isAdvancedCollection(collection) && collection.links?.length > 0}
			<LinksDisplay links={collection.links} />
		{/if}
		{#if collection.ipfsMetadata}
			<IpfsTooltip cid={collection.ipfsMetadata?.IpfsHash} />
		{/if}
	</div>
	<p class="description">
		{collection.description}
	</p>
	<CollectionStats {collection} {collectionSupply} collectionStats={stats} />
</div>
<div class="nft-info">
	{#if isSimpleCollection(collection)}
		<EditionMintSection
			{collection}
			{collectionSupply}
			collectionStats={stats}
			{isConnectedUserOwner}
			{isDeployed}
			mintCallback={readContract}
			{mintFunc}
			{saveCollection}
		/>
	{:else if isAdvancedCollection(collection)}
		<MintSection
			{collection}
			{collectionSupply}
			collectionStats={stats}
			{isConnectedUserOwner}
			{isDeployed}
			mintCallback={readContract}
			{nftFilter}
			{mintFunc}
			{saveCollection}
		/>
	{/if}
	<RecentMints {isConnectedUserOwner} recentMints={minters} />
</div>
{#if displayViewer}
	<ImageViewer src={replaceIpfsDomain(collection.logo)} close={() => (displayViewer = false)} />
{/if}

<style>
	.infoBanner {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.infoBanner span.active {
		font-weight: 900;
	}
	.infoBanner span {
		text-transform: uppercase;
	}
	.infoBanner,
	.contractAddress {
		cursor: pointer;
	}
	.contractAddress span {
		text-transform: none;
	}
	.banner {
		box-shadow: var(--background-l1) 10px 10px;
		max-height: 212px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		position: relative;
	}
	.logoOverlap {
		margin-bottom: -75px;
	}
	.banner-edit {
		display: flex;
		cursor: pointer;
		font-size: 20px;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		z-index: 1;
	}
	.banner-edit .icon {
		padding: 12px;
		background: var(--background-l0);
		border-radius: 50%;
		display: flex;
	}
	.logo {
		position: relative;
		width: 150px;
		height: 150px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 32px auto 0;
	}
	.logo.hover {
		border: 1px solid var(--stroke-primary);
		border-radius: 10px;
	}
	.logo-edit {
		display: flex;
		cursor: pointer;
		font-size: 16px;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		z-index: 1;
	}
	.logo-edit .icon {
		padding: 8px;
		background: var(--background-l0);
		border-radius: 50%;
		display: flex;
	}
	.collection-info {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 1104px;
		margin: 0 auto;
		padding: 0 24px;
	}
	.collection-info .row {
		display: flex;
		gap: 32px;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
	}

	.collection-info .row span {
		white-space: nowrap;
	}
	.collection-info .row .symbol {
		text-transform: uppercase;
		font-size: 14px;
		color: var(--text-tertiary);
		margin: 0;
		white-space: nowrap;
	}
	.collection-info .row .owner {
		white-space: nowrap;
		margin: 0;
		font-size: 14px;
		color: var(--text-action-primary);
	}
	.collection-info h2 {
		font-size: 40px;
		color: var(--text-secondary);
		margin: 0;
	}
	.collection-info .description {
		margin-top: 18px;
		color: var(--text-tertiary);
		text-align: justify;
	}
	.collection-info .row:last-of-type {
		margin-top: 16px;
	}
	.margin {
		margin-top: 32px;
	}
	.nft-info {
		margin: 16px auto 32px;
		display: flex;
		flex-direction: column;
		max-width: 1104px;
		padding: 0 24px;
	}
</style>
