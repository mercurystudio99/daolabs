<script lang="ts">
	import MusicPlayer from '../music-player/MusicPlayer.svelte';
	import CommonNftPreview from './CommonNftPreview.svelte';
	import type { MusicNftConfig } from '$models/minter/nft-config';
	import type { TokenStandard } from '$models/minter/token-standard';
	import type { MusicCollection } from '$models/minter/collection-config';
	import type { MusicTrack } from '$models/minter/music-player';

	export let standard: TokenStandard;
	export let nft: MusicNftConfig;
	export let collection: MusicCollection;
	export let cover: string;
	export let tracks: MusicTrack[] = [];
	export let discardTrack: (index: number) => void;
</script>

<CommonNftPreview {standard} {collection} {nft}>
	<div class="player">
		<MusicPlayer bind:cover bind:tracks {discardTrack} editable />
	</div>
</CommonNftPreview>

<style lang="scss">
	.player {
		border-bottom: 1px solid var(--stroke-tertiary);
		width: 100%;
		position: relative;
		max-width: 450px;
		margin: 16px auto;
	}
</style>
