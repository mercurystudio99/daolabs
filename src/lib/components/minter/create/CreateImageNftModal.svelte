<script lang="ts">
	import { onMount } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import Button from '$lib/components/Button.svelte';
	import Modal, { bind, type ModalType } from '$lib/components/Modal.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { generateId } from '$lib/utils/generateId';
	import { getErrorList } from '$lib/utils/getErrorList';
	import {
		initialImageNftConfig,
		NftStatus,
		type ImageNftConfig,
		NftType,
	} from '$models/minter/nft-config';
	import { imageValidationSchema } from '$models/minter/validation-schemas/image-validation';
	import { getFileSizeString } from '$utils/files';
	import {
		imageNftCreationAdvancedOptions,
		nftCreationNextOptions,
		imageNftCreationOptions,
	} from '$utils/introjs/options';
	import { ipfsCidUrl } from '$utils/ipfs';
	import AdditionalConfiguration from '../card/AdditionalConfiguration.svelte';
	import NftPreviewCards from '../card/NftPreviewCards.svelte';
	import EditImageOutput from '../edit/EditImageOutput.svelte';
	import Form from '../form/Form.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import NftCreation from '../nft-creation/NftCreation.svelte';
	import AdvancedCollectionPreview from '../preview/AdvancedCollectionPreview.svelte';
	import ImageNftPreview from '../preview/ImageNftPreview.svelte';
	import type { TokenStandard } from '$models/minter/token-standard';
	import type { AdvancedCollection, ImageCollection } from '$models/minter/collection-config';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	import type { FileWithPath } from '$models/dropzone';

	export let close: () => void;
	export let standard: TokenStandard;
	export let deleteDumpNft: (index: number) => void;
	export let collection: ImageCollection;
	export let saveCollection: (collection: AdvancedCollection) => Promise<void>;
	export let getIntro: (introOptions: any, hintOptions: any) => void;

	let formModal: ModalType;
	let advancedMode = true;

	let imageFile: DropzoneOutput;
	let imageSize: string;
	let showForm = !collection.nfts?.length;
	let keepDescription = false;
	let keepLink = false;
	let errorList: { field: string; message: string }[];

	const review = async () => {
		await saveCollection({ ...collection, nftType: NftType.IMAGE, standard });
		close();
	};

	const resetIntro = (mode: boolean) => {
		if (mode) {
			const options = {
				steps: [
					...imageNftCreationOptions.steps.slice(0, 4),
					...imageNftCreationAdvancedOptions.steps,
					...imageNftCreationOptions.steps.slice(4),
				],
				dontShowAgain: true,
			};
			getIntro(options, null);
		} else {
			getIntro(imageNftCreationOptions, null);
		}
	};

	const { handleSubmit, errors, form, handleChange, handleReset } = createForm<ImageNftConfig>({
		initialValues: initialImageNftConfig,
		onSubmit: () => {
			$form._status = NftStatus.SAVED;
			$form._id = generateId();
			if (!collection.nfts) {
				collection.nfts = [$form];
			} else {
				collection.nfts.push($form);
			}
			collection = collection;
			imageFile = undefined;
			imageSize = '';
			showForm = false;
			handleReset();
			getIntro(nftCreationNextOptions, null);
		},
		validationSchema: imageValidationSchema,
	});

	const handleImageSelect = (file: DropzoneOutput, acceptedFiles: FileWithPath[]) => {
		imageFile = file;
		imageSize = getFileSizeString(acceptedFiles[0].size);
		$form.file = ipfsCidUrl(file.pinInfo.IpfsHash);
	};

	const handleImageDiscard = () => {
		imageFile = undefined;
		imageSize = '';
		$form.file = '';
	};

	const updateOutput = (colors: string[], resolution: string) => {
		$form.defaultColor = colors[0];
		$form.outputResolution = resolution;
	};

	const openOutputModal = () => {
		const options = {
			saveData: updateOutput,
			colors: [$form.defaultColor],
			resolution: $form.outputResolution,
			close: () => {},
		};

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
		formModal = bind(EditImageOutput, options);
	};

	const createAnother = () => {
		showForm = true;
		if (keepDescription) {
			$form.description = collection.nfts[0].description;
		}
		if (keepLink) {
			$form.externalLink = collection.nfts[0].externalLink;
		}
	};

	const updateOrder = (list: ImageNftConfig[]) => {
		collection.nfts = list;
	};

	const updateNft = (formData: ImageNftConfig) => {
		const nftIndex = collection.nfts.findIndex((i) => i._id === formData._id);
		collection.nfts[nftIndex] = formData;
		collection = collection;
	};

	const deleteNft = (index: number) => {
		collection.nfts.splice(index, 1);
		collection = collection;
		deleteDumpNft(index);
		if (collection.nfts?.length === 0) {
			showForm = true;
		}
	};

	errors.subscribe((value) => {
		const err = getErrorList(value, { file: 'Image' });
		if (err.length > 0) {
			errorList = err;
		}
	});

	onMount(() => {
		const options = {
			steps: [
				...imageNftCreationOptions.steps.slice(0, 4),
				...imageNftCreationAdvancedOptions.steps,
				...imageNftCreationOptions.steps.slice(4),
			],
			dontShowAgain: true,
		};
		getIntro(options, null);
	});

	$: outputButtonText = $form.defaultColor || $form.outputResolution ? 'Edit' : 'Add';
</script>

<main>
	<div class="form">
		<h2>Create Image NFT</h2>
		{#if collection.nfts?.length > 0}
			<h4>Review Image NFT</h4>
			<div class="nft-list">
				<NftPreviewCards
					savedNfts={collection.nfts}
					{deleteNft}
					{updateOrder}
					{updateNft}
					colors={collection.defaultColors}
				/>
			</div>

			<h4>Create Another Image NFT in Collection</h4>
			<span class="add-text">
				Add NFT to the collection before finalizing with Review and Deploy.
			</span>
			{#if !showForm}
				<Button
					size="md"
					type="tertiary"
					on:click={createAnother}
					buttonProps={{ id: 'add-another' }}
				>
					Add Image NFT
				</Button>
			{/if}
		{/if}
		{#if showForm}
			<Form onSubmit={handleSubmit}>
				<div class="box">
					<NftCreation
						bind:advancedMode
						errors={$errors}
						bind:form={$form}
						{handleChange}
						bind:keepDescription
						bind:keepLink
						addDisabled={!imageFile}
						onAdvanced={resetIntro}
					>
						<div class="dropzone" id="image-wrap">
							<UploadDropzone
								label="Image NFT"
								required={true}
								info="Upload your NFT's content. Images, .svg files, and 3d models will work. For an animated NFT, upload a .gif file."
								accept={['.png', '.jpg', '.jpeg', '.gif', '.svg', '.glb', '.gltf']}
								title="Upload Image"
								onDrop={handleImageSelect}
								preview={!!$form.file}
								discard={handleImageDiscard}
								id="image"
							>
								<div class="modal-info">
									<span class="address">
										{`${imageFile.pinInfo.IpfsHash} (${imageSize})`}
									</span>
								</div>
							</UploadDropzone>
						</div>
						<div slot="advanced">
							<span id="output-wrap">
								<h3>Output Settings</h3>
								{#if $form.defaultColor || $form.outputResolution}
									<div class="modal-info">
										{#if $form.outputResolution}
											Resolution:
											<span class="value">
												{$form.outputResolution}
											</span>
										{/if}
										{#if $form.defaultColor}
											Color:
											<span class="value">
												{$form.defaultColor}
											</span>
										{/if}
									</div>
								{/if}
								<div class="modal-button">
									<Button
										buttonProps={{ type: 'button', id: 'output' }}
										type="tertiary"
										size="md"
										on:click={openOutputModal}
									>
										{outputButtonText}
									</Button>
								</div>
							</span>
						</div>
					</NftCreation>
				</div>
			</Form>
		{/if}
		{#if collection.nfts?.length > 0}
			<AdditionalConfiguration bind:collection />
			<div class="button-container">
				<Button
					size="md"
					type={collection.nfts && collection.nfts.length > 0 ? 'primary' : 'tertiary'}
					on:click={review}
					buttonProps={{ id: 'review' }}
				>
					Review
				</Button>
			</div>
		{/if}
	</div>
	{#if showForm}
		<ImageNftPreview nft={$form} {collection} {imageFile} discard={handleImageDiscard} {standard} />
	{:else}
		<AdvancedCollectionPreview {collection} />
	{/if}
</main>

<Modal
	on:close={() => {
		errorList = undefined;
	}}
	show={errorList &&
		bind(FormErrorModal, {
			errorList,
		})}
/>

<Modal
	on:close={() => {
		formModal = undefined;
	}}
	show={formModal}
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

			.dropzone {
				margin-bottom: 16px;
				width: 100%;
			}

			h3 {
				color: var(--text-header);
				font-size: 16px;
				margin-bottom: 16px;
			}

			.modal-button {
				padding-bottom: 16px;
				margin-bottom: 16px;
				border-bottom: 1px solid var(--stroke-tertiary);
				display: flex;
				flex-direction: column;
			}
			.modal-info {
				padding: 1.5em 12px;
				display: flex;
				flex-direction: column;
				border: 0.4px solid var(--stroke-tertiary);
				margin-bottom: 16px;
				color: var(--text-secondary);

				.value {
					font-weight: 300;
					margin-bottom: 4px;
				}
				.address {
					margin-right: 30px;
					word-break: break-word;
				}
			}
		}

		h2 {
			font-size: 28px;
			color: var(--text-header);
			margin-bottom: 16px;
		}
		h4 {
			margin-bottom: 16px;
			color: var(--text-header);
			font-weight: 400;
			font-size: 16px;
		}
		.nft-list {
			padding-bottom: 16px;
			border-bottom: 1px solid var(--stroke-tertiary);
			margin-bottom: 16px;
		}

		.add-text {
			color: var(--text-secondary);
			font-weight: 300;
			margin-bottom: 16px;
		}

		.button-container {
			margin-top: 16px;
			margin-left: auto;
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
