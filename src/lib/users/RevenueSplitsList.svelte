<script lang="ts">
	import { onMount } from 'svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { connectedAccount, updateBalance } from '$stores/web3';
	import RevenueSplitCard from '$lib/components/RevenueSplitCard.svelte';
	import { initialRevenueSplit, type RevenueSplit } from '$models/user/revenue-splits';
	import { withdrawRevenueSplit } from '$utils/withdrawRevenueSplitHelper';
	import { fetchPrice } from './assets/services';

	export let userAddress = '';
	export let splits: RevenueSplit[];
	export let splitsFailed: string = '';
	export let openSplitsDrawer: (index: number) => void;
	export let deleteSplit: (index: number) => Promise<void>;

	const exampleSplit = {
		...initialRevenueSplit,
		name: 'Example Revenue Split',
		network: 'mainnet',
	};
	let selectedSplit: string;
	let ethPrice;
	let isOwner: boolean;

	const selectSplit = (split: RevenueSplit) => () => {
		const index = splits.findIndex((r) => r.id === split.id);
		if (
			index === -1 ||
			split.creator.toLowerCase() !== $connectedAccount.toLowerCase() ||
			('address' in split && split.address)
		)
			return;

		if (selectedSplit === split.id) {
			openSplitsDrawer(index);
			selectedSplit = null;
		} else {
			selectedSplit = split.id;
		}
	};

	const withdrawSplit = (split: RevenueSplit) => async () => {
		const res = await withdrawRevenueSplit(split);

		if (split.recipients.find((r) => r.address.toLowerCase() === $connectedAccount.toLowerCase())) {
			updateBalance();
		}
		return res;
	};

	const handleSplitDelete = (split: RevenueSplit) => () => {
		const index = splits.findIndex((r) => r.id === split.id);
		return deleteSplit(index);
	};

	onMount(async () => {
		try {
			const price = await fetchPrice();
			ethPrice = price.ethereum.usd;
		} catch (error) {
			console.error(error);
		}
	});
	$: isOwner = userAddress.toLocaleLowerCase() === $connectedAccount.toLocaleLowerCase();
</script>

{#if splits && splits.length > 0}
	<Pagination list={splits}>
		<section slot="content" let:listSlice>
			{#if splitsFailed}
				There was an issue getting revenue splits for the following networks: {splitsFailed}
			{/if}
			{#each listSlice as split, index}
				<div id={index === 0 ? 'example-revenue-split' : ''}>
					<RevenueSplitCard
						{split}
						ethereumPrice={ethPrice}
						selected={selectedSplit === split.id}
						selectSplit={selectSplit(split)}
						withdrawSplit={withdrawSplit(split)}
						deleteSplit={handleSplitDelete(split)}
						deleteSplitAvailable={split.creator.toLowerCase() === $connectedAccount.toLowerCase()}
					/>
				</div>
			{/each}
		</section>
	</Pagination>
{:else}
	<section>
		{#if splitsFailed}
			There was an issue getting revenue splits for the following networks: {splitsFailed}
		{/if}
		<span id="example-revenue-split">
			<RevenueSplitCard split={exampleSplit} />
		</span>
		{#if !splitsFailed}
			{#if isOwner}
				<p>You haven't created any revenue split yet.</p>
			{:else}
				<p>This user hasn't created any revenue split yet.</p>
			{/if}
		{/if}
	</section>
{/if}

<style lang="scss">
	section {
		margin: 32px 0;
		display: flex;
		flex-direction: column;
		grid-column-gap: 80px;
		grid-row-gap: 32px;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		grid-auto-flow: row;
		grid-auto-rows: 1fr;
	}
</style>
