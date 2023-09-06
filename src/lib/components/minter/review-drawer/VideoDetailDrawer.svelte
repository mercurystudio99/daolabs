<script lang="ts">
	import CommonDetailDrawer from './CommonDetailDrawer.svelte';
	import type { VideoNftConfig } from '$models/minter/nft-config';
	import type { VideoCollection } from '$models/minter/collection-config';

	export let isOpen: boolean;
	export let nft: VideoNftConfig;
	export let collection: VideoCollection;
</script>

<CommonDetailDrawer bind:isOpen {nft} {collection}>
	<div class="player">
		<!-- svelte-ignore a11y-media-has-caption -->
		<video controls src={nft.file} />
	</div>
</CommonDetailDrawer>

<style lang="scss">
	.player {
		margin: 16px 0;

		video {
			width: 100%;
		}
	}
</style>
