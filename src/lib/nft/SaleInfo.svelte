<script lang="ts">
	import { onMount } from 'svelte';
	import { BigNumber } from 'ethers';
	import { mockData } from '$lib/auction/mockData';
	import { formattedNum } from '$utils/formatNumber';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import Button from '$lib/components/Button.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import Icon from '$lib/components/Icon';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import { /* currentPrice, timeLeft,*/ bid } from '$utils/web3/extensions/EnglishAuctionWrapper';

	import { connectedAccount } from '$stores/web3';
	import BidModal from './BidModal.svelte';
	import type { Sale, Token } from '@zoralabs/zdk/dist/queries/queries-sdk';
	import type { ContractPlatform } from '$constants/platform';

	export let nft: Token;
	export let sales: Sale[];

	enum PriceType {
		FIXED,
		AUCTION,
		NOT_ON_SALE,
	}

	type SaleData = {
		saleEnd: number;
		price: number;
		saleType: PriceType;
	};

	// TODO: temporary mock data for viewing
	const salesMockData = [
		{
			saleEnd: undefined, // new Date(2022, 11, 25).getTime(),
			price: sales[0]?.price.chainTokenPrice.decimal,
			saleType: PriceType.FIXED,
		},
		{
			saleEnd: new Date(2023, 11, 25).getTime(),
			price: sales[0]?.price.chainTokenPrice.decimal,
			saleType: PriceType.AUCTION,
		},
		{
			saleEnd: undefined,
			price: undefined,
			saleType: PriceType.NOT_ON_SALE,
		},
	];

	let saleData: SaleData;

	const platform: ContractPlatform = 'daolabs'; // platform: juicebox2, juicebox3, daolabs

	// async function getAuctionDetails(nftAddress: string, nftId: BigNumber) {
	// 	const [price, time] = await Promise.all([
	// 		currentPrice(platform, nftAddress, nftId),
	// 		timeLeft(platform, nftAddress, nftId),
	// 	]);

	// 	console.log(price); // wei
	// 	console.log(time); // seconds
	// 	saleData.price = price;
	// 	saleData.saleEnd = time;
	// }

	let loading: { buy?: boolean; bid?: boolean; offer?: boolean; sell?: boolean } = {};

	function formatDate(date: number) {
		// format sale ends as 22 Feb 2023 (3:00 PM)
		const saleEndFormatted = new Date(date).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		});

		const list = saleEndFormatted.split(', ');
		const formattedDate = `${list[0]} ${list[1]}`;
		const formattedTime = `(${list[2]})`;

		return `${formattedDate} ${formattedTime}`;
	}

	async function placeBid() {
		// TODO: add dialog where to enter bid, comments.
		loading = { bid: true };
		let memo = '';
		await bid(platform, nft.owner, nft.collectionAddress, BigNumber.from(nft.tokenId), memo);
		loading = {};
	}

	function buy() {
		// TODO: add dialog to see fee, price, etc.
		loading = { buy: true };
		setTimeout(() => {
			loading = {};
		}, 2000);
	}

	function sell() {
		// TODO: add dialog to define price, auction.
		loading = { buy: true };
		setTimeout(() => {
			loading = {};
		}, 2000);
	}

	function offer() {
		// TODO: add dialog to see fee, price, etc.
		loading = { offer: true };
		setTimeout(() => {
			loading = {};
		}, 2000);
	}

	function showBids() {
		// TODO: function to define bids.
		let bids = mockData[0];
		openModal(bind(BidModal, bids));
	}

	onMount(() => {
		// TODO: get initial data
		// await getAuctionDetails(
		// 	nft.collectionAddress,
		// 	BigNumber.from(nft.tokenId),
		// );
		if ($connectedAccount.toLowerCase() === nft.owner.toLowerCase()) {
			saleData = salesMockData[PriceType.NOT_ON_SALE];
		} else {
			saleData = salesMockData[PriceType.FIXED];
		}
	});
</script>

<section>
	{#if !saleData}
		<div class="info loading">
			<Skeleton height="30px" style="margin-bottom: 10px" />
			<Skeleton height="30px" style="margin-bottom: 10px" />
			<Skeleton height="30px" style="margin-bottom: 10px" />
		</div>
	{:else}
		{#if saleData.price}
			{#if saleData.saleEnd}
				<div class="center date">
					<Icon name="altClock" style="stroke: var(--icon-action-primary)" />
					Sale ends {formatDate(saleData.saleEnd)}
				</div>
				{#if saleData.saleType === PriceType.AUCTION}
					<Countdown date={saleData.saleEnd} />
				{/if}
			{/if}
			<div class="price">
				{#if saleData.saleType === PriceType.AUCTION}
					Highest bid
				{/if}
				<h1 class="center">
					<Icon name="ethereum" width="20" height="20" />
					{formattedNum(saleData.price, { precision: 4 })}
				</h1>
			</div>
		{:else if saleData.saleType != PriceType.NOT_ON_SALE}
			No previous sales
		{/if}
		<div id="saleButtons">
			<!-- disable all buttons while functionality is not implemented -->
			{#if saleData.saleType === PriceType.FIXED}
				<Button disabled={true} size="md" on:click={buy} loading={loading.buy}>
					<Icon name="wallet" /> Buy now</Button
				>
				<Button disabled={true} size="md" type="secondary" on:click={offer} loading={loading.offer}>
					<Icon name="coin" /> Make offer</Button
				>
			{:else if saleData.saleType === PriceType.AUCTION}
				<Button disabled={true} size="md" on:click={placeBid} loading={loading.bid}>
					<Icon name="wallet" /> Bid</Button
				>
				<Button disabled={true} size="md" type="secondary" on:click={showBids}>
					<Icon name="coin" /> Show bids</Button
				>
			{:else if saleData.saleType === PriceType.NOT_ON_SALE}
				<Button disabled={true} size="md" on:click={sell} loading={loading.sell}>
					<Icon name="wallet" /> Sell</Button
				>
			{/if}
		</div>
	{/if}
</section>

<style>
	section {
		border-bottom: 1px solid var(--stroke-tertiary);
		border-top: 1px solid var(--stroke-tertiary);
		padding: 2em 0;
	}

	h1 {
		margin: 0;
		margin-top: 0.5em;
	}

	.center {
		align-items: center;
		display: flex;
		gap: 8px;
	}

	.date {
		color: var(--text-secondary);
		font-weight: 300;
		margin-left: 4px;
	}

	.price {
		font-weight: 300;
	}

	#saleButtons {
		display: flex;
		gap: 4em;
		margin-top: 1em;
	}
	#saleButtons > :global(button) {
		flex: 0.5;
	}
</style>
