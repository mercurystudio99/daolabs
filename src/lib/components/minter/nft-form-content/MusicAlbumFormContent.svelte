<script lang="ts">
	import { flip } from 'svelte/animate';
	import * as mm from 'music-metadata-browser';
	import Button from '$lib/components/Button.svelte';
	import {
		initialTrack,
		NftStatus,
		type MusicAlbum,
		type TrackInfo,
	} from '$models/minter/nft-config';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { deepCopy } from '$utils/object';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { generateId } from '$lib/utils/generateId';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import touchHelperDirective from '$utils/touchHelper';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import EditTrack from '../edit/EditTrack.svelte';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import FormInput from '../form/FormInput.svelte';
	import DraggableListItem from '../draggable-list-item/DraggableListItem.svelte';
	import TrackFormContent from './TrackFormContent.svelte';
	import type { DropzoneOutput, FileWithPath } from '$models/minter/dropzone';
	/*
	TODO: Tooltip text
	*/
	export let handleChange: (event: Event) => any;
	export let tracks;
	export let albumForm: MusicAlbum;
	export let errors;

	let unfinishedTrack;
	let savedTracks;
	let hovering;

	$: {
		unfinishedTrack = albumForm?.tracks?.find((track) => track._status === NftStatus.UNFINISHED);
		savedTracks = albumForm?.tracks?.filter((track) => track._status === NftStatus.SAVED);
	}

	let errorList;
	const addTrack = () => {
		if (unfinishedTrack) {
			const formErrors = [];
			if (!unfinishedTrack.name) {
				// TODO: use a real form if it will look like a real form
				formErrors.push({ field: 'Track - Name', message: 'Must not be empty' });
			}
			if (!unfinishedTrack.file.pinInfo) {
				formErrors.push({ field: 'Track', message: 'Required' });
			}
			if (errors.length > 0) {
				errorList = formErrors;
				return;
			}
			unfinishedTrack._status = NftStatus.SAVED;
		} else {
			albumForm.tracks.push({ ...deepCopy(initialTrack), _id: generateId() });
		}
		albumForm = albumForm;
	};

	const handleCoverSelect = (file: DropzoneOutput) => {
		albumForm.cover = ipfsCidUrl(file.pinInfo.IpfsHash);
	};
	const handleMusicSelect = async (file: DropzoneOutput, acceptedFiles: FileWithPath[]) => {
		const format: string = acceptedFiles[0].name.split('.').pop().toUpperCase();
		let duration = 0;
		if (format !== 'SUNVOX') {
			try {
				const metadata = await mm.parseBlob(acceptedFiles[0]);
				unfinishedTrack.name = metadata?.common.title;
				unfinishedTrack.artist = metadata?.common.artist;
				duration = metadata?.format.duration;
			} catch (e) {
				console.log(e);
			}
		}
		unfinishedTrack.file = ipfsCidUrl(file.pinInfo.IpfsHash);
		unfinishedTrack.isSunvox = format === 'SUNVOX';
		tracks = [
			...tracks,
			{
				file: unfinishedTrack.isSunvox ? unfinishedTrack.file : file.preview,
				name: unfinishedTrack.name,
				artist: unfinishedTrack.artist,
				duration,
				isSunvox: unfinishedTrack.isSunvox,
			},
		];
	};

	const handleMusicDiscard = () => {
		unfinishedTrack.file = '';
		tracks.pop();
	};

	const updateTrackOrder = (list: TrackInfo[]) => {
		albumForm.tracks = [...list];
	};

	let showTrackModal;
	const openTrackEditModal = (track: TrackInfo) => {
		showTrackModal = track;
	};
	const updateTrack = (values: TrackInfo, track: TrackInfo) => {
		const trackToUpdate = albumForm.tracks.findIndex(
			(t) => t.name === track.name && t.artist === track.artist,
		);
		albumForm.tracks[trackToUpdate] = deepCopy(values);
	};
	const updateCover = (cover: string) => {
		albumForm.cover = cover;
	};
	const deleteTrack = (index: number) => {
		albumForm.tracks.splice(index, 1);
		albumForm = albumForm;
	};
	const updateTracks = () => {
		if (tracks.length === albumForm.tracks.length) {
			tracks[albumForm.tracks.length - 1].name = unfinishedTrack.name;
			tracks[albumForm.tracks.length - 1].artist = unfinishedTrack.artist;
		}
	};
</script>

<FormInput
	id="album-name"
	label="Album Name"
	info="An album name is required if you create more than one album."
	name="album-name"
	placeholder="Album name"
	description="The name of your album."
	error={errors.name}
	on:change={handleChange}
	bind:value={albumForm.name}
/>
<!-- <FormInput
	id="album-amount"
	label="Population Amount"
	info="The total number of copies of this album which can be minted. Cannot be more than total supply."
	name="album-amount"
	placeholder="1,000"
	description="Amount of NFTs in current album."
	error={errors.amount}
	on:change={handleChange}
	bind:value={albumForm.amount}
	type="number"
/> -->
{#if savedTracks.length > 0}
	<div class="tracks-container" class:border-bottom={unfinishedTrack} use:touchHelperDirective>
		{#each savedTracks as track, index (track._id)}
			<div animate:flip>
				<DraggableListItem
					{index}
					bind:list={albumForm.tracks}
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
							<CloseButton size="0.5rem" position="0" color="--icon-action-primary" />
						</div>
					</div>
				</DraggableListItem>
			</div>
		{/each}
	</div>
{/if}
{#if unfinishedTrack}
	<TrackFormContent
		{handleChange}
		{updateTracks}
		{handleMusicSelect}
		{handleMusicDiscard}
		bind:cover={albumForm.cover}
		{tracks}
		bind:trackForm={unfinishedTrack}
		{errors}
	/>
	{#if tracks.length > 0 && !albumForm.cover}
		<h3 class="title">
			Preview
			<PopInfo message="Tooltip text" placement="bottom" />
		</h3>
		<p class="description">
			Because you’ve included multimedia, you’ll need to provide an image (PNG, JPG, or GIF) for the
			card display of your item or album.
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
	buttonProps={{ type: 'button' }}
	type={unfinishedTrack ? 'primary' : 'tertiary'}
	on:click={addTrack}
	size="md"
>
	Add music file(s)
</Button>
<Modal
	on:close={() => {
		showTrackModal = undefined;
	}}
	show={showTrackModal &&
		bind(EditTrack, {
			cover: albumForm.cover,
			track: showTrackModal,
			updateTrack,
			updateCover,
			close: () => {},
		})}
/>
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
</style>
