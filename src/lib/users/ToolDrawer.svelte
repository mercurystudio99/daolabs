<script lang="ts">
	import AllDeploysInfo from '$lib/components/AllDeploysInfo.svelte';
	import Button from '$lib/components/Button.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import DrawerTabs from '$lib/components/DrawerTabs.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { isCollectionDeployed } from '$utils/collectionHelpers';
	import ContractInterface from '$lib/collection/contractInterface/ContractInterface.svelte';
	import type { Collection } from '$models/minter/collection-config';

	export let shown: boolean;
	export let collection: Collection;
	export let saveCollection: (form: Collection) => Promise<void>;

	enum Tabs {
		Contract,
		Airdrop,
		Deploys,
	}

	let currentTab = Tabs.Contract;

	const submit = async () => {
		// TODO: This is the function that should validate the airdrop
		// TODO: probably want to actually fire the airdrop too
		await saveCollection(collection);
		shown = false;
	};
</script>

<Drawer bind:shown>
	<section>
		<h2>Collection tools</h2>
		<DrawerTabs tabs={Object.keys(Tabs).filter((key) => isNaN(Number(key)))} bind:currentTab />
		{#if currentTab === Tabs.Airdrop}
			<HeavyBorderBox>
				<div class="description">
					<label for="description">
						<PopInfo
							message="Enter the token count and Ethereum address seperated by commas or a new line or download the below example."
						>
							Ethereum addresses
						</PopInfo>
					</label>
					<p>Insert token count and address comma separated on each line.</p>
					<Textarea
						id="description"
						placeholder="token_count, address"
						bind:value={collection.airdrops}
						rows="5"
						maxlength={10000}
					/>
				</div>
				<div><br /></div>
				<Button size="md" fullWidth={true} on:click={submit} type="secondary"
					>Validate Airdrop</Button
				>
			</HeavyBorderBox>
		{:else if currentTab === Tabs.Contract}
			{#if isCollectionDeployed(collection)}
				<HeavyBorderBox>
					<ContractInterface contractInfo={collection.contracts?.nft} />
				</HeavyBorderBox>
			{:else}
				<p>Collection is not deployed yet.</p>
			{/if}
		{:else if currentTab === Tabs.Deploys}
			<AllDeploysInfo {collection} />
		{/if}
	</section>
</Drawer>

<style>
	.description {
		display: flex;
		flex-direction: column;
	}

	.description label {
		color: var(--text-header);
		margin-bottom: 8px;
	}

	section {
		display: flex;
		flex-direction: column;
		padding: 40px 26px;
		max-width: 650px;
	}

	section h2 {
		font-size: 28px;
		color: var(--text-header);
		margin-bottom: 0;
	}

	label {
		color: var(--text-header);
		margin-bottom: 8px;
	}
</style>
