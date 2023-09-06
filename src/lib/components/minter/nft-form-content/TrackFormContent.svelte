<script lang="ts">
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import PlaybackBlock from '../form-block/PlaybackBlock.svelte';
	import FormInput from '../form/FormInput.svelte';
	import MusicPlayer from '../music-player/MusicPlayer.svelte';
	import type { TrackInfo } from '$models/minter/nft-config';
	import type { DropzoneOutput, FileWithPath } from '$models/minter/dropzone';
	/*
	TODO: Tooltip text
	*/
	export let handleChange: (event: Event) => any;
	export let updateTracks: () => void;
	export let handleMusicSelect: (file: DropzoneOutput, acceptedFiles: FileWithPath[]) => void;
	export let handleMusicDiscard: () => void;
	export let cover: string;
	export let tracks;
	export let trackForm: TrackInfo;
	export let errors;
</script>

<FormInput
	id="track-name"
	label="Track Name"
	info="A track name is required if you add more than one."
	name="track-name"
	placeholder="Track name"
	description="Your track's name."
	error={errors.name}
	bind:value={trackForm.name}
	on:blur={updateTracks}
	on:change={handleChange}
/>
<FormInput
	id="artist-name"
	label="Artist Name"
	info="Match the name used on streaming platforms."
	name="artist-name"
	placeholder="Artist name"
	description="Name of the artist."
	error={errors.artist}
	bind:value={trackForm.artist}
	on:blur={updateTracks}
	on:change={handleChange}
/>
<div class="dropzone">
	<UploadDropzone
		info="Upload your track here."
		accept={['.mp3', '.sunvox', '.wav', '.ogg']}
		title="Upload file"
		onDrop={handleMusicSelect}
		preview={trackForm.file && tracks.length > 0}
	>
		<MusicPlayer
			bind:cover
			bind:tracks
			currentTrack={tracks.length - 1}
			discardTrack={handleMusicDiscard}
			editable
		/>
	</UploadDropzone>
</div>
<PlaybackBlock bind:playback={trackForm.playback} />

<style lang="scss">
	.dropzone {
		margin-bottom: 16px;
	}
</style>
