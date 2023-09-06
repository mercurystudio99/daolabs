<script lang="ts">
	import { createForm, Form } from 'svelte-forms-lib';
	import { onDestroy, SvelteComponentTyped, type ComponentConstructorOptions } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import { createCustomNotification } from '$utils/notification';
	import Links from '$lib/components/Links.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { collectionValidationSchema } from '$models/minter/validation-schemas/collection-validation';
	import { web3Connect, connectedAccount } from '$stores/web3';
	import { ipfsCidUrl } from '$utils/ipfs';
	import { categories } from '$models/minter/categories';
	import {
		type AdvancedCollection,
		type Royalty,
		type SimpleCollection,
		initialAdvancedCollectionConfig,
		initialSimpleCollectionConfig,
		type Collection,
		type CollectionPricing,
	} from '$models/minter/collection-config';
	import Modal, { bind, openModal } from '$lib/components/Modal.svelte';
	import FreshCollectionInfoModal from '$lib/components/FreshCollectionInfoModal.svelte';
	import { userdata } from '$utils/firebase';
	import { generateId } from '$lib/utils/generateId';
	import { getErrorList } from '$lib/utils/getErrorList';
	import RoyaltySection from '$lib/components/sections/RoyaltySection.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import { isPfpNft, type NftConfig } from '$models/minter/nft-config';
	import { isAdvancedCollection } from '$utils/collectionHelpers';
	import { throwConfetti } from '$lib/utils/confetti';
	import {
		initialRevenueSplit,
		isRevenueSplit,
		type RevenueSplit,
	} from '$models/user/revenue-splits';
	import { goto } from '$app/navigation';
	import AdvancedArrow from '../advanced-arrow/AdvancedArrow.svelte';
	import FormDropdown from '../form/FormDropdown.svelte';
	import FormInput from '../form/FormInput.svelte';
	import EditCollectionCustomization from '../edit/EditCollectionCustomization.svelte';
	import EditCollectionImagesModal from '../edit/EditCollectionImagesModal.svelte';
	import AdvancedCollectionPreview from '../preview/AdvancedCollectionPreview.svelte';
	import ReviewCollectionFull from '../collection/ReviewCollectionFull.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import type { DropzoneOutput } from '$models/dropzone';

	export let close: () => void;
	export let createNft: (collection: Collection) => Promise<void> | void;
	export let shortcutToPfp: boolean = false;

	let errorMessage: string;
	let jsonFile: SimpleCollection | AdvancedCollection;
	let isUploaded = false;
	let advancedMode = true;
	let formModal: (options: ComponentConstructorOptions) => SvelteComponentTyped;
	let previewModal: (options: ComponentConstructorOptions) => SvelteComponentTyped;
	let customizationModal: (options: ComponentConstructorOptions) => SvelteComponentTyped;

	const createCollection = async (values: Collection) => {
		const id = generateId();

		const collection = {
			...values,
			id,
		};

		await createNft(collection);
		close();
		throwConfetti().catch((err) => console.log(err));

		if ($userdata) {
			if ($userdata.collectionAutoNavigate) {
				await goto(`/collection/${id}?shortcutToPfp=${shortcutToPfp.toString()}`);
			} else {
				openModal(
					bind<{ close?: () => void; collectionId: string; shortcutToPfp?: boolean }>(
						FreshCollectionInfoModal,
						{ collectionId: id, shortcutToPfp },
					),
				);
			}
		}
	};

	const formState = createForm<SimpleCollection | AdvancedCollection>({
		initialValues: initialAdvancedCollectionConfig,
		onSubmit: createCollection,
		validationSchema: collectionValidationSchema,
	});

	const { handleSubmit, errors, form, handleChange, updateInitialValues } = formState;

	const openPreview = () => {
		previewModal = bind<{ collection: Collection }>(ReviewCollectionFull, {
			collection: $form,
		});
	};

	let errorList: { field: string; message: string }[];
	const unsubscribe = errors.subscribe((value) => {
		const err = getErrorList(value, { file: 'Image' });
		if (err.length > 0) {
			errorList = err;
		}
	});

	onDestroy(() => {
		unsubscribe();
	});

	function prepareNfts(nfts: NftConfig[]) {
		if (!nfts) return undefined;
		if (!isPfpNft(nfts[0])) {
			return nfts.map((nft) => ({
				...nft,
				_id: generateId(),
			}));
		}
		return nfts;
	}

	function prepareRevenueSplit<T>(split: T | RevenueSplit) {
		if (!isRevenueSplit(split)) return split;

		const common = {
			creator: $connectedAccount,
			id: generateId(),
			createdAt: undefined,
			address: undefined,
			network: undefined,
			deployedAt: undefined,
		};

		return {
			...initialRevenueSplit,
			...split,
			...common,
		} as RevenueSplit;
	}

	function prepareRoyalties(royalty: Royalty) {
		if (!royalty) return undefined;

		return {
			...royalty,
			creator_address: prepareRevenueSplit(royalty.creator_address),
		};
	}

	function preparePricing(pricing: CollectionPricing) {
		if (!pricing) return undefined;

		return {
			...pricing,
			payoutReceivers: prepareRevenueSplit(pricing.payoutReceivers),
		};
	}

	const uploadFile = async ({ pinInfo: { IpfsHash } }: DropzoneOutput) => {
		errorMessage = '';
		const { update } = createCustomNotification({
			type: 'pending',
			message: 'Fetching uploaded file',
		});
		try {
			const response = await fetch(ipfsCidUrl(IpfsHash));
			jsonFile = await response.json();
			update({
				type: 'success',
				message: 'Collection config fetched',
				autoDismiss: 3000,
			});

			const common = {
				creator: $connectedAccount,
				banner: jsonFile.banner ? ipfsCidUrl(jsonFile.banner) : '',
				logo: jsonFile.logo ? ipfsCidUrl(jsonFile.logo) : '',
				defaultImage: jsonFile.defaultImage ? ipfsCidUrl(jsonFile.defaultImage) : '',
				contracts: undefined,
				ipfsMetadata: undefined,
			};

			if (isAdvancedCollection(jsonFile)) {
				updateInitialValues({
					...initialAdvancedCollectionConfig,
					...jsonFile,
					...common,
					nfts: prepareNfts(jsonFile.nfts),
					royalty: prepareRoyalties(jsonFile.royalty),
					pricing: preparePricing(jsonFile.pricing),
				});
			} else {
				updateInitialValues({
					...initialSimpleCollectionConfig,
					...jsonFile,
					...common,
					payoutAddress: prepareRevenueSplit(jsonFile.payoutAddress),
					royalty: prepareRoyalties(jsonFile.royalty),
				});
			}

			isUploaded = !isUploaded;
		} catch (error: any) {
			console.error(error);
			errorMessage = 'Something went wrong! Try again, or try again later.';
			update({
				type: 'error',
				message: 'Oops! Something went wrong.',
				autoDismiss: 3000,
			});
		}
	};

	const submit = async (e: Event) => {
		if (!$connectedAccount) {
			await web3Connect();
		}
		handleSubmit(e);
	};

	const discardFile = (property: 'logo' | 'defaultImage' | 'banner') => {
		$form[property] = '';
	};

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
		formModal = bind<{
			close?: () => void;
			logo: string;
			defaultImage: string;
			banner: string;
			saveData: (logo: string, defaultImage: string, banner: string) => void;
		}>(EditCollectionImagesModal, {
			saveData: updateImages,
			logo: $form.logo,
			defaultImage: $form.defaultImage,
			banner: $form.banner,
		});
	};

	const openLinksModal = (e: CustomEvent) => {
		formModal = e.detail.modal;
	};

	const openCustomizationModal = () => {
		customizationModal = bind<{
			close?: () => void;
			colors?: string[];
			saveData: (colors: string[]) => void;
		}>(EditCollectionCustomization, {
			saveData: updateCustomization,
			colors: $form.defaultColors,
		});
	};

	$: addDisabled = !jsonFile;
	$: imagesButtonText = $form.logo || $form.banner || $form.defaultImage ? 'Edit' : 'Add';
	$: customizationButtonText = $form.defaultColors?.length > 0 ? 'Edit' : 'Add';
</script>

<main>
	<div class="form">
		{#if !isUploaded}
			<div class="box">
				<h2>Import</h2>
				<InfoBox>
					<!-- TODO: add a modal with information/download option for a template json file to fill in -->
					<p>
						Upload a file that conforms with our NFT project config format by either constructing
						the JSON by hand or using the export functionality on an already existing collection.
					</p>
				</InfoBox>
				<br />
				<UploadDropzone accept={['.json']} onDrop={uploadFile} />
				{#if errorMessage}
					<span class="error">{errorMessage}</span>
				{/if}
				<div class="button-container">
					<Button
						buttonProps={{ type: 'button' }}
						size="md"
						type="secondary"
						disabled={addDisabled}
						on:click={openPreview}
					>
						Preview
					</Button>
					<Button
						buttonProps={{ type: 'button' }}
						size="md"
						on:click={submit}
						disabled={addDisabled}
					>
						{$connectedAccount ? 'Add' : 'Connect wallet'}
					</Button>
				</div>
			</div>
		{:else}
			<Form onSubmit={handleSubmit}>
				<div class="box">
					<h2>Collection Details</h2>
					<small class="required-fields">* Required fields</small>
					<FormInput
						id="name"
						label="Collection Name"
						info="Tooltip text"
						name="name"
						placeholder="Collection Name"
						description="Your collection’s name"
						required={true}
						on:change={handleChange}
						bind:value={$form.name}
					/>
					<FormDropdown
						id="category"
						label="Category"
						info="Tooltip text"
						description="Adding a category will help make your item discoverable"
						placeholder="Associated with a category"
						options={categories}
						error={$errors.category}
						on:change={handleChange}
						bind:value={$form.category}
					/>
					{#if advancedMode}
						<Textarea
							id="description"
							info="Tooltip text"
							label="Description"
							placeholder="This is example of a default description."
							on:change={handleChange}
							bind:value={$form.description}
							rows="4"
							maxlength={1000}
						/>
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
											<a href={$form.defaultImage} target="_blank" rel="noreferrer">
												{$form.defaultImage}
											</a>
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
											<a href={$form.banner} target="_blank" rel="noreferrer"> {$form.banner} </a>
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
								buttonProps={{ type: 'button' }}
								type="tertiary"
								size="md"
								on:click={openImageModal}
							>
								{imagesButtonText}
							</Button>
						</div>
						<h3 class="sub-section-title">Links</h3>
						<Links bind:links={$form.links} on:openLinks={openLinksModal} />

						<RoyaltySection
							royalty={$form.royalty}
							{updateRoyalty}
							{deleteRoyalty}
							updateNestedModal={(nm) => {
								formModal = nm;
							}}
							unsaved
						/>

						<h3 class="sub-section-title">Collection customization</h3>
						{#if $form.defaultColors?.length > 0}
							<div class="modal-info">
								Background:
								<span class="hash">
									{$form.defaultColors?.join(', ')}
								</span>
							</div>
						{/if}
						<div class="modal-button final">
							<Button
								buttonProps={{ type: 'button' }}
								type="tertiary"
								size="md"
								on:click={openCustomizationModal}
							>
								{customizationButtonText}
							</Button>
						</div>
					{/if}
					<AdvancedArrow bind:advancedMode />

					<div class="button-container">
						<Button
							buttonProps={{ type: 'button' }}
							size="md"
							type="secondary"
							on:click={openPreview}
						>
							Preview
						</Button>
						<Button
							buttonProps={{ type: 'button' }}
							size="md"
							on:click={submit}
							disabled={addDisabled}
						>
							{$connectedAccount ? 'Add' : 'Connect wallet'}
						</Button>
					</div>
				</div>
			</Form>
		{/if}
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
			.final {
				border: none;
				padding: 0;
			}
		}
	}

	.error {
		color: var(--text-failure);
		margin-top: 8px;
		text-align: right;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		main {
			flex-direction: column;
		}
	}
</style>
