<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import Button from '$lib/components/Button.svelte';
	import { musicAlbumValidationSchema } from '$models/minter/validation-schemas/music-validation';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { getErrorList } from '$lib/utils/getErrorList';
	import Form from '../form/Form.svelte';
	import MusicAlbumFormContent from '../nft-form-content/MusicAlbumFormContent.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import type { MusicAlbum } from '$models/minter/nft-config';

	export let close;
	export let album: MusicAlbum;
	export let updateAlbum: (values: MusicAlbum, id: string) => void;

	const onSubmit = (values: MusicAlbum) => {
		updateAlbum(values, album._id);
		close();
	};

	const formState = createForm<MusicAlbum>({
		initialValues: album,
		onSubmit,
		validationSchema: musicAlbumValidationSchema,
	});

	const { handleSubmit, errors, form, handleChange } = formState;

	let errorList;
	errors.subscribe((value) => {
		const musicErrors = getErrorList(value, { path: 'Track' });
		if (musicErrors.length > 0) {
			errorList = musicErrors;
		}
	});

	let tracks = album.tracks.map((track) => ({
		file: track.file,
		name: track.name,
		artist: track.artist,
	}));
</script>

<div class="container">
	<h2 class="header">Edit</h2>
	<Form onSubmit={handleSubmit}>
		<MusicAlbumFormContent bind:tracks {handleChange} albumForm={$form} errors={$errors} />
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
		.button-container {
			display: flex;
			justify-content: flex-end;
			margin-top: 16px;
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
