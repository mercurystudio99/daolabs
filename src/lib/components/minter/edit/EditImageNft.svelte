<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import { imageValidationSchema } from '$models/minter/validation-schemas/image-validation';
	import { getErrorList } from '$lib/utils/getErrorList';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import Button from '$lib/components/Button.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import Form from '../form/Form.svelte';
	import EditImageOutput from './EditImageOutput.svelte';
	import NftEdit from './NftEdit.svelte';
	import type { ImageNftConfig } from '$models/minter/nft-config';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	/*
	TODO: Tooltip text
	*/
	export let close: () => void;
	export let nft: ImageNftConfig;
	export let updateNft: (form: ImageNftConfig) => void;

	let advancedMode = true;
	let errorList;
	let formModal;

	const { handleSubmit, errors, form, handleChange } = createForm<ImageNftConfig>({
		initialValues: nft,
		onSubmit: () => {
			updateNft($form);
			close();
		},
		validationSchema: imageValidationSchema,
	});

	errors.subscribe((value) => {
		const imageErrors = getErrorList(value, { file: 'Image' });
		if (imageErrors.length > 0) {
			errorList = imageErrors;
		}
	});

	let imagePreview = $form.file;
	const handleImageSelect = (file: DropzoneOutput) => {
		imagePreview = file.preview;
		$form.file = ipfsCidUrl(file.pinInfo.IpfsHash);
	};

	const handleImageDiscard = () => {
		imagePreview = '';
		$form.file = '';
	};

	const updateOutput = (colors: string[], resolution: string) => {
		$form.defaultColor = colors[0];
		$form.outputResolution = resolution;
	};

	const openOutputModal = () => {
		formModal = bind(EditImageOutput, {
			saveData: updateOutput,
			colors: [$form.defaultColor],
			resolution: $form.outputResolution,
			close: () => {},
		});
	};

	$: outputButtonText = $form.defaultColor || $form.outputResolution ? 'Edit' : 'Add';
</script>

<div class="container">
	<h2 class="header">Edit Image NFT</h2>
	<Form onSubmit={handleSubmit}>
		<NftEdit bind:advancedMode errors={$errors} form={$form} {handleChange}>
			<div class="dropzone" class:border={advancedMode}>
				<UploadDropzone
					label="Image NFT"
					required={true}
					info="Tooltip text"
					accept={['.png', '.jpg', '.jpeg', '.gif', '.svg', '.glb', '.gltf']}
					title="Upload Image"
					onDrop={handleImageSelect}
					preview={!!$form.file}
					discard={handleImageDiscard}
				>
					<img class="preview" src={imagePreview} alt={$form.file} />
				</UploadDropzone>
			</div>
			<div slot="advanced">
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
				<h3>Output Settings</h3>
				<div class="modal-button">
					<Button
						buttonProps={{ type: 'button' }}
						type="tertiary"
						size="md"
						on:click={openOutputModal}
					>
						{outputButtonText}
					</Button>
				</div>
			</div>
		</NftEdit>
	</Form>
</div>
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
	.container {
		display: flex;
		flex-direction: column;
		width: 536px;
		padding: 32px;

		.header {
			color: var(--text-header);
		}

		.dropzone {
			margin-bottom: 16px;
			width: 100%;
			.preview {
				width: 100%;
				border-radius: 10px;
			}
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
			padding: 8px 12px;
			display: flex;
			flex-direction: column;
			border: 0.4px solid var(--stroke-tertiary);
			margin-bottom: 16px;
			color: var(--text-secondary);

			.value {
				font-weight: 300;
				margin-bottom: 4px;
			}
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 700px) {
		.container {
			width: auto;
			padding: 16px;
		}
	}
</style>
