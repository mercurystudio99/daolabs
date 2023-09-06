<script lang="ts">
	import { onDestroy } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import { collectionValidationSchema } from '$models/minter/validation-schemas/collection-validation';
	import { categories } from '$models/minter/categories';
	import { getErrorList } from '$lib/utils/getErrorList';
	import Links from '$lib/components/Links.svelte';
	import TimeSection from '$lib/components/sections/TimeSection.svelte';
	import RoyaltySection from '$lib/components/sections/RoyaltySection.svelte';
	import CustomizationSection from '$lib/components/sections/CustomizationSection.svelte';
	import CollectionImagesSection from '$lib/components/sections/CollectionImagesSection.svelte';

	import { createSymbolForCollection } from '$utils/collectionHelpers';
	import Form from '../minter/form/Form.svelte';
	import FormDropdown from '../minter/form/FormDropdown.svelte';
	import FormInput from '../minter/form/FormInput.svelte';
	import FormErrorModal from '../minter/modal/FormErrorModal.svelte';
	import HeavyBorderBox from '../HeavyBorderBox.svelte';
	import Button from '../Button.svelte';
	import { bind, openModal } from '../Modal.svelte';
	import Textarea from '../Textarea.svelte';
	import LinksDisplay from '../LinksDisplay.svelte';
	import IpfsMetadataSection from '../sections/IpfsMetadataSection.svelte';
	import type { AdvancedCollection, Royalty } from '$models/minter/collection-config';
	import type { PinataPinResponse } from 'pinata_ipfs_sdk';

	export let collection: AdvancedCollection;
	export let saveCollection: (form: AdvancedCollection) => Promise<void>;
	export let readonly = false;

	let savingData = false;
	let royaltyReceiversChanged = false;

	const { handleSubmit, errors, modified, form, handleChange } = createForm<AdvancedCollection>({
		initialValues: collection,
		onSubmit: async () => {
			savingData = true;
			try {
				if (!$form.symbol) {
					$form.symbol = createSymbolForCollection($form);
				}
				await saveCollection($form);
			} catch (error) {
				console.log(
					error instanceof Error ? `Collection's update has failed: ${error.message}` : error,
				);
			} finally {
				savingData = false;
			}
		},
		validationSchema: collectionValidationSchema,
	});

	const modifiedUnsubscribe = modified.subscribe((value) => {
		if (value.royalty) {
			royaltyReceiversChanged =
				JSON.stringify($form.royalty?.creator_address) !==
				JSON.stringify(collection.royalty?.creator_address);
		}
	});

	const unsubscribe = errors.subscribe((value) => {
		const errorList = getErrorList(value);
		if (errorList.length > 0) {
			openModal(bind(FormErrorModal, { errorList }));
		}
	});

	onDestroy(() => {
		unsubscribe();
		modifiedUnsubscribe();
	});

	const updateCustomization = (colors: string[]) => {
		$form.defaultColors = colors;
	};

	const updateRoyalty = (royalty: Royalty, forceSave: boolean = false) => {
		$form.royalty = royalty;
		if (forceSave) {
			handleSubmit(new CustomEvent('change'));
		}
	};

	const deleteRoyalty = () => {
		$form.royalty = null;
	};

	const openLinksModal = (e: CustomEvent) => {
		openModal(e.detail.modal);
	};

	function metadataPinned(e: CustomEvent<{ ipfs: PinataPinResponse }>) {
		$form.ipfsMetadata = e.detail.ipfs;
	}

	$: formChanged = Object.keys($form).some((key) => {
		// The case when links is an empty array due to init, but the user has not changed it
		if (key === 'links' && !$form.links.length && !collection.links) {
			return false;
		}
		return JSON.stringify(collection[key]) !== JSON.stringify($form[key]);
	});
</script>

<HeavyBorderBox>
	<Form onSubmit={handleSubmit}>
		<FormInput
			id="name"
			label="Collection Name"
			info="This will be displayed in marketplaces and wallets as your NFT collection's name."
			name="name"
			placeholder="Collection Name"
			description="Your collection’s name"
			required={true}
			error={$errors.name}
			on:change={handleChange}
			bind:value={$form.name}
			{readonly}
		/>
		<FormInput
			id="symbol"
			label="Symbol"
			info="Symbols are generally a 3-6 character long acronym or abbreviation of your collection's name."
			placeholder="$NFT"
			description="3-6 character acronym or abbreviation. If left blank, one will be created for you."
			bind:value={$form.symbol}
			{readonly}
		/>
		<FormDropdown
			id="category"
			label="Category"
			info="Categories help users find your collection. Pick the option which best describes your collection."
			description="Adding a category will help make your item discoverable"
			placeholder="Associated with a category"
			options={categories}
			error={$errors.category}
			on:change={handleChange}
			bind:value={$form.category}
			{readonly}
		/>
		{#if (readonly && $form.description) || !readonly}
			<Textarea
				id="description"
				label="Description"
				info="Describe or add context to your NFT collection. This will be displayed in marketplaces and wallets."
				placeholder="This is example of a default description."
				on:change={handleChange}
				bind:value={$form.description}
				rows="4"
				maxlength={1000}
				{readonly}
			/>
		{/if}

		<CollectionImagesSection title="Images" {form} {readonly} />

		{#if readonly && $form.links?.length > 0}
			<h3 class="sub-section-title">Links</h3>
			<LinksDisplay links={$form.links} />
			<br />
		{:else if !readonly}
			<h3 class="sub-section-title">Links</h3>
			<Links bind:links={$form.links} on:openLinks={openLinksModal} />
		{/if}

		<TimeSection bind:startDate={$form.mintStart} bind:endDate={$form.mintEnd} {readonly} />

		<RoyaltySection
			royalty={$form.royalty}
			{updateRoyalty}
			{deleteRoyalty}
			{readonly}
			unsaved={royaltyReceiversChanged}
		/>

		<CustomizationSection colors={$form.defaultColors} {updateCustomization} {readonly} />

		<!-- TODO: should be renamed to CollectionMetadata, and the nft metadata renamed to NftMetadata; but after the infra changes -->
		<IpfsMetadataSection
			title="Metadata"
			{collection}
			ipfsMetadata={$form.ipfsMetadata}
			{readonly}
			on:pinned={metadataPinned}
		/>

		{#if !readonly}
			<Button
				buttonProps={{ type: 'submit' }}
				size="md"
				type={formChanged ? 'primary' : 'tertiary'}
				fullWidth
				loading={savingData}
			>
				Save changes
			</Button>
		{/if}
	</Form>
</HeavyBorderBox>

<style lang="scss">
	.sub-section-title {
		color: var(--text-header);
		margin-bottom: 16px;
	}
</style>
