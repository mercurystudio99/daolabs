<script lang="ts">
	import { createExampleLayering } from '$lib/utils/nftCreationUtils';
	import PfpLayering from './PFPLayering.svelte';
	import type * as CSS from 'csstype';
	import type { PfpNftConfig } from '$models/minter/nft-config';

	export let nft: PfpNftConfig;

	export let style: CSS.Properties | undefined = undefined;
	export let imgStyle: CSS.Properties | undefined = undefined;

	$: layers = createExampleLayering(nft);
</script>

<PfpLayering {layers} {style} {imgStyle} />
