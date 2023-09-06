<script lang="ts">
	import { onMount } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import { ipfsCidUrl } from '$utils/ipfs';
	import {
		nftCreationNextOptions,
		videoNftCreationAdvancedOptions,
		videoNftCreationOptions,
	} from '$utils/introjs/options';
	import { getFileSizeString } from '$utils/files';
	import { videoValidationSchema } from '$models/minter/validation-schemas/video-validation';
	import {
		initialVideoNftConfig,
		NftStatus,
		NftType,
		PlaybackType,
		type VideoNftConfig,
	} from '$models/minter/nft-config';
	import { getErrorList } from '$lib/utils/getErrorList';
	import { generateId } from '$lib/utils/generateId';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Modal, { bind, type ModalType } from '$lib/components/Modal.svelte';
	import Button from '$lib/components/Button.svelte';
	import { createCoverFromVideoNft } from '$lib/utils/video';
	import { processNotifications } from '$utils/notification';
	import AdditionalConfiguration from '../card/AdditionalConfiguration.svelte';
	import NftPreviewCards from '../card/NftPreviewCards.svelte';
	import EditVideoOutput from '../edit/EditVideoOutput.svelte';
	import Form from '../form/Form.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import NftCreation from '../nft-creation/NftCreation.svelte';
	import AdvancedCollectionPreview from '../preview/AdvancedCollectionPreview.svelte';
	import VideoNftPreview from '../preview/VideoNftPreview.svelte';
	import type { AdvancedCollection, VideoCollection } from '$models/minter/collection-config';
	import type { TokenStandard } from '$models/minter/token-standard';
	import type { DropzoneOutput, FileWithPath } from '$models/minter/dropzone';

	export let close: () => void;
	export let standard: TokenStandard;
	export let deleteDumpNft: (index: number) => void;
	export let collection: VideoCollection;
	export let saveCollection: (collection: AdvancedCollection) => Promise<void>;
	export let getIntro: (introOptions: any, hintOptions: any) => void;

	let showForm = !collection.nfts?.length;
	let keepDescription = false;
	let keepLink = false;
	let advancedMode = true;

	let videoFile: DropzoneOutput;
	let videoSize: string;
	let coverFile: DropzoneOutput;
	let coverSize: string;
	let reviewLoading: boolean;
	let formModal: ModalType;

	let errorList: { field: string; message: string }[];

	const resetIntro = (mode: boolean) => {
		if (mode) {
			const options = {
				steps: [
					...videoNftCreationOptions.steps.slice(0, -2),
					...videoNftCreationAdvancedOptions.steps,
					...videoNftCreationOptions.steps.slice(-2),
				],
				dontShowAgain: true,
			};
			getIntro(options, null);
		} else {
			getIntro(videoNftCreationOptions, null);
		}
	};

	const review = async () => {
		reviewLoading = true;
		const promises = [];
		collection.nfts.forEach((nft) => {
			const promise = createCoverFromVideoNft(nft);
			promises.push(promise);
		});
		// Wait for all the promises to be resolved before calling
		// the saveCollection function
		const processFunc = async () => {
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => {
					reject('Oh snap, couldnt create cover(s) in time!');
				}, 15000);
			});

			return Promise.race([Promise.all(promises), timeoutPromise]);
		};

		await processNotifications(processFunc, {
			pending: 'Trying to create cover(s).',
			success: 'Cover(s) created!',
			error: "Couldn't create cover(s).",
		});

		reviewLoading = false;
		await saveCollection({ ...collection, nftType: NftType.VIDEO, standard });
		close();
	};

	const { handleSubmit, errors, form, handleChange, handleReset } = createForm<VideoNftConfig>({
		initialValues: initialVideoNftConfig,
		onSubmit: () => {
			$form._status = NftStatus.SAVED;
			$form._id = generateId();
			if (!collection.nfts) {
				collection.nfts = [$form];
			} else {
				collection.nfts.push($form);
			}
			collection = collection;
			showForm = false;
			videoFile = undefined;
			videoSize = '';
			coverFile = undefined;
			coverSize = '';
			handleReset();
			getIntro(nftCreationNextOptions, null);
		},
		validationSchema: videoValidationSchema,
	});

	const submitOverride = (e: Event) => {
		handleSubmit(e);
	};

	errors.subscribe((value) => {
		const err = getErrorList(value, { file: 'Video' });
		if (err.length > 0) {
			errorList = err;
		}
	});

	onMount(() => {
		const options = {
			steps: [
				...videoNftCreationOptions.steps.slice(0, -2),
				...videoNftCreationAdvancedOptions.steps,
				...videoNftCreationOptions.steps.slice(-2),
			],
			dontShowAgain: true,
		};
		getIntro(options, null);
	});

	const createAnother = () => {
		showForm = true;
		if (keepDescription) {
			$form.description = collection.nfts[0].description;
		}
		if (keepLink) {
			$form.externalLink = collection.nfts[0].externalLink;
		}
	};
	const deleteNft = (index: number) => {
		collection.nfts.splice(index, 1);
		collection = collection;
		deleteDumpNft(index);
		if (collection.nfts?.length === 0) {
			showForm = true;
		}
	};
	const updateOrder = (list: VideoNftConfig[]) => {
		collection.nfts = list;
	};

	const updateNft = (nftConfig: VideoNftConfig) => {
		const nftIndex = collection.nfts.findIndex((i) => i._id === nftConfig._id);
		collection.nfts[nftIndex] = nftConfig;
		collection = collection;
	};

	const handleVideoSelect = (file: DropzoneOutput, acceptedFiles: FileWithPath[]) => {
		$form.file = ipfsCidUrl(file.pinInfo.IpfsHash);
		videoSize = getFileSizeString(acceptedFiles[0].size);
		videoFile = file;
	};

	const handleVideoDiscard = () => {
		$form.file = '';
		videoFile = undefined;
		videoSize = '';
	};
	const handleCoverSelect = (file: DropzoneOutput, acceptedFiles: FileWithPath[]) => {
		$form.cover = ipfsCidUrl(file.pinInfo.IpfsHash);
		coverSize = getFileSizeString(acceptedFiles[0].size);
		coverFile = file;
	};

	const handleCoverDiscard = () => {
		$form.cover = '';
		coverSize = '';
		coverFile = undefined;
	};
	const updateOutput = (
		resolution: string,
		playback: {
			type: PlaybackType;
			value: string;
		},
	) => {
		$form.outputResolution = resolution;
		$form.playback = playback;
	};

	const openOutputModal = () => {
		formModal = bind(EditVideoOutput, {
			saveData: updateOutput,
			resolution: $form.outputResolution,
			playback: $form.playback,
			close: () => {},
		});
	};
</script>

<main>
	<div class="form">
		<h2>Create Video NFT</h2>
		{#if collection.nfts?.length > 0}
			<h4>Review Video NFT</h4>
			<div class="nft-list">
				<NftPreviewCards
					savedNfts={collection.nfts}
					{deleteNft}
					{updateOrder}
					{updateNft}
					colors={collection.defaultColors}
				/>
			</div>

			<h4>Create Another Video NFT in Collection</h4>
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
					Add Video NFT
				</Button>
			{/if}
		{/if}
		{#if showForm}
			<Form onSubmit={submitOverride}>
				<div class="box">
					<NftCreation
						bind:advancedMode
						errors={$errors}
						bind:form={$form}
						{handleChange}
						bind:keepDescription
						bind:keepLink
						addDisabled={!videoFile}
						onAdvanced={resetIntro}
					>
						<h4 class="title">
							<PopInfo message="Upload a .mp4 or .webm file.">Video NFT<small>*</small></PopInfo>
						</h4>
						<div class="dropzone" id="video-wrap">
							<UploadDropzone
								info="Tooltip text"
								accept={['.mp4', '.webm']}
								title="Upload Video"
								onDrop={handleVideoSelect}
								preview={!!$form.file}
								discard={handleVideoDiscard}
								id="video"
							>
								<div class="modal-info">
									<span class="address">
										{`${videoFile.pinInfo.IpfsHash} (${videoSize})`}
									</span>
								</div>
							</UploadDropzone>
						</div>
						<div slot="advanced">
							<p class="description">
								Because you’ve included multimedia, you can provide an image (PNG, JPG, or GIF) for
								the card display of your item. Otherwise, we'll try and generate one for you.
							</p>
							<div class="dropzone">
								<UploadDropzone
									accept={['.png', '.jpg', '.jpeg', '.gif', '.svg']}
									title="Upload Image"
									onDrop={handleCoverSelect}
									preview={!!$form.cover}
									discard={handleCoverDiscard}
									id="cover"
								>
									<div class="modal-info">
										<span class="address">
											{`${coverFile.pinInfo.IpfsHash} (${coverSize})`}
										</span>
									</div>
								</UploadDropzone>
							</div>
							<h3>Output settings</h3>
							<div class="modal-info">
								Playback:
								<span class="value">
									{#if $form.playback.type === PlaybackType.ONCE}
										Play once
									{:else if $form.playback.type === PlaybackType.TIMES}
										{`Play ${String($form.playback.value)} times`}
									{:else}
										Repeat
									{/if}
								</span>
								{#if $form.outputResolution}
									Resolution:
									<span class="value">
										{$form.outputResolution}
									</span>
								{/if}
							</div>
							<div class="modal-button">
								<Button
									buttonProps={{ type: 'button', id: 'output' }}
									type="tertiary"
									size="md"
									on:click={openOutputModal}
								>
									Edit
								</Button>
							</div>
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
					loading={reviewLoading}
					buttonProps={{ id: 'review' }}
				>
					Review
				</Button>
			</div>
		{/if}
	</div>
	{#if showForm}
		<VideoNftPreview nft={$form} {collection} {videoFile} discard={handleVideoDiscard} {standard} />
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
	styleInnerContent={{ overflow: 'visible' }}
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

			.title {
				color: var(--text-header);
				small {
					align-self: flex-start;
				}
			}

			.dropzone {
				margin-bottom: 16px;
				width: 100%;
			}
			.description {
				font-weight: 500;
				font-size: 14px;
				line-height: 16px;
				color: var(--text-tertiary);
				margin-bottom: 12px;
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
