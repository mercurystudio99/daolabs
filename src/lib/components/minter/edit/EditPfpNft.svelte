<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import { getErrorList } from '$lib/utils/getErrorList';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { prepareAllAttributes } from '$lib/utils/nftCreationUtils';
	import { pfpValidationSchema } from '$models/minter/validation-schemas/pfp-validation';
	import {
		initialModificationConfig,
		type NftConfig,
		type PfpNftConfig,
	} from '$models/minter/nft-config';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import PfpFormContent from '../nft-form-content/PfpFormContent.svelte';
	import Form from '../form/Form.svelte';
	import DefaultColorBlock from '../form-block/DefaultColorBlock.svelte';
	import NftEdit from './NftEdit.svelte';

	export let close: () => void;
	export let nft: PfpNftConfig;
	export let updateNft: (form: NftConfig) => void;

	let advancedMode = true;
	let errorList: { field: string; message: string }[];
	let attrModification = initialModificationConfig;

	function getInitialValues() {
		// TODO: fix the saving of default color being a dictionary and not an array
		if (nft.defaultColors) {
			nft.defaultColors = Object.values(nft.defaultColors);
		}
		return nft;
	}

	const { handleSubmit, errors, form, handleChange } = createForm<PfpNftConfig>({
		initialValues: getInitialValues(),
		onSubmit: () => {
			const totalPermutation = $form.layers.reduce((acc, val) => acc * val.properties.length, 1);
			if (totalPermutation < Number($form.totalSupply)) {
				errorList = [
					{
						field: 'Attributes',
						message: 'Total permutation of layers must be equal to or bigger than total supply.',
					},
				];
				return;
			}
			if (attrModification.name.status) {
				if (attrModification.name.removeUnderscore) {
					$form.layers.forEach((attr) => {
						attr.name = attr.name.replace(/_/g, ' ');
					});
				}
				if (attrModification.name.capStatus === 'sentenceCase') {
					$form.layers.forEach((attr) => {
						attr.name =
							String(attr.name.charAt(0).toUpperCase()) + String(attr.name.substr(1).toLowerCase());
					});
				} else if (attrModification.name.capStatus === 'allCaps') {
					$form.layers.forEach((attr) => {
						attr.name = attr.name.toUpperCase();
					});
				}
			}
			if (attrModification.value.status) {
				if (attrModification.value.removeUnderscore) {
					$form.layers.forEach((attr) => {
						attr.properties.forEach((property) => {
							property.name = property.name.replace(/_/g, ' ');
						});
					});
				}
				if (attrModification.value.capStatus === 'sentenceCase') {
					$form.layers.forEach((attr) => {
						attr.properties.forEach((property) => {
							property.name =
								String(property.name.charAt(0).toUpperCase()) +
								String(property.name.substr(1).toLowerCase());
						});
					});
				} else if (attrModification.value.capStatus === 'allCaps') {
					$form.layers.forEach((attr) => {
						attr.properties.forEach((property) => {
							property.name = property.name.toUpperCase();
						});
					});
				}
			}
			const prepared = prepareAllAttributes($form as PfpNftConfig);
			updateNft(prepared);
			close();
		},
		validationSchema: pfpValidationSchema,
	});

	errors.subscribe((value) => {
		const imageErrors = getErrorList(value, { IpfsHash: 'Image' });
		if (imageErrors.length > 0) {
			errorList = imageErrors;
		}
	});
</script>

<div class="container">
	<h2 class="header">Edit PFP NFT</h2>
	<Form onSubmit={handleSubmit}>
		<NftEdit
			bind:advancedMode
			errors={$errors}
			form={$form}
			bind:attrModification
			{handleChange}
			showOptions={{
				properties: false,
				supply: true,
			}}
		>
			<PfpFormContent bind:form={$form} {handleChange} nested />
			<div slot="advanced">
				<DefaultColorBlock
					info="PFPs can override the collection's palette, allowing a subset of NFTs to have different colors."
					bind:colors={$form.defaultColors}
					maxLength={6}
				/>
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

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		width: 536px;
		padding: 32px;

		.header {
			color: var(--text-header);
			margin: 0;
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
