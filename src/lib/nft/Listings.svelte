<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import DetailSection from '$lib/components/minter/review-drawer/DetailSection.svelte';

	// DON'T REMOVE THIS FILE: These are commented out until we find the data to populate them:
	//	https://github.com/tankbottoms/juice-interface-svelte/issues/402
	//	 <Listings />
	//	 <Offers />

	type Listing = {
		id: string;
		price: number;
		timestamp: number;
		from: string;
	};

	const mockData = [
		{
			id: 'someHash',
			price: 92,
			// in 1 day and 2 hours
			timestamp: new Date().getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
			from: 'baahaa.eth',
		},
		{
			id: 'someHash2',
			price: 95,
			// in 5 days
			timestamp: new Date().getTime() + 5 * 24 * 60 * 60 * 1000,
			from: 'noam.eth',
		},
	];

	let loading = {};

	function buy(listing: Listing) {
		loading[listing.id] = true;
		setTimeout(() => {
			loading[listing.id] = false;
			alert('You bought the NFT! (fictionally)');
		}, 1000);
	}
</script>

<DetailSection header="Listings" arrowBelowHeader={false}>
	{#if true}
		<div class="empty">
			<Icon name="listings" /> no listings yet
		</div>
	{:else}
		<InfoBox>Note: this is mocked data.</InfoBox>
		{#each mockData as listing}
			<div class="listing">
				<div class="info">
					<InfoSpaceBetween>
						<div class="price" slot="left">
							<img src="/icons/eth.png" alt="eth logo" width="18" height="18" />
							<span class="price__amount">{listing.price}</span>
							<span class="price__currency">ETH</span>
						</div>
						<div class="timestamp" slot="right">
							{formatDistanceToNow(listing.timestamp, { addSuffix: true })}
							<!-- TODO: link to hash -->
							<Icon name="link" />
						</div>
					</InfoSpaceBetween>
					<InfoSpaceBetween>
						<div slot="left" />
						<div class="from" slot="right">
							from {listing.from}
						</div>
					</InfoSpaceBetween>
				</div>
				<Button type="secondary" on:click={() => buy(listing)} loading={loading[listing.id]}
					>Buy</Button
				>
			</div>
		{/each}
	{/if}
</DetailSection>

<style>
	.listing {
		margin-top: 1em;
		padding-bottom: 0.5em;
		border-bottom: 1px solid var(--stroke-tertiary);
		display: flex;
	}

	.info {
		flex: 1;
		margin-right: 1.5em;
	}

	.timestamp,
	.from {
		font-size: 0.75em;
		color: var(--text-tertiary);
	}

	.price {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.empty {
		color: var(--text-action-primary);
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 0.5em;
		text-transform: uppercase;
		margin-right: 0.5em;
	}
</style>
