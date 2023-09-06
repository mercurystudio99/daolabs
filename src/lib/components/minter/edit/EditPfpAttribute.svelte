<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import { pfpAttributeValidationSchema } from '$models/minter/validation-schemas/pfp-validation';
	import { getErrorList } from '$lib/utils/getErrorList';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import Button from '$lib/components/Button.svelte';
	import ClosableInfoBox from '../closable-info-box/ClosableInfoBox.svelte';
	import Form from '../form/Form.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import PfpAttributeFormContent from '../nft-form-content/PfpAttributeFormContent.svelte';
	import type { PfpAttribute } from '$models/minter/nft-config';

	export let close;
	export let attribute: PfpAttribute;
	export let updateAttribute: (values: PfpAttribute) => void;

	const submit = (values: PfpAttribute) => {
		updateAttribute(values);
		close();
	};

	const formState = createForm<PfpAttribute>({
		initialValues: attribute,
		onSubmit: submit,
		validationSchema: pfpAttributeValidationSchema,
	});

	const { errors, handleChange, handleSubmit, form } = formState;

	let errorList;
	errors.subscribe((value) => {
		const imageErrors = getErrorList(value, { IpfsHash: 'Image' });
		if (imageErrors.length > 0) {
			errorList = imageErrors;
		}
	});
</script>

<div class="container">
	<h2 class="header">Edit attribute</h2>
	<p>
		Attributes are essentially folders which contain files which will be used as part of the
		generative process.
	</p>
	<ClosableInfoBox
		info="Attributes will be used without constraint unless you set a limiter such as used n times or use 1%."
		classes="margin"
		id="pfp-attributes-info"
	/>
	<Form onSubmit={handleSubmit}>
		<PfpAttributeFormContent {handleChange} bind:attributeForm={$form} errors={$errors} />
		<div class="button-container">
			<Button size="md">Update</Button>
		</div>
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
			margin-bottom: 16px;
		}

		p {
			font-weight: 300;
			color: var(--text-secondary);
		}
		.button-container {
			display: flex;
			justify-content: flex-end;
		}
	}
</style>
