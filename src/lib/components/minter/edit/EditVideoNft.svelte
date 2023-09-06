<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import { PlaybackType, type VideoNftConfig } from '$models/minter/nft-config';
	import { videoValidationSchema } from '$models/minter/validation-schemas/video-validation';
	import { getErrorList } from '$lib/utils/getErrorList';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import FormBlock from '../form-block/FormBlock.svelte';
	import Form from '../form/Form.svelte';
	import FormInput from '../form/FormInput.svelte';
	import RadioButton from '../radio-button/RadioButton.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import NftEdit from './NftEdit.svelte';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	/*
	TODO: Tooltip text
	*/
	export let close: () => void;
	export let nft: VideoNftConfig;
	export let updateNft: (form: VideoNftConfig) => void;

	let advancedMode = true;
	let errorList: { field: string; message: string }[];
	let coverFile: DropzoneOutput;
	let videoFile: DropzoneOutput;

	const { handleSubmit, errors, form, handleChange } = createForm<VideoNftConfig>({
		initialValues: nft,
		onSubmit: () => {
			updateNft($form);
			close();
		},
		validationSchema: videoValidationSchema,
	});

	errors.subscribe((value) => {
		const videoErrors = getErrorList(value, { IpfsHash: 'Video' });
		if (videoErrors.length > 0) {
			errorList = videoErrors;
		}
	});

	const handleVideoSelect = (file: DropzoneOutput) => {
		$form.file = ipfsCidUrl(file.pinInfo.IpfsHash);
		videoFile = file;
	};

	const handleVideoDiscard = () => {
		$form.file = '';
		videoFile = undefined;
	};
	const handleCoverSelect = (file: DropzoneOutput) => {
		$form.cover = ipfsCidUrl(file.pinInfo.IpfsHash);
		coverFile = file;
	};

	const handleCoverDiscard = () => {
		$form.cover = '';
		coverFile = undefined;
	};
</script>

<div class="container">
	<h2 class="header">Edit Video NFT</h2>
	<Form onSubmit={handleSubmit}>
		<NftEdit bind:advancedMode errors={$errors} form={$form} {handleChange}>
			<div class="dropzone">
				<UploadDropzone
					label={$form.file ? 'Preview' : ''}
					info={'Tooltip text'}
					accept={['.mp4', '.webm']}
					title="Upload Video"
					onDrop={handleVideoSelect}
					preview={!!$form.file}
					discard={handleVideoDiscard}
				>
					<!-- svelte-ignore a11y-media-has-caption -->
					<video controls class="video-preview" src={videoFile?.preview} />
				</UploadDropzone>
			</div>
			{#if advancedMode}
				<p class="description">
					Because you’ve included multimedia, you’ll need to provide an image (PNG, JPG, or GIF) for
					the card display of your item.
				</p>
				<div class="dropzone">
					<UploadDropzone
						accept={['.png', '.jpg', '.jpeg', '.gif', '.svg']}
						title="Upload Image"
						onDrop={handleCoverSelect}
						preview={!!$form.cover}
						discard={handleCoverDiscard}
					>
						<img class="preview" src={$form.cover || coverFile?.preview} alt={$form.cover} />
					</UploadDropzone>
				</div>
				<FormBlock title="Playback" info={'Tooltip text'}>
					<RadioButton
						label="Play once"
						bind:group={$form.playback.type}
						value={PlaybackType.ONCE}
					/>
					<div class="compound-input">
						<RadioButton label="Play" bind:group={$form.playback.type} value={PlaybackType.TIMES} />
						<div class="input">
							<FormInput
								id="play-times"
								name="play-times"
								classes=""
								placeholder="5"
								on:change={handleChange}
								bind:value={$form.playback.value}
								disabled={$form.playback.type !== PlaybackType.TIMES}
							/>
						</div>
						<span class="text">times</span>
					</div>
					<RadioButton
						label="Repeat"
						bind:group={$form.playback.type}
						value={PlaybackType.REPEAT}
					/>
				</FormBlock>
				<FormBlock title="Output resolution" info={'Tooltip text'}>
					<FormInput
						id="output-resolution"
						name="output-resolution"
						classes=""
						info={'Tooltip text'}
						placeholder="1000x1000"
						description="Output resolution"
						on:change={handleChange}
						bind:value={$form.outputResolution}
					/>
				</FormBlock>
			{/if}
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

		.description {
			font-weight: 500;
			font-size: 14px;
			line-height: 16px;
			color: var(--text-tertiary);
			margin-bottom: 12px;
		}

		.compound-input {
			display: flex;
			margin: 6px 0;
			align-items: center;

			.input {
				margin: 0 6px;
				max-width: 60px;
			}

			.text {
				font-weight: 500;
				font-size: 14px;
				line-height: 24px;
			}
		}
		.dropzone {
			margin-bottom: 24px;
		}
		.preview {
			width: 100%;
			pointer-events: none;
			position: inherit;
			z-index: 100;
		}
		.video-preview {
			width: 100%;
			max-height: 500px;
			border-radius: 10px;
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
