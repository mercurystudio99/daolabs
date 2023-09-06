<script lang="ts">
	import { flip } from 'svelte/animate';
	import Button from '$lib/components/Button.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { generateId } from '$lib/utils/generateId';
	import {
		initialMusicAlbum,
		NftStatus,
		type MusicNftConfig,
		type MusicAlbum,
	} from '$models/minter/nft-config';
	import { deepCopy } from '$utils/object';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import touchHelperDirective from '$utils/touchHelper';
	import DraggableListItem from '../draggable-list-item/DraggableListItem.svelte';
	import EditMusicAlbum from '../edit/EditMusicAlbum.svelte';
	import FormBlock from '../form-block/FormBlock.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import MusicAlbumFormContent from './MusicAlbumFormContent.svelte';
	/*
	TODO: Tooltip text
	*/
	export let handleChange;
	export let form: MusicNftConfig;
	export let errors;

	let unfinishedAlbum;
	let savedAlbums;
	let hovering;

	let tracks = [];

	$: {
		unfinishedAlbum = form.albums.find((album) => album._status === NftStatus.UNFINISHED);
		savedAlbums = form.albums.filter((album) => album._status === NftStatus.SAVED);
	}
	const updateAlbumOrder = (list: MusicAlbum[]) => {
		form.albums = [...list];
	};
	const updateAlbum = (values: MusicAlbum, id: string) => {
		const albumToUpdate = form.albums.findIndex((p) => p._id === id);
		form.albums[albumToUpdate] = deepCopy(values);
	};
	let showAlbumEdit;
	const openAlbumEditModal = (album: MusicAlbum) => {
		showAlbumEdit = album;
	};
	const deleteAlbum = (index: number) => {
		form.albums.splice(index, 1);
		form = form;
	};
	let errorList;
	const addAlbum = () => {
		if (unfinishedAlbum) {
			const formErrors = [];
			if (!unfinishedAlbum.name) {
				// TODO: use a real form if it will look like a real form
				formErrors.push({ field: 'Album - Name', message: 'Must not be empty' });
			}
			if (!unfinishedAlbum.amount) {
				formErrors.push({ field: 'Album - Amount', message: 'Must not be empty' });
			} else if (!unfinishedAlbum.amount.match(/^[0-9]*$/)) {
				formErrors.push({ field: 'Album - Amount', message: 'Must be a number' });
			}
			if (unfinishedAlbum.tracks.length === 0) {
				formErrors.push({ field: 'Album - Tracks', message: 'Must have at least 1' });
			}
			if (errors.length > 0) {
				errorList = formErrors;
				return;
			}
			unfinishedAlbum._status = NftStatus.SAVED;
			tracks = [];
		} else {
			form.albums.push({ ...deepCopy(initialMusicAlbum), _id: generateId() });
		}
		form = form;
	};
</script>

<FormBlock title="Music" info="Your music NFT can be an mp3, sunvox, wav, or ogg file.">
	<p class="description">Your music NFT can contain many individual tracks grouped into albums.</p>
	<div class="albums-container" use:touchHelperDirective>
		{#each savedAlbums as album, index (album._id)}
			<div animate:flip>
				<DraggableListItem
					{index}
					bind:list={form.albums}
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
							{album.tracks.length > 1 ? 'tracks' : 'track'}
						</div>
						<div class="delete" on:click={() => deleteAlbum(index)} on:keydown>
							<CloseButton size="0.5rem" position="0" color="--icon-action-primary" />
						</div>
					</div>
				</DraggableListItem>
			</div>
		{/each}
	</div>
	{#if unfinishedAlbum}
		<div class="new-album-container">
			<MusicAlbumFormContent bind:tracks {handleChange} albumForm={unfinishedAlbum} {errors} />
		</div>
	{/if}
	<FormBlock title="Create new album" info="Create a new group of files.">
		<Button
			buttonProps={{ type: 'button' }}
			type={unfinishedAlbum ? 'primary' : 'tertiary'}
			on:click={addAlbum}
			size="md"
		>
			Add album
		</Button>
	</FormBlock>
</FormBlock>
<Modal
	on:close={() => {
		showAlbumEdit = undefined;
	}}
	show={showAlbumEdit &&
		bind(EditMusicAlbum, { album: showAlbumEdit, updateAlbum, close: () => {} })}
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
	.new-album-container {
		margin-bottom: 16px;
	}
</style>
