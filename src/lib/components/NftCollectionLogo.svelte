<script lang="ts">
	import Img from './Img.svelte';

	export let collectionName: string;

	function prepareCollectioName(name: string) {
		/**
		 * Given a collection name,
		 * - remove spaces
		 * - lowercase
		 * - remove dots
		 */
		return name.replace(/\s/g, '').toLowerCase().replace(/\./g, '');
	}

	function isImgUrl(url: string) {
		// NOTE: Etherscan fixed their cors day after I started using the endpoint,
		// so I'm just going to fail silently here.
		// eslint-disable-next-line no-constant-condition
		if (true) {
			return new Promise((resolve) => {
				resolve(false);
			});
		} else {
			const img = new Image();
			img.src = url;
			return new Promise((resolve) => {
				img.onerror = () => resolve(false);
				img.onload = () => resolve(true);
			});
		}
	}

	// TODO: find better endpoints, I know we can use opensea's but haven't figured out their endpoints yet
	const src = `https://etherscan.io/token/images/${prepareCollectioName(collectionName)}_32.png`;
</script>

{#await isImgUrl(src) then isImg}
	{#if isImg}
		<Img
			{src}
			alt={collectionName}
			placeholder={`https://via.placeholder.com/${32}?text=...`}
			styles={{ width: '32px', height: '32px', marginRight: '10px' }}
		>
			<div slot="failed" />
		</Img>
	{/if}
{/await}
