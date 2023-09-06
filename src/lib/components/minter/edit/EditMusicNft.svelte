<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import { musicValidationSchema } from '$models/minter/validation-schemas/music-validation';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { getErrorList } from '$lib/utils/getErrorList';
	import Form from '../form/Form.svelte';
	import MusicFormContent from '../nft-form-content/MusicFormContent.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import NftEdit from './NftEdit.svelte';
	import type { MusicNftConfig } from '$models/minter/nft-config';

	export let close: () => void;
	export let nft: MusicNftConfig;
	export let updateNft: (form: MusicNftConfig) => void;

	let advancedMode = true;

	const { handleSubmit, errors, form, handleChange } = createForm<MusicNftConfig>({
		initialValues: nft,
		onSubmit: () => {
			updateNft($form);
			close();
		},
		validationSchema: musicValidationSchema,
	});

	let errorList: { field: string; message: string }[];
	errors.subscribe((value) => {
		const musicErrors = getErrorList(value, { IpfsHash: 'Track' });
		if (musicErrors.length > 0) {
			errorList = musicErrors;
		}
	});
</script>

<div class="container">
	<h2 class="header">Edit Music NFT</h2>
	<Form onSubmit={handleSubmit}>
		<NftEdit bind:advancedMode errors={$errors} form={$form} {handleChange}>
			<MusicFormContent form={$form} {handleChange} errors={$errors} />
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
			margin-bottom: 16px;
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
