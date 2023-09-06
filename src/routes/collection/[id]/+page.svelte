<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { modal, modalOptions } from '$stores';
	import Loading from '$lib/components/Loading.svelte';
	import {
		getCollectionNfts,
		isAdvancedCollection,
		isSimpleCollection,
	} from '$utils/collectionHelpers';
	import FooterProject from '$lib/components/FooterProject.svelte';
	import EditCollectionDrawer from '$lib/users/EditCollectionDrawer.svelte';
	import ToolDrawer from '$lib/users/ToolDrawer.svelte';
	import PageError from '$lib/components/error/PageError.svelte';
	import AdvancedCollection from '$lib/collection/AdvancedCollection.svelte';
	import SimpleCollection from '$lib/collection/SimpleCollection.svelte';
	import { updateCollection } from '$utils/users/user';
	import { browser } from '$app/environment';
	import type { Collection } from '$models/minter/collection-config';

	export let data: { id: string; streamed: { collection: Promise<Collection> } };

	let collection: Collection = undefined;
	let loading = true;

	let showSettings: boolean = false;
	let showTool: boolean = false;

	const saveCollection = async (collectionToSave: Collection) => {
		await updateCollection(collectionToSave);
		collection = collectionToSave;
	};

	const updateCollectionNfts = async () => {
		if (isAdvancedCollection(collection)) {
			const nfts = await getCollectionNfts(collection.id);
			collection.nfts = nfts;
			collection = collection;
		}
	};

	if (browser) {
		data.streamed.collection
			.then((c) => (collection = c))
			.catch((err) => console.error(err))
			.finally(() => (loading = false));
	}
</script>

<svelte:head>
	<script src="/libs/introjs/intro.js"></script>
	<link rel="stylesheet" href="/libs/introjs/introjs.css" />
</svelte:head>

{#if loading}
	<Loading overlay />
{:else if collection}
	<div class="container">
		{#if isAdvancedCollection(collection)}
			<AdvancedCollection {collection} bind:showTool bind:showSettings {saveCollection} />
		{:else if isSimpleCollection(collection)}
			<SimpleCollection {collection} bind:showTool bind:showSettings {saveCollection} />
		{:else}
			<PageError customMessage="Collection '{data.id}' has unsupported type" />
		{/if}
		<FooterProject />
	</div>
{:else}
	<PageError customMessage="Collection '{data.id}' has unsupported type" />
{/if}
{#if showSettings}
	<EditCollectionDrawer
		bind:shown={showSettings}
		{collection}
		{saveCollection}
		{updateCollectionNfts}
	/>
{/if}
{#if showTool}
	<ToolDrawer bind:shown={showTool} {collection} {saveCollection} />
{/if}
<Modal key="CollectionPage" show={$modal} {...$modalOptions} />

<style lang="scss">
	:root {
		--onboard-modal-z-index: 1000;
	}

	.container {
		width: 100%;
		height: 100%;
		padding-bottom: 82px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		.container {
			margin-top: 74px;
		}
	}
</style>
