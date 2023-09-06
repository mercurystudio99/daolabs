<script lang="ts">
	import { openModal, bind } from '$lib/components/Modal.svelte';
	import Button from '$lib/components/Button.svelte';
	import EthAmount from '$lib/components/ETHAmount.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import BidHistoryModal from './BidHistoryModal.svelte';
	import type { BigNumber } from 'ethers';

	export let data: {
		bids: {
			address: string;
			wadAmount: BigNumber | string;
			createdAt: string;
			txHash: string;
		}[];
	};

	function openBidHistory() {
		openModal(bind(BidHistoryModal, { data }));
	}

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

	$: maxBid = data.bids.length && getHighestBid(data.bids);
</script>

<div class="info">
	<InfoSpaceBetween>
		<div slot="left">
			<PopInfo message="Help text">Winning bid</PopInfo>
		</div>
		<div slot="right">
			{#if maxBid}
				<h2>
					<EthAmount amount={maxBid} />
				</h2>
			{:else}
				No bids, yet.
			{/if}
		</div>
	</InfoSpaceBetween>
	<InfoSpaceBetween>
		<div slot="left">
			<PopInfo message="Help text">Winner</PopInfo>
		</div>
		<div slot="right" class="accent">
			<EnsOrAddress address={data.bids[0].address} prependEnsWithAt />
		</div>
	</InfoSpaceBetween>
	<InfoSpaceBetween>
		<div slot="left">
			<PopInfo message="Help text">Held by</PopInfo>
		</div>
		<div slot="right" class="accent">
			<EnsOrAddress address={data.bids[0].address} prependEnsWithAt />
		</div>
	</InfoSpaceBetween>
</div>
<div class="buttons">
	<Button size="md" on:click={openBidHistory}>Bid history</Button>
	<Button size="md" type="secondary">Etherscan</Button>
</div>

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

	.buttons {
		display: flex;
		gap: 30px;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 2px solid var(--stroke-action-secondary);
	}

	.info {
		margin: 10px 0px;
	}
</style>
