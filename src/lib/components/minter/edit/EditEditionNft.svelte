<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import { BigNumber } from 'ethers';
	import { editionValidationSchema } from '$models/minter/validation-schemas/edition-validation';
	import { getErrorList } from '$lib/utils/getErrorList';
	import Modal, { bind, type ModalType } from '$lib/components/Modal.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import Form from '../form/Form.svelte';
	import NftEdit from './NftEdit.svelte';
	import type { EditionConfig } from '$models/minter/nft-config';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	/*
	TODO: Tooltip text
	*/
	export let close: () => void;
	export let nft: EditionConfig;
	export let updateNft: (form: EditionConfig) => void;

	let currency = BigNumber.from(V2_CURRENCY_ETH);
	let advancedMode = true;
	let errorList: { field: string; message: string }[];
	let formModal: ModalType;

	const { handleSubmit, errors, form, handleChange } = createForm<EditionConfig>({
		initialValues: nft,
		onSubmit: () => {
			updateNft($form);
			close();
		},
		validationSchema: editionValidationSchema,
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
</script>

<div class="container">
	<h2 class="header">Edit Edition NFT</h2>
	<Form onSubmit={handleSubmit}>
		<NftEdit bind:advancedMode errors={$errors} form={$form} {handleChange}>
			<div class="dropzone" class:border={advancedMode}>
				<UploadDropzone
					label="NFT"
					required={true}
					info="Tooltip text"
					accept={['.png', '.jpg', '.jpeg', '.gif', '.svg', '.glb', '.gltf']}
					title="Upload file"
					onDrop={handleImageSelect}
					preview={!!$form.file}
					discard={handleImageDiscard}
				>
					<img class="preview" src={imagePreview} alt={$form.file} />
				</UploadDropzone>
			</div>
			<div class="currency-input" id="edition-price">
				<label for="price">
					<PopInfo
						message="The ETH (Ether) price of the edition. Edition NFTs have the most basic pricing scheme.  Enter zero for the NFT to only cost a gas fee."
					>
						Price
					</PopInfo>
				</label>
				<CurrencyInput disabledCurrency step={0.0001} bind:currency bind:inputValue={$form.price} />
				{#if Number($form.price) === 0}
					<span>A price of 0 is free (gas only).</span>
				{/if}
			</div></NftEdit
		>
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

		.currency-input label {
			color: var(--text-header);
		}

		.currency-input span {
			color: var(--text-tertiary);
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
