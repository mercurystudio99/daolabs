<script lang="ts">
	import MusicPlayer from '../music-player/MusicPlayer.svelte';
	import DetailSection from './DetailSection.svelte';
	import CommonDetailDrawer from './CommonDetailDrawer.svelte';
	import type { MusicNftConfig } from '$models/minter/nft-config';
	import type { MusicCollection } from '$models/minter/collection-config';

	export let isOpen: boolean;
	export let nft: MusicNftConfig;
	export let collection: MusicCollection;

	let albums = [];
	$: albums = nft.albums.map((album) => ({
		name: album.name,
		cover: album.cover,
		tracks: album.tracks.map((track) => ({
			file: track.file,
			name: track.name,
			isSunvox: track.isSunvox,
			artist: track.artist,
		})),
	}));
</script>

<CommonDetailDrawer bind:isOpen {nft} {collection}>
	{#each albums as album}
		<DetailSection header={album.name}>
			<div class="player">
				<MusicPlayer cover={album.cover} tracks={album.tracks} />
			</div>
		</DetailSection>
	{/each}
</CommonDetailDrawer>

<style lang="scss">
	.player {
		margin: 16px 0;
	}
</style>
