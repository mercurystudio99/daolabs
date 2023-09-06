<script lang="ts">
	import Drawer from '$lib/components/Drawer.svelte';
	import DrawerTabs from '$lib/components/DrawerTabs.svelte';
	import { CollectionType } from '$models/minter/collection-config';
	import {
		isAdvancedCollection,
		isCollectionDeployed,
		isSimpleCollection,
	} from '$utils/collectionHelpers';
	import { handleRevenueSplitChange } from '$utils/users/revenueSplitsHelpers';
	import Loading from '$lib/components/Loading.svelte';
	import type { Collection } from '$models/minter/collection-config';

	export let shown: boolean;
	export let collection: Collection;
	export let saveCollection: (form: Collection) => Promise<void>;
	export let updateCollectionNfts: () => Promise<void>;

	let readonly = isCollectionDeployed(collection);
	let currentTab = 0;
	/*
	TODO: Add description to project/forminput 
	TODO: Tooltip text
	*/

	const tabs =
		collection.type === CollectionType.ADVANCED
			? ['Collection', 'NFT', 'Pricing', 'Export']
			: ['Edition', 'Export'];

	const submit = async (form: Collection) => {
		if (isAdvancedCollection(form)) {
			const updatedRoyaltyReceiver = await handleRevenueSplitChange(
				collection.royalty?.creator_address,
				form.royalty?.creator_address,
				form.name,
				'collectionRoyalty',
			);
			if (updatedRoyaltyReceiver) {
				form.royalty.creator_address = updatedRoyaltyReceiver;
			}
		}

		await saveCollection({ ...form });
		shown = false;
	};

	async function getCurrentTabComponent(tab: number) {
		const simpleComponents = {
			0: async () => import('$lib/components/collections/EditSimpleCollection.svelte'),
			1: async () => import('./CollectionExportTab.svelte'),
		};

		const advancedComponents = {
			0: async () => import('$lib/components/collections/EditAdvancedCollection.svelte'),
			1: async () => import('./CollectionNftTab.svelte'),
			2: async () => import('./CollectionPricingTab.svelte'),
			3: async () => import('./CollectionExportTab.svelte'),
		};

		try {
			let component: any;
			if (isSimpleCollection(collection)) {
				component = await simpleComponents[tab]();
			} else if (isAdvancedCollection(collection)) {
				component = await advancedComponents[tab]();
			}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return component.default;
		} catch (e) {
			console.log(e);
			return null;
		}
	}

	function getProps(tab: number, coll: Collection, isReadonly: boolean) {
		if (tab === tabs.length - 1) {
			return { collection: coll };
		} else if (isAdvancedCollection(coll) && tab === 1) {
			return {
				collection: coll,
				saveCollection: submit,
				updateCollectionNfts,
				readonly: isReadonly,
			};
		}
		return { collection: coll, saveCollection: submit, readonly: isReadonly };
	}

	$: componentProps = getProps(currentTab, collection, readonly);
</script>

<Drawer bind:shown>
	<section>
		<h2>Settings</h2>
		<DrawerTabs {tabs} bind:currentTab />
		{#await getCurrentTabComponent(currentTab)}
			<Loading />
		{:then TabComponent}
			<!-- eslint-disable-next-line -->
			{#if currentTab === 0}
				<svelte:component this={TabComponent} bind:collection saveCollection={submit} {readonly} />
			{:else}
				<svelte:component this={TabComponent} {...componentProps} />
			{/if}
		{/await}
	</section>
</Drawer>

<style>
	section {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 40px 26px;
		max-width: 650px;
	}

	h2 {
		font-size: 28px;
		color: var(--text-header);
		margin-bottom: 0;
	}
</style>
