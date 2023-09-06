<script lang="ts">
	import { connectedAccount } from '$stores/web3';
	import { startIntroTour } from '$utils/introjs/intro-js';
	import { simpleNftPageOptions, simpleNftPageOwnerOptions } from '$utils/introjs/options';
	import CommonCollection from '$lib/collection/CommonCollection.svelte';
	import { getNftContractAddress } from '$utils/collectionHelpers';
	import { mintEdition } from '$utils/web3/extensions/NFTokenWrapper';
	import type { SimpleCollection } from '$models/minter/collection-config';

	export let collection: SimpleCollection;
	export let showTool: boolean;
	export let showSettings: boolean;
	export let saveCollection: (form: SimpleCollection) => Promise<void>;

	$: isConnectedUserOwner = $connectedAccount.toLowerCase() === collection.creator.toLowerCase();

	async function mintFunc({
		editionIndex,
		price,
		mintAmount,
	}: {
		editionIndex: number;
		price: number;
		mintAmount: number;
	}) {
		const contractAddress = getNftContractAddress(collection);
		const value = price * mintAmount;

		console.log('🦄 minting with args', {
			platform: 'daolabs',
			edition: editionIndex,
			contractAddress,
		});
		// Mint edition set to 1 for now until we support several editions
		const tx = await mintEdition('daolabs', editionIndex, contractAddress, value.toString());
		console.info('Minting tx', tx);
		return tx;
	}

	const handleStartIntroTour = () => {
		document.cookie = 'introjs-dontShowAgain=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
		startIntroTour(isConnectedUserOwner ? simpleNftPageOwnerOptions : simpleNftPageOptions);
	};

	$: totalSupply = collection.editions.reduce(
		(acc, edition) => acc + Number(edition.totalSupply),
		0,
	);
</script>

<CommonCollection
	{collection}
	collectionSupply={totalSupply}
	{handleStartIntroTour}
	bind:showTool
	bind:showSettings
	{mintFunc}
	{saveCollection}
/>
