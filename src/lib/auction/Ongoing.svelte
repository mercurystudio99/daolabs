<script lang="ts">
	import { onMount } from 'svelte';
	import { BigNumber } from 'ethers';
	import { detailedTimeString } from '$utils/formatTime';
	import BidList from '$lib/auction/BidList.svelte';
	import EthAmount from '$lib/components/ETHAmount.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Pay from '$lib/auction/Pay.svelte';
	import { formatWad } from '$utils/formatNumber';
	import { openModal, bind } from '$lib/components/Modal.svelte';
	import BidConfirmModal from './BidConfirmModal.svelte';

	export let data: {
		bids: {
			address: string;
			wadAmount: BigNumber | string;
			createdAt: string;
			txHash: string;
		}[];
	};

	let auctionEndsIn: string;
	let nextBid: string | BigNumber;

	function getHighestBid(
		bids: {
			address: string;
			wadAmount: BigNumber | string;
			createdAt: string;
			txHash: string;
		}[],
	) {
		const value = Math.max(...bids.map((bid) => Number(bid.wadAmount)));
		return value.toString();
	}

	function updateAuctionEndsIn() {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const midnight = tomorrow.setUTCHours(0, 0, 0, 0);
		const nowSeconds = Math.floor(new Date().getTime() / 1000);
		const auctionEndsSeconds = BigNumber.from(midnight).div(1000);
		const timeLeft = auctionEndsSeconds.sub(nowSeconds);
		return detailedTimeString({ timeSeconds: timeLeft, roundToMinutes: false });
	}

	onMount(() => {
		auctionEndsIn = updateAuctionEndsIn();
		const interval = setInterval(() => {
			auctionEndsIn = updateAuctionEndsIn();
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	});

	$: currentBid = data.bids.length && getHighestBid(data.bids);
	$: nextBid = data.bids.length && formatWad(BigNumber.from(currentBid).mul(101).div(100));
</script>

<div class="info">
	<InfoSpaceBetween>
		<div slot="left">
			<PopInfo message="Help text">Current bid</PopInfo>
		</div>
		<div slot="right">
			{#if currentBid}
				<h2>
					<EthAmount amount={currentBid} />
				</h2>
			{:else}
				No bids, yet.
			{/if}
		</div>
	</InfoSpaceBetween>
	<InfoSpaceBetween>
		<div slot="left">
			<PopInfo message="Help text">Auction ends in</PopInfo>
		</div>
		<div slot="right">
			<h2 class="accent">
				{auctionEndsIn}
			</h2>
		</div>
	</InfoSpaceBetween>
	<Pay
		payButton="Place bid"
		onClick={(weiAmount) => {
			openModal(bind(BidConfirmModal, { weiAmount }));
		}}
		placeholder={nextBid ? `${nextBid} or more` : '1'}
		minimum={Number(nextBid)}
	/>
</div>
<BidList bids={data.bids} />

<style>
	h2 {
		margin: 0;
	}
	div[slot='left'] {
		margin: 6px 0px;
		font-size: 0.75rem;
		text-transform: uppercase;
		color: var(--text-tertiary);
	}

	.accent {
		color: var(--text-brand-primary);
	}

	.info {
		margin: 10px 0px;
		padding-bottom: 20px;
		border-bottom: 2px solid var(--stroke-action-secondary);
	}
</style>
