<script lang="ts">
	import { onMount } from 'svelte';
	import { deepCopy } from '$utils/object';
	import { ipfsCidUrl } from '$utils/ipfs';
	import TimeSection from '$lib/components/sections/TimeSection.svelte';
	import RoyaltySection from '$lib/components/sections/RoyaltySection.svelte';
	import { handleRevenueSplitChange } from '$utils/users/revenueSplitsHelpers';
	import DeployNft from '$lib/collection/DeployNft.svelte';
	import { createSymbolForCollection } from '$utils/collectionHelpers';
	import { isCurrentUserSpaceCadet } from '$utils/users/user';
	import DeployedNftInfo from '$lib/collection/DeployedNftInfo.svelte';
	import CreateSimpleNftForm from '$lib/components/minter/create/CreateSimpleNftForm.svelte';
	import CloseButton from '../CloseButton.svelte';
	import Button from '../Button.svelte';
	import DropzoneModal from '../DropzoneModal.svelte';
	import { bind, openModal } from '../Modal.svelte';
	import Textarea from '../Textarea.svelte';
	import PopInfo from '../PopInfo.svelte';
	import FormInput from '../minter/form/FormInput.svelte';
	import HeavyBorderBox from '../HeavyBorderBox.svelte';
	import EditionPayoutReceiverSection from '../sections/EditionPayoutReceiverSection.svelte';
	import IpfsMetadataSection from '../sections/IpfsMetadataSection.svelte';
	import ContractInfo from '../ContractInfo.svelte';
	import NftPreviewCards from '../minter/card/NftPreviewCards.svelte';
	import CollectionSection from '../sections/CollectionSection.svelte';
	import type { SimpleCollection, Royalty } from '$models/minter/collection-config';
	import type { EditionConfig } from '$models/minter/nft-config';
	import type { PinataPinResponse } from 'pinata_ipfs_sdk';

	export let collection: SimpleCollection;
	export let saveCollection: (form: SimpleCollection) => Promise<void>;
	export let readonly: boolean = false;

	let maxSupply: number;
	let savingData = false;
	let royaltyReceiversChanged = false;
	let payoutError: string;

	const handleFileDiscard = (property: 'banner' | 'logo' | 'file') => {
		collection[property] = undefined;
	};

	const addBanner = () => {
		openModal(
			bind(DropzoneModal, {
				title: 'Edit banner',
				accept: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
				saveChanges: (file) => {
					if (!file) {
						return handleFileDiscard('banner');
					}
					collection.banner = ipfsCidUrl(file.pinInfo.IpfsHash as string);
				},
				close: () => {},
			}),
		);
	};
	const addLogo = () => {
		openModal(
			bind(DropzoneModal, {
				title: 'Edit logo',
				accept: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
				saveChanges: (file) => {
					if (!file) {
						return handleFileDiscard('logo');
					}
					collection.logo = ipfsCidUrl(file.pinInfo.IpfsHash as string);
				},
				close: () => {},
			}),
		);
	};

	function metadataPinned(e: CustomEvent<{ ipfs: PinataPinResponse }>) {
		collection.ipfsMetadata = e.detail.ipfs;
	}

	const initialState = deepCopy(collection);

	const deleteRoyalty = () => {
		collection.royalty = null;
	};
	const updateRoyalty = (royalty: Royalty) => {
		collection.royalty = royalty;

		royaltyReceiversChanged =
			JSON.stringify(initialState.royalty?.creator_address) !=
			JSON.stringify(collection.royalty?.creator_address);
	};

	const updateNft = (edition: EditionConfig) => {
		collection.editions = collection.editions.map((_edition: EditionConfig) => {
			if (_edition._id === edition._id) {
				return edition;
			}
			return _edition;
		});
	};

	const updateOrder = (nfts: EditionConfig[]) => {
		collection.editions = nfts;
	};

	const deleteNft = (index: number) => {
		collection.editions = collection.editions.filter((_, i) => i !== index);
	};

	const submit = async () => {
		savingData = true;
		try {
			// TODO: Need to handle it in EditCollectionDrawer but due to
			// collection is bind there it's not possible to handle diff there
			const updatedRoyaltyReceiver = await handleRevenueSplitChange(
				initialState.royalty?.creator_address,
				collection.royalty?.creator_address,
				collection.name,
				'collectionRoyalty',
			);
			if (updatedRoyaltyReceiver) {
				collection.royalty.creator_address = updatedRoyaltyReceiver;
			}

			const updatedPayoutReciver = await handleRevenueSplitChange(
				initialState?.payoutAddress,
				collection?.payoutAddress,
				collection.name,
				'collectionPricing',
			);
			if (updatedPayoutReciver) {
				collection.payoutAddress = updatedPayoutReciver;
			}
			if (!collection.symbol) {
				collection.symbol = createSymbolForCollection(collection);
			}
			collection.totalSupply = maxSupply;
			await saveCollection(collection);
		} catch (error) {
			console.log(
				error instanceof Error ? `Collection's update has failed: ${error.message}` : error,
			);
		} finally {
			savingData = false;
		}
	};

	onMount(() => {
		if (!collection.payoutAddress) {
			collection.payoutAddress = collection.creator;
		}
	});

	$: changed = Object.keys(collection).some(
		(key) => JSON.stringify(collection[key]) !== JSON.stringify(initialState[key]),
	);

	$: totalEditionSupply = collection.editions.reduce((acc, edition) => {
		return acc + Number(edition.totalSupply);
	}, 0);
	$: maxSupply = Math.max(totalEditionSupply, collection.totalSupply);
</script>

{#if readonly}
	<DeployedNftInfo>
		<ContractInfo contract={collection.contracts.nft} />
	</DeployedNftInfo>
{/if}
{#if (readonly && isCurrentUserSpaceCadet()) || !readonly}
	<HeavyBorderBox>
		<DeployNft {collection} saveCollection={submit} />
	</HeavyBorderBox>
{/if}
<HeavyBorderBox>
	<FormInput
		id="name"
		label="Name"
		info="Collection or Contract name"
		placeholder="Collection name"
		description="Your collection’s name"
		required
		{readonly}
		bind:value={collection.name}
	/>
	<FormInput
		id="symbol"
		label="Symbol"
		info="Short 4-6 characters usually all caps and not super important for NFTs"
		placeholder="SYMBOL"
		description="Your NFT’s symbol. If blank then will be generated for you from name."
		{readonly}
		bind:value={collection.symbol}
	/>
	<Textarea
		id="description"
		label="Description"
		info="Tooltip text"
		placeholder="This is example of a default description."
		bind:value={collection.description}
		rows="4"
		{readonly}
		maxlength={1000}
	/>

	<TimeSection bind:startDate={collection.mintStart} bind:endDate={collection.mintEnd} {readonly} />

	<div class="banner-wrap">
		<label for="logo">
			<!-- TODO: possibly coalign this with the advanced wording, i.e. "Collection logo"  -->
			<PopInfo message="Tooltip text">Profile picture</PopInfo>
		</label>
		{#if collection.logo}
			<div class="modal-info">
				Profile picture:
				<span class="hash">
					<a href={collection.logo} target="_blank" rel="noreferrer">{collection.logo}</a>
				</span>
				{#if !readonly}
					<CloseButton position="8px" size="12px" on:click={() => handleFileDiscard('logo')} />
				{/if}
			</div>
		{/if}
		{#if !collection.logo && !readonly}
			<Button size="md" type="tertiary" on:click={addLogo}>
				{collection.logo ? 'Edit' : 'Add'}
			</Button>
		{/if}
	</div>
	<div class="banner-wrap">
		<label for="banner">
			<PopInfo message="Tooltip text">Banner</PopInfo>
		</label>
		{#if collection.banner}
			<div class="modal-info">
				Banner:
				<span class="hash">
					<a href={collection.banner} target="_blank" rel="noreferrer">{collection.banner}</a>
				</span>
				{#if !readonly}
					<CloseButton position="8px" size="12px" on:click={() => handleFileDiscard('banner')} />
				{/if}
			</div>
		{/if}
		{#if !collection.banner && !readonly}
			<Button size="md" type="tertiary" on:click={addBanner}>
				{collection.banner ? 'Edit' : 'Add'}
			</Button>
		{/if}
	</div>
	<CollectionSection title="Editions">
		<NftPreviewCards
			savedNfts={collection.editions}
			colors={[]}
			{deleteNft}
			{updateOrder}
			{updateNft}
			{readonly}
		/>
		{#if !readonly}
			<CreateSimpleNftForm bind:editions={collection.editions} />
		{/if}
		<span id="edition-supply">
			<FormInput
				id="supply"
				label="Total Supply"
				info="By default, the total supply will be set to the sum of all edition total supplies. If you intend to register more editions, account for future supply needs."
				placeholder="Unlimited"
				description="The total number of NFTs that can be minted, remember to account for potential future editions."
				type="number"
				bind:value={maxSupply}
			/>
		</span>
	</CollectionSection>

	<RoyaltySection
		{updateRoyalty}
		royalty={collection.royalty}
		{deleteRoyalty}
		unsaved={royaltyReceiversChanged}
		{readonly}
	/>

	<EditionPayoutReceiverSection
		bind:payoutAddress={collection.payoutAddress}
		bind:error={payoutError}
		{readonly}
	/>

	<IpfsMetadataSection
		title="Metadata"
		{collection}
		ipfsMetadata={collection.ipfsMetadata}
		on:pinned={metadataPinned}
		{readonly}
	/>

	{#if !readonly}
		<Button
			size="md"
			fullWidth={true}
			on:click={submit}
			type={changed ? 'primary' : 'secondary'}
			loading={savingData}
			disabled={!!payoutError}
		>
			Save Changes
		</Button>
	{/if}
</HeavyBorderBox>

<style lang="scss">
	label {
		color: var(--text-header);
		margin-bottom: 8px;
	}

	.banner-wrap {
		display: flex;
		flex-direction: column;
		margin-top: 16px;
		margin-bottom: 16px;
		.modal-info {
			padding: 8px 12px;
			display: flex;
			flex-direction: column;
			border: 0.4px solid var(--stroke-tertiary);
			margin-bottom: 16px;
			color: var(--text-secondary);
			position: relative;

			.hash {
				font-weight: 300;
				margin-bottom: 4px;
				word-break: break-all;
			}
		}
	}
</style>
