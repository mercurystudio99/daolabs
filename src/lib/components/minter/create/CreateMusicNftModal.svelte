<script lang="ts">
	import { flip } from 'svelte/animate';
	import { createForm } from 'svelte-forms-lib';
	import { onMount } from 'svelte';
	import * as mm from 'music-metadata-browser';
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import Modal, { bind, type ModalType } from '$lib/components/Modal.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { generateId } from '$lib/utils/generateId';
	import { getErrorList } from '$lib/utils/getErrorList';
	import {
		initialMusicNftConfig,
		initialMusicAlbum,
		initialTrack,
		NftStatus,
		NftType,
		type MusicNftConfig,
		type MusicAlbum,
		type TrackInfo,
	} from '$models/minter/nft-config';
	import {
		musicAlbumValidationSchema,
		musicValidationSchema,
		trackValidationSchema,
	} from '$models/minter/validation-schemas/music-validation';
	import { deepCopy } from '$utils/object';
	import { ipfsCidUrl } from '$utils/ipfs';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { getFileSizeString } from '$utils/files';
	import {
		musicNftCreationAdvancedOptions,
		musicNftCreationOptions,
		nftCreationNextOptions,
	} from '$utils/introjs/options';
	import touchHelperDirective from '$utils/touchHelper';
	import AdditionalConfiguration from '../card/AdditionalConfiguration.svelte';
	import NftPreviewCards from '../card/NftPreviewCards.svelte';
	import DraggableListItem from '../draggable-list-item/DraggableListItem.svelte';
	import FormBlock from '../form-block/FormBlock.svelte';
	import Form from '../form/Form.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import NftCreation from '../nft-creation/NftCreation.svelte';
	import AdvancedCollectionPreview from '../preview/AdvancedCollectionPreview.svelte';
	import MusicNftPreview from '../preview/MusicNftPreview.svelte';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import EditMusicAlbum from '../edit/EditMusicAlbum.svelte';
	import FormInput from '../form/FormInput.svelte';
	import EditTrack from '../edit/EditTrack.svelte';
	import PlaybackBlock from '../form-block/PlaybackBlock.svelte';
	import type { MusicTrack } from '$models/minter/music-player';
	import type { DropzoneOutput, FileWithPath } from '$models/minter/dropzone';
	import type { AdvancedCollection, MusicCollection } from '$models/minter/collection-config';
	import type { TokenStandard } from '$models/minter/token-standard';

	export let close: () => void;
	export let standard: TokenStandard;
	export let deleteDumpNft: (index: number) => void;
	export let collection: MusicCollection;
	export let saveCollection: (collection: AdvancedCollection) => Promise<void>;
	export let getIntro: (introOptions: any, hintOptions: any) => void;

	let formModal: ModalType;
	let advancedMode = true;
	let showForm = !collection.nfts?.length;
	let showAlbumForm = true;
	let showTrackForm = true;
	let keepDescription = false;
	let keepLink = false;
	let tracks: MusicTrack[] = [];
	let musicFile: DropzoneOutput;
	let musicSize: string;
	let hovering: number;
	let errorList: { field: string; message: string }[];

	const review = async () => {
		await saveCollection({ ...collection, nftType: NftType.MUSIC, standard });
		close();
	};

	const resetIntro = (mode: boolean) => {
		if (mode) {
			const options = {
				steps: [
					...musicNftCreationOptions.steps.slice(0, -2),
					...musicNftCreationAdvancedOptions.steps,
					...musicNftCreationOptions.steps.slice(-2),
				],
				dontShowAgain: true,
			};
			getIntro(options, null);
		} else {
			getIntro(musicNftCreationOptions, null);
		}
	};

	const { handleSubmit, errors, form, handleChange, handleReset } = createForm<MusicNftConfig>({
		initialValues: initialMusicNftConfig,
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
			tracks = [];
			musicFile = undefined;
			handleReset();
			getIntro(nftCreationNextOptions, null);
		},
		validationSchema: musicValidationSchema,
	});

	const submitOverride = (e: Event) => {
		handleSubmit(e);
	};

	errors.subscribe((value) => {
		const err = getErrorList(value, { file: 'Track' });
		if (err.length > 0) {
			errorList = err;
		}
	});

	const createAnother = () => {
		showForm = true;
		showAlbumForm = true;
		showTrackForm = true;
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
	const updateOrder = (list: MusicNftConfig[]) => {
		collection.nfts = list;
	};

	const updateNft = (nftConfig: MusicNftConfig) => {
		const nftIndex = collection.nfts.findIndex((i) => i._id === nftConfig._id);
		collection.nfts[nftIndex] = nftConfig;
		collection = collection;
	};

	const updateAlbumOrder = (list: MusicAlbum[]) => {
		$form.albums = [...list];
	};
	const updateAlbum = (values: MusicAlbum, id: string) => {
		const albumToUpdate = $form.albums.findIndex((p) => p._id === id);
		$form.albums[albumToUpdate] = deepCopy(values);
		form.set($form);
	};
	const openAlbumEditModal = (album: MusicAlbum) => {
		formModal = bind(EditMusicAlbum, { album, updateAlbum, close: () => {} });
	};

	const deleteAlbum = (index: number) => {
		$form.albums.splice(index, 1);
		form.set($form);
	};

	const {
		handleChange: albumHandleChange,
		handleReset: albumHandleReset,
		handleSubmit: albumHandleSubmit,
		form: albumForm,
		errors: albumErrors,
	} = createForm<MusicAlbum>({
		initialValues: initialMusicAlbum,
		onSubmit: () => {
			$albumForm._status = NftStatus.SAVED;
			$form.albums.push(deepCopy($albumForm));
			form.set($form);
			tracks = [];
			albumHandleReset();
			showAlbumForm = false;
			musicFile = undefined;
		},
		validationSchema: musicAlbumValidationSchema,
	});

	const createAnotherAlbum = () => {
		$albumForm._id = generateId();
		showAlbumForm = true;
	};

	albumErrors.subscribe((value) => {
		const err = getErrorList(value, { file: 'Track' });
		if (err.length > 0) {
			errorList = err;
		}
	});

	const {
		handleSubmit: trackHandleSubmit,
		handleReset: trackHandleReset,
		handleChange: trackHandleChange,
		errors: trackErrors,
		form: trackForm,
	} = createForm<TrackInfo>({
		initialValues: initialTrack,
		onSubmit: () => {
			$trackForm._status = NftStatus.SAVED;
			$albumForm.tracks.push(deepCopy($trackForm));
			albumForm.set($albumForm);
			trackHandleReset();
			showTrackForm = false;
			musicFile = undefined;
		},
		validationSchema: trackValidationSchema,
	});

	trackErrors.subscribe((value) => {
		const err = getErrorList(value, { file: 'Track' });
		if (err.length > 0) {
			errorList = err;
		}
	});

	const createAnotherTrack = () => {
		$trackForm._id = generateId();
		showTrackForm = true;
	};

	onMount(() => {
		const options = {
			steps: [
				...musicNftCreationOptions.steps.slice(0, -2),
				...musicNftCreationAdvancedOptions.steps,
				...musicNftCreationOptions.steps.slice(-2),
			],
			dontShowAgain: true,
		};
		getIntro(options, null);
	});

	const discardTrack = (index: number) => {
		if ($albumForm.tracks[index]) {
			$albumForm.tracks.splice(index, 1);
			albumForm.set($albumForm);
		} else {
			$trackForm.file = '';
			$trackForm.name = '';
			$trackForm.artist = '';
			musicFile = undefined;
		}
		tracks.splice(index, 1);
		tracks = tracks;
	};

	const updateTrackOrder = (list: TrackInfo[]) => {
		$albumForm.tracks = [...list];
	};

	const updateTrack = (values: TrackInfo, track: TrackInfo) => {
		const trackToUpdate = $albumForm.tracks.findIndex(
			(t) => t.name === track.name && t.artist === track.artist,
		);
		$albumForm.tracks[trackToUpdate] = deepCopy(values);
	};

	const handleCoverSelect = (file: DropzoneOutput) => {
		$albumForm.cover = ipfsCidUrl(file.pinInfo.IpfsHash);
	};

	const updateCover = (cover: string) => {
		$albumForm.cover = cover;
	};
	const openTrackEditModal = (track: TrackInfo) => {
		formModal = bind(EditTrack, {
			cover: $albumForm.cover,
			track,
			updateTrack,
			updateCover,
			close: () => {},
		});
	};

	const deleteTrack = (index: number) => {
		$albumForm.tracks.splice(index, 1);
		$albumForm.tracks = $albumForm.tracks;
		tracks.splice(index, 1);
		tracks = tracks;
	};
	const updateTracks = () => {
		// if file was uploaded and track info changed after
		if (tracks.length > $albumForm.tracks.length) {
			tracks[tracks.length - 1].name = $trackForm.name;
			tracks[tracks.length - 1].artist = $trackForm.artist;
		}
	};
	const handleMusicSelect = async (file: DropzoneOutput, acceptedFiles: FileWithPath[]) => {
		const format: string = acceptedFiles[0].name.split('.').pop().toUpperCase();
		let duration = 0;
		if (format !== 'SUNVOX') {
			try {
				const metadata = await mm.parseBlob(acceptedFiles[0]);
				if (metadata?.common.title) {
					$trackForm.name = metadata?.common.title;
				}
				if (metadata?.common.artist) {
					$trackForm.artist = metadata?.common.artist;
				}
				duration = metadata?.format.duration;
			} catch (e) {
				console.log(e);
			}
		}
		musicFile = file;
		musicSize = getFileSizeString(acceptedFiles[0].size);
		$trackForm.file = ipfsCidUrl(file.pinInfo.IpfsHash);
		$trackForm.isSunvox = format === 'SUNVOX';
		const trackInfo = $trackForm;
		tracks = [
			...tracks,
			{
				file: trackInfo.isSunvox ? trackInfo.file : file.preview,
				name: trackInfo.name,
				artist: trackInfo.artist,
				duration,
				isSunvox: trackInfo.isSunvox,
			},
		];
	};

	const handleTrackDiscard = () => {
		musicFile = undefined;
		// the last one in tracks is just added track
		discardTrack(tracks.length - 1);
	};
</script>

<main>
	<div class="form">
		<h2>Create Music NFT</h2>
		{#if collection.nfts?.length > 0}
			<h4>Review Music NFT</h4>
			<NftPreviewCards
				savedNfts={collection.nfts}
				{deleteNft}
				{updateOrder}
				{updateNft}
				colors={collection.defaultColors}
			/>

			<h4>Create Another Music NFT in Collection</h4>
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
					Add Music NFT
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
						onAdvanced={resetIntro}
					>
						<h4 class="title">
							<PopInfo message="Your music NFT can be made of .mp3, .wav, .ogg, or .sunvox files."
								>Music NFT<small>*</small></PopInfo
							>
						</h4>
						<FormBlock
							title="Music"
							info="Individual songs make up albums, and albums make up a music NFT. You can have one or more albums."
						>
							<p class="description">
								Your music NFT can be made up of many music files, which can then be grouped into
								albums. Albums are groups of individual files.
							</p>
							<div class="albums-container" use:touchHelperDirective>
								{#each $form.albums as album, index (album._id)}
									<div animate:flip>
										<DraggableListItem
											{index}
											bind:list={$form.albums}
											updateOrder={updateAlbumOrder}
											bind:hovering
										>
											<div
												class="album"
												class:is-active={hovering === index}
												on:dblclick={() => openAlbumEditModal(album)}
											>
												<div class="album-info">
													<SeemlessInput bind:value={album.name} />
													<!-- <SeemlessInput bind:value={album.amount} /> -->
												</div>
												<div class="delete" on:click={() => deleteAlbum(index)} on:keydown>
													<CloseButton size="0.5rem" position="0" color="--icon-action-primary" />
												</div>
											</div>
										</DraggableListItem>
									</div>
								{/each}
							</div>
							{#if showAlbumForm}
								<FormBlock>
									<span id="album-name-wrap">
										<FormInput
											id="album-name"
											label="Album Name"
											info="An album name is required if you create more than one album."
											name="album-name"
											placeholder="This album's name"
											description=""
											error={$albumErrors.name}
											on:change={albumHandleChange}
											bind:value={$albumForm.name}
										/>
									</span>
									{#if $albumForm.tracks.length > 0}
										<div
											class="tracks-container"
											class:border-bottom={showTrackForm}
											use:touchHelperDirective
										>
											{#each $albumForm.tracks as track, index (track._id)}
												<div animate:flip>
													<DraggableListItem
														{index}
														bind:list={$albumForm.tracks}
														updateOrder={updateTrackOrder}
														bind:hovering
													>
														<div
															class="track"
															class:is-active={hovering === index}
															on:dblclick={() => openTrackEditModal(track)}
														>
															<span>{index + 1}</span>
															<div class="track-info">
																<SeemlessInput bind:value={track.name} />
																<span>
																	<SeemlessInput bind:value={track.artist} />
																</span>
															</div>
															<div class="delete" on:click={() => deleteTrack(index)} on:keydown>
																<CloseButton
																	size="0.5rem"
																	position="0"
																	color="--icon-action-primary"
																/>
															</div>
														</div>
													</DraggableListItem>
												</div>
											{/each}
										</div>
									{/if}
									{#if showTrackForm}
										<h4 class="title">
											<PopInfo message="Upload a .mp3, .sunvox, .wav, or .ogg file."
												>Track file<small>*</small></PopInfo
											>
										</h4>
										<div class="dropzone" id="track-wrap">
											<UploadDropzone
												info="Upload a .mp3, .sunvox, .wav, or .ogg file."
												accept={['.mp3', '.sunvox', '.wav', '.ogg']}
												title="Upload file"
												onDrop={handleMusicSelect}
												discard={handleTrackDiscard}
												preview={!!$trackForm.file}
												id="track"
											>
												<div class="modal-info">
													<span class="address">
														{`${musicFile?.pinInfo?.IpfsHash} (${musicSize})`}
													</span>
												</div>
											</UploadDropzone>
										</div>
										<span id="track-name-wrap">
											<FormInput
												id="track-name"
												label="Track Name"
												info="A track name is required if you add more than one track to this album."
												name="track-name"
												placeholder="Track name"
												description="Your track's name."
												error={$trackErrors.name}
												disabled={!$trackForm.file}
												bind:value={$trackForm.name}
												on:blur={updateTracks}
												on:change={trackHandleChange}
											/>
										</span>
										<span id="artist-name-wrap">
											<FormInput
												id="artist-name"
												label="Artist Name"
												info="The artists name should match their name on streaming services."
												name="artist-name"
												placeholder="Artist name"
												description="The name of the artist."
												error={$trackErrors.artist}
												disabled={!$trackForm.file}
												bind:value={$trackForm.artist}
												on:blur={updateTracks}
												on:change={trackHandleChange}
											/>
										</span>
										<span id="playback-wrap">
											<PlaybackBlock bind:playback={$trackForm.playback} />
										</span>
										{#if tracks.length > 0 && !$albumForm.cover}
											<h3 class="title">
												Preview
												<PopInfo message="Tooltip text" placement="bottom" />
											</h3>
											<p class="description">
												Because you’ve included multimedia, you’ll need to provide an image (PNG,
												JPG, or GIF) for the card display of your item or album.
											</p>
											<div class="dropzone">
												<UploadDropzone
													accept={['.png', '.jpg', '.jpeg', '.gif', '.svg']}
													title="Upload Image"
													onDrop={handleCoverSelect}
												/>
											</div>
										{/if}
									{/if}
									<Button
										buttonProps={{ type: 'button', id: 'confirm-track' }}
										type={showTrackForm ? 'primary' : 'tertiary'}
										on:click={showTrackForm ? trackHandleSubmit : createAnotherTrack}
										size="md"
									>
										Add music file(s)
									</Button>
								</FormBlock>
							{/if}
							<FormBlock
								title="Create new album"
								info="Multiple albums allow you to include different groups of files in your NFT."
							>
								<Button
									buttonProps={{ type: 'button', id: 'confirm-album' }}
									type={showAlbumForm ? 'primary' : 'tertiary'}
									on:click={showAlbumForm ? albumHandleSubmit : createAnotherAlbum}
									size="md"
								>
									Add album
								</Button>
							</FormBlock>
						</FormBlock>
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
	{#if showForm && showAlbumForm}
		<MusicNftPreview
			nft={$form}
			{collection}
			{standard}
			bind:cover={$albumForm.cover}
			bind:tracks
			{discardTrack}
		/>
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

			.title {
				color: var(--text-header);
				small {
					align-self: flex-start;
				}
			}

			.description {
				font-weight: 500;
				font-size: 14px;
				line-height: 16px;
				color: var(--text-tertiary);
				margin-bottom: 12px;
			}
			.albums-container {
				display: flex;
				flex-direction: column;
				gap: 16px;
				margin-bottom: 16px;
				.album {
					position: relative;
					display: flex;
					padding: 16px;
					background: var(--background-l2);
					border: 0.4px solid var(--stroke-tertiary);
					color: var(--text-action-primary);
					cursor: default;
					&:hover {
						.delete {
							visibility: visible;
						}
					}
					.album-info {
						display: flex;
						flex-direction: column;
						flex-grow: 1;
						color: var(--text-tertiary);
						line-height: 16px;
					}
					.delete {
						visibility: hidden;
						position: absolute;
						top: 8px;
						right: 8px;
					}
				}
				.is-active {
					background: var(--background-action-highlight);
					color: var(--text-over-action-primary);
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
		.add-text {
			color: var(--text-secondary);
			font-weight: 300;
			margin-bottom: 16px;
		}

		.button-container {
			margin-top: 16px;
			margin-left: auto;
		}
		.description {
			font-weight: 500;
			font-size: 14px;
			line-height: 16px;
			color: var(--text-tertiary);
			margin-bottom: 12px;
		}
		.dropzone {
			margin-bottom: 16px;
		}
		.title {
			margin-left: 2px;
			margin-bottom: 10px;
			color: var(--text-header);
			font-size: 14px;
			font-weight: 500;
			display: flex;
		}
		.tracks-container {
			display: flex;
			flex-direction: column;
			gap: 16px;
			margin-bottom: 16px;
			border-top: 1px solid var(--stroke-tertiary);
			padding-top: 16px;
			.track {
				position: relative;
				display: flex;
				padding: 8px 16px;
				background: var(--background-l2);
				border: 0.4px solid var(--stroke-tertiary);
				color: var(--text-action-primary);
				cursor: default;

				span {
					color: var(--text-secondary);
				}
				&:hover {
					.delete {
						visibility: visible;
					}
				}
				.track-info {
					display: flex;
					flex-direction: column;
					flex-grow: 1;
					color: var(--text-action-primary);
					line-height: 16px;
					margin-left: 8px;
				}
				.delete {
					visibility: hidden;
					position: absolute;
					top: 8px;
					right: 8px;
				}
			}
			.is-active {
				background: var(--background-action-highlight);
				color: var(--text-over-action-primary);
			}
		}
		.border-bottom {
			border-bottom: 1px solid var(--stroke-tertiary);
			padding-bottom: 16px;
		}
		.modal-info {
			padding: 1.5em 12px;
			display: flex;
			flex-direction: column;
			border: 0.4px solid var(--stroke-tertiary);
			margin-bottom: 16px;
			color: var(--text-secondary);

			.address {
				margin-right: 30px;
				word-break: break-word;
			}
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
