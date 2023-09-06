<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import * as mm from 'music-metadata-browser';
	import Button from '$lib/components/Button.svelte';
	import { trackValidationSchema } from '$models/minter/validation-schemas/music-validation';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { getErrorList } from '$lib/utils/getErrorList';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import TrackFormContent from '../nft-form-content/TrackFormContent.svelte';
	import Form from '../form/Form.svelte';
	import type { TrackInfo } from '$models/minter/nft-config';
	import type { DropzoneOutput, FileWithPath } from '$models/minter/dropzone';
	/*
	TODO: Tooltip text
	*/
	export let close;
	export let track: TrackInfo;
	export let cover: string;
	export let updateTrack: (values: TrackInfo, track: TrackInfo) => void;
	export let updateCover: (cover: string) => void;

	let tracks = [
		{
			file: track.file,
			name: track.name,
			artist: track.artist,
			duration: 0,
			isSunvox: track.isSunvox,
		},
	];
	const onSubmit = (values: TrackInfo) => {
		close();
		updateTrack(values, track);
		updateCover(cover);
	};

	const formState = createForm<TrackInfo>({
		initialValues: track,
		onSubmit,
		validationSchema: trackValidationSchema,
	});

	const { handleSubmit, errors, form, handleChange } = formState;

	let errorList;
	errors.subscribe((value) => {
		const trackErrors = getErrorList(value, { path: 'Track' });
		if (trackErrors.length > 0) {
			errorList = trackErrors;
		}
	});

	const handleMusicSelect = async (file: DropzoneOutput, acceptedFiles: FileWithPath[]) => {
		const format: string = acceptedFiles[0].name.split('.').pop().toUpperCase();
		let duration = 0;
		if (format !== 'SUNVOX') {
			try {
				const metadata = await mm.parseBlob(acceptedFiles[0]);
				$form.name = metadata?.common.title;
				$form.artist = metadata?.common.artist;
				duration = metadata?.format.duration;
			} catch (e) {
				console.log(e);
			}
		}
		$form.file = ipfsCidUrl(file.pinInfo.IpfsHash);
		$form.isSunvox = format === 'SUNVOX';
		tracks = [
			...tracks,
			{
				file: $form.isSunvox ? $form.file : file.preview,
				name: $form.name,
				artist: $form.artist,
				duration,
				isSunvox: $form.isSunvox,
			},
		];
	};

	const handleMusicDiscard = () => {
		$form.file = '';
		tracks.pop();
	};

	const updateTracks = () => {
		if (tracks.length > 0) {
			tracks[0].name = track.name;
			tracks[0].artist = track.artist;
		}
	};

	const handleCoverSelect = (file: DropzoneOutput) => {
		cover = ipfsCidUrl(file.pinInfo.IpfsHash);
	};
</script>

<div class="container">
	<h2 class="header">Edit</h2>
	<Form onSubmit={handleSubmit}>
		<TrackFormContent
			{handleChange}
			{updateTracks}
			{handleMusicSelect}
			{handleMusicDiscard}
			bind:cover
			{tracks}
			trackForm={$form}
			errors={$errors}
		/>
		{#if tracks.length > 0 && !cover}
			<h3 class="title">
				Preview
				<PopInfo message="Tooltip text" placement="bottom" />
			</h3>
			<p class="description">
				Because you’ve included multimedia, you’ll need to provide an image (PNG, JPG, or GIF) for
				the card display of your item or album.
			</p>
			<div class="dropzone">
				<UploadDropzone
					accept={['.png', '.jpg', '.jpeg', '.gif', '.svg']}
					title="Upload Image"
					onDrop={handleCoverSelect}
				/>
			</div>
		{/if}
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
		}
		.description {
			font-weight: 500;
			font-size: 14px;
			line-height: 16px;
			color: var(--text-tertiary);
			margin-bottom: 12px;
		}
		.dropzone {
			margin-bottom: 24px;
		}
		.title {
			margin-left: 2px;
			margin-bottom: 10px;
			color: var(--text-header);
			font-size: 14px;
			font-weight: 500;
			display: flex;
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
