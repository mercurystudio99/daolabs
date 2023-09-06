<script lang="ts">
	import { getContext } from 'svelte';
	import { parseEther } from 'ethers/lib/utils';
	import Pay from '$lib/components/Pay.svelte';
	import { weightedAmount } from '$utils/v2/math';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import { formatWad } from '$utils/formatNumber';
	import Icon from '$lib/components/Icon';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';
	import type { BigNumber } from 'ethers';
	import type { NftRewardTier } from '$models/nftRewardTier';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');

	export let onPay: (wei: BigNumber) => void;

	$: payButton = $project?.projectMetadata?.payButton || 'Pay';

	$: nftReward = $project.nftRewardTiers;

	// function nftName(name: string) {
	// 	const words = name.split(/[^\w]+/);
	// 	return words.slice(0, 2).join(' ') + (words.length > 2 ? ' ...' : '');
	// }

	let inputPayAmount: number = 0;
	$: if (!inputPayAmount && nftReward?.rewardTiers?.length) {
		setTimeout(() => (inputPayAmount = nftReward.rewardTiers[0].contributionFloor), 10);
	}

	function selectTier(tiers: NftRewardTier[], price: number) {
		let sortedTiers = [...tiers].sort((a, b) => b.contributionFloor - a.contributionFloor);
		for (let i = 0; i < sortedTiers.length; i++) {
			if (sortedTiers[i].contributionFloor <= price) {
				return sortedTiers[i];
			}
		}
	}

	$: nftTiers = (nftReward.rewardTiers || [])?.sort(
		(a, b) => a.contributionFloor - b.contributionFloor,
	);
</script>

<HeavyBorderBox>
	{#if nftReward.collectionMetadata.name}
		<h3>{nftReward.collectionMetadata.name}</h3>
	{/if}
	{#if nftReward.collectionMetadata.description}
		<p>{nftReward.collectionMetadata.description}</p>
	{/if}
	<div class="items">
		{#if nftReward.rewardTiers?.length}
			{@const selectedTier = selectTier(nftReward.rewardTiers, inputPayAmount)}
			{#each nftTiers || [] as tier}
				<div
					class="item"
					class:selected={selectedTier === tier}
					on:click={() => (inputPayAmount = tier.contributionFloor)}
					on:keydown
				>
					<div class="image">
						<img src={tier.imageUrl} alt="" />
					</div>
					<div class="name">
						<span>{tier.name}</span>
						<a href={tier.externalLink} target="_blank" rel="noreferrer">
							<Icon name="link" style="color: var(--text-primary)" />
						</a>
					</div>
					<div class="price">
						<a href={null}
							>{formatWad(parseEther(tier.contributionFloor?.toString()).toHexString(), {
								precision: 4,
							})} ETH</a
						>
					</div>
				</div>
			{/each}
		{/if}
	</div>
	<div style="margin-top:-20px;">
		<Pay
			{payButton}
			disabled={!$project.fundingCycle?.number?.gt(0) || !inputPayAmount}
			onClick={onPay}
			reservedRate={$project.fundingCycleMetadata.reservedRate.toNumber()}
			weight={$project.fundingCycle.weight}
			weightingFn={weightedAmount}
			bind:amount={inputPayAmount}
		/>
	</div>
</HeavyBorderBox>

<style lang="scss">
	.items {
		display: flex;
		overflow-x: auto;
		overflow-y: visible;
		padding: 0.5rem 0;
		gap: 1rem;
		> * {
			flex: 0 0;
			flex-basis: auto;
		}
	}
	.item {
		width: 100%;
		max-width: 130px;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		border: 0.4px solid var(--original-accent);
		border-radius: var(--radius-md);
		padding: 4px;
		cursor: pointer;
		img {
			width: 100%;
			max-width: 100%;
		}
		&.selected {
			box-shadow: 3px 3px 0px var(--original-accent);
		}
		.name {
			font-size: 0.65rem;
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: 0.5rem;
			max-height: 50px;
			// white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.price {
			font-size: 0.8rem;
			display: flex;
			a {
				color: var(--text-primary);
			}
		}
	}
</style>
