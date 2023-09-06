<script lang="ts">
	import { onMount } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import RoyaltySection from '$lib/components/sections/RoyaltySection.svelte';
	import CustomizationSection from '$lib/components/sections/CustomizationSection.svelte';
	import Modal, { bind, openModal, type ModalType } from '$lib/components/Modal.svelte';
	import FreshCollectionInfoModal from '$lib/components/FreshCollectionInfoModal.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import { generateId } from '$lib/utils/generateId';
	import { getErrorList } from '$lib/utils/getErrorList';
	import { categories } from '$models/minter/categories';
	import {
		CollectionType,
		initialAdvancedCollectionConfig,
		type Royalty,
		type AdvancedCollection,
	} from '$models/minter/collection-config';
	import { collectionValidationSchema } from '$models/minter/validation-schemas/collection-validation';
	import { connectedAccount, readNetwork, web3Connect } from '$stores/web3';
	import { userdata } from '$utils/firebase';
	import Links from '$lib/components/Links.svelte';
	import { advancedCollectionCreationOptions } from '$utils/introjs/options';
	import { createSymbolForCollection } from '$utils/collectionHelpers';
	import { throwConfetti } from '$lib/utils/confetti';
	import { goto } from '$app/navigation';
	import AdvancedArrow from '../advanced-arrow/AdvancedArrow.svelte';
	import ReviewCollectionFull from '../collection/ReviewCollectionFull.svelte';
	import EditCollectionImagesModal from '../edit/EditCollectionImagesModal.svelte';
	import Form from '../form/Form.svelte';
	import FormDropdown from '../form/FormDropdown.svelte';
	import FormInput from '../form/FormInput.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import AdvancedCollectionPreview from '../preview/AdvancedCollectionPreview.svelte';

	/*
	TODO: Tooltip text
	*/
	export let close: () => void;
	export let createNft: (collection: AdvancedCollection) => Promise<void> | void;
	export let shortcutToPfp: boolean = false;
	export let getIntro: (introOptions: any) => void;

	let advancedMode = true;

	let customizationModal: ModalType;
	let errorList: { field: string; message: string }[] | undefined;
	let formModal: ModalType;
	let previewModal: ModalType;

	const createCollection = async (values: AdvancedCollection) => {
		const id = generateId();

		const collection = {
			...values,
			id,
			creator: $connectedAccount,
			network: $readNetwork.alias,
			type: CollectionType.ADVANCED,
		};

		await createNft(collection);
		close();
		throwConfetti().catch((err) => console.log(err));

		if ($userdata) {
			$userdata.collectionAutoNavigate
				? goto(`/collection/${id}?shortcutToPfp=${String(shortcutToPfp)}`)
				: openModal(
						bind(FreshCollectionInfoModal, { collectionId: id, shortcutToPfp, close: () => {} }),
				  );
		}
	};
	const formState = createForm<AdvancedCollection>({
		initialValues: initialAdvancedCollectionConfig,
		onSubmit: createCollection,
		validationSchema: collectionValidationSchema,
	});
	const { handleSubmit, errors, form, handleChange } = formState;
	const submit = async (e: Event) => {
		if (!$connectedAccount) {
			await web3Connect();
		}
		if (!$form.symbol) {
			$form.symbol = createSymbolForCollection($form);
		}
		handleSubmit(e);
	};

	errors.subscribe((value) => {
		const err = getErrorList(value, { file: 'Image' });
		if (err.length > 0) {
			errorList = err;
		}
	});

	const updateImages = (logo: string, defaultImage: string, banner: string) => {
		$form.logo = logo;
		$form.defaultImage = defaultImage;
		$form.banner = banner;
	};

	const updateCustomization = (colors: string[]) => {
		$form.defaultColors = colors;
	};

	const updateRoyalty = (royalty: Royalty) => {
		$form.royalty = royalty;
	};

	const deleteRoyalty = () => {
		$form.royalty = null;
	};

	const openImageModal = () => {
		formModal = bind(EditCollectionImagesModal, {
			saveData: updateImages,
			logo: $form.logo,
			defaultImage: $form.defaultImage,
			banner: $form.banner,
			close: () => {},
		});
	};

	const openLinksModal = (e: CustomEvent) => {
		formModal = e.detail.modal;
	};

	const openPreview = () => {
		previewModal = bind(ReviewCollectionFull, { collection: $form });
	};

	const discardFile = (property: 'logo' | 'defaultImage' | 'banner') => {
		$form[property] = '';
	};

	onMount(() => {
		getIntro(advancedCollectionCreationOptions);
	});

	$: imagesButtonText = $form.logo || $form.banner || $form.defaultImage ? 'Edit' : 'Add';
	$: addDisabled = !$form.name;
</script>

<main>
	<div class="form">
		<Form onSubmit={handleSubmit}>
			<div class="box">
				<h2>Collection Details</h2>
				<small class="required-fields">* Required fields</small>
				<span id="advanced-name">
					<FormInput
						id="name"
						label="Name"
						info="This will be displayed in marketplaces and wallets as your NFT collection's name."
						name="name"
						placeholder="Collection Name"
						description="Marketplaces and wallets use the NFT contract name to identify your collection."
						required={true}
						on:change={handleChange}
						bind:value={$form.name}
					/>
				</span>
				<span id="advanced-symbol">
					<FormInput
						id="symbol"
						label="Symbol"
						info="Symbols are generally a 3-6 character long acronym or abbreviation of your collection's name."
						placeholder="$NFT"
						description="3-6 character acronym or abbreviation. If left blank, one will be created for you."
						bind:value={$form.symbol}
					/>
				</span>
				<span id="advanced-category">
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
					/>
				</span>
				{#if advancedMode}
					<span id="advanced-description">
						<Textarea
							id="description"
							info="Describe or add context to your NFT collection. This will be displayed in marketplaces and wallets."
							label="Description"
							placeholder="This is example of a default description."
							on:change={handleChange}
							bind:value={$form.description}
							rows="4"
							maxlength={1000}
						/>
					</span>
					<span id="advanced-images">
						<h3 class="sub-section-title">Images</h3>
						{#if $form.logo || $form.banner || $form.defaultImage}
							<div class="modal-info">
								{#if $form.logo}
									<div class="wrapper">
										Logo:
										<span class="hash">
											<a href={$form.logo} target="_blank" rel="noreferrer">{$form.logo}</a>
											<CloseButton
												position="4px"
												size="10px"
												on:click={() => discardFile('logo')}
											/>
										</span>
									</div>
								{/if}
								{#if $form.defaultImage}
									<div class="wrapper">
										Default image:
										<span class="hash">
											<a href={$form.defaultImage} target="_blank" rel="noreferrer"
												>{$form.defaultImage}</a
											>
											<CloseButton
												position="4px"
												size="10px"
												on:click={() => discardFile('defaultImage')}
											/>
										</span>
									</div>
								{/if}
								{#if $form.banner}
									<div class="wrapper">
										Banner:
										<span class="hash">
											<a href={$form.banner} target="_blank" rel="noreferrer">
												{$form.banner}
											</a>
											<CloseButton
												position="4px"
												size="10px"
												on:click={() => discardFile('banner')}
											/>
										</span>
									</div>
								{/if}
							</div>
						{/if}
						<div class="modal-button">
							<Button
								buttonProps={{ type: 'button', id: 'images' }}
								type="tertiary"
								size="md"
								on:click={openImageModal}
							>
								{imagesButtonText}
							</Button>
						</div>
					</span>
					<span id="advanced-links">
						<h3 class="sub-section-title">Links</h3>
						<Links bind:links={$form.links} on:openLinks={openLinksModal} />
					</span>
					<span id="advanced-royalties">
						<RoyaltySection
							{updateRoyalty}
							updateNestedModal={(nm) => {
								formModal = nm;
							}}
							royalty={$form.royalty}
							{deleteRoyalty}
							unsaved
						/>
					</span>
					<span id="advanced-customization">
						<CustomizationSection
							colors={$form.defaultColors}
							{updateCustomization}
							updateNestedModal={(nm) => {
								customizationModal = nm;
							}}
						/>
					</span>
				{/if}
				<AdvancedArrow bind:advancedMode />

				<div class="button-container">
					<Button
						buttonProps={{ type: 'button', id: 'preview' }}
						size="md"
						type="secondary"
						on:click={openPreview}
					>
						Preview
					</Button>
					<Button
						buttonProps={{ type: 'button', id: 'submit' }}
						size="md"
						on:click={submit}
						disabled={addDisabled}
					>
						{$connectedAccount ? 'Add' : 'Connect wallet'}
					</Button>
				</div>
			</div>
		</Form>
	</div>
	<AdvancedCollectionPreview collection={$form} />
</main>

<Modal
	on:close={() => {
		customizationModal = undefined;
	}}
	show={customizationModal}
	styleInnerContent={{ overflow: 'visible' }}
/>
<Modal
	on:close={() => {
		formModal = undefined;
	}}
	fullscreen={false}
	fullscreenDefault={false}
	show={formModal}
/>
<Modal
	on:close={() => {
		previewModal = undefined;
	}}
	show={previewModal}
	fullscreenDefault
	fullscreen
/>

<Modal
	on:close={() => {
		errorList = undefined;
	}}
	show={errorList &&
		bind(FormErrorModal, {
			errorList,
		})}
/>

<style lang="scss">
	main {
		display: flex;
		padding: 8px;
		gap: 24px;
		width: calc(100vw - 96px);
		.form {
			display: flex;
			flex-direction: column;
			flex-basis: 50%;
		}
		.box {
			display: flex;
			flex-direction: column;

			h2 {
				font-size: 21px;
				color: var(--text-header);
				margin-bottom: 16px;
			}

			.required-fields {
				color: var(--text-tertiary);
				font-size: 12px;
				font-weight: 600;
				margin-bottom: 16px;
			}

			.button-container {
				display: grid;
				justify-content: flex-end;
				grid-template-columns: auto auto auto;
				grid-column-gap: 16px;
				margin-top: 16px;
			}
			.sub-section-title {
				color: var(--text-header);
				margin-bottom: 16px;
			}

			.modal-info {
				padding: 8px 12px;
				display: flex;
				flex-direction: column;
				border: 0.4px solid var(--stroke-tertiary);
				margin-bottom: 16px;
				color: var(--text-secondary);

				.wrapper {
					position: relative;
					display: flex;
					flex-direction: column;
					.hash {
						font-weight: 300;
						margin-bottom: 4px;
						word-break: break-all;
					}
				}
			}

			.modal-button {
				padding-bottom: 16px;
				margin-bottom: 16px;
				border-bottom: 1px solid var(--stroke-tertiary);
				display: flex;
				flex-direction: column;
			}
		}
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		main {
			flex-direction: column;
			width: 100%;
		}
	}
</style>
