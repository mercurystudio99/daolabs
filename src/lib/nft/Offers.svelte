<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import Icon from '$lib/components/Icon';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import DetailSection from '$lib/components/minter/review-drawer/DetailSection.svelte';
	// DON'T REMOVE THIS FILE: These are commented out until we find the data to populate them:
	//	https://github.com/tankbottoms/juice-interface-svelte/issues/402
	//	 <Listings />
	//	 <Offers />
	export let floorPrice: number = 92;

	function calculateBelowFloorPricePercentage(offer: number, minPrice: number) {
		return Math.round((1 - offer / minPrice) * 100);
	}

	const mockData = [
		{
			offer: 80,
			// 20 minutes ago
			timestamp: new Date().getTime() - 20 * 60 * 1000,
			from: 'tankbottoms.eth',
		},
		{
			offer: 75,
			// 5h ago
			timestamp: new Date().getTime() - 5 * 60 * 60 * 1000,
			from: 'cookieslayer.eth',
		},
	];
</script>

<DetailSection header="Offers" arrowBelowHeader={false}>
	{#if true}
		<div class="empty">
			<Icon name="offers" /> no offers yet
		</div>
	{:else}
		<InfoBox info={null}>Note: this is mocked data.</InfoBox>
		{#each mockData as offer}
			<div class="offer">
				<InfoSpaceBetween>
					<div class="price" slot="left">
						<img src="/icons/weth.png" alt="weth icon" width="18" height="18" />
						<span class="price__amount">{offer.offer}</span>
						<span class="price__currency">WETH</span>
					</div>
					<div class="timestamp" slot="right">
						{formatDistanceToNow(offer.timestamp, { addSuffix: true })}
						<Icon name="link" />
					</div>
				</InfoSpaceBetween>
				<InfoSpaceBetween>
					<div class="floorPrice" slot="left">
						{calculateBelowFloorPricePercentage(offer.offer, floorPrice)}% below
					</div>
					<div class="from" slot="right">
						from {offer.from}
					</div>
				</InfoSpaceBetween>
			</div>
		{/each}
	{/if}
</DetailSection>

<style>
	.offer {
		margin-top: 1em;
		padding-bottom: 0.5em;
		border-bottom: 1px solid var(--stroke-tertiary);
	}

	.timestamp,
	.floorPrice,
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
