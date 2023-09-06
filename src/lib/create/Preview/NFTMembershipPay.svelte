<script lang="ts">
	import { getContext } from 'svelte';
	// import Pay from '$lib/components/Pay.svelte';
	// import { weightedAmount } from '$utils/v2/math';
	// import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	// import Icon from '$lib/components/Icon';
	// import { formatWad } from '$utils/formatNumber';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');

	console.log($project);

	// $: payButton = $project?.projectMetadata?.payButton || 'Pay';

	// function nftName(name: string) {
	// 	const words = name.split(/[^\w]+/);
	// 	return words.slice(0, 2).join(' ') + (words.length > 2 ? ' ...' : '');
	// }
</script>

<!-- eslint-disable -->

<!-- <HeavyBorderBox>
	<h3>NFT Membership</h3>
	<p>Select the appropriate Membership Tier to Join.</p>
	<div class="items">
		{#each $project.membershipNFTS || [] as teir}
			<div class="item">
				<div class="image">
					<img src={teir.file} alt="" />
				</div>
				<div class="name">
					<span>{nftName(teir.name)}</span>
					<a href={teir.link} target="_blank" rel="noreferrer">
						<Icon name="link" style="color: var(--text-primary)" />
					</a>
				</div>
				<div class="price">
					<a href={null}>{formatWad(teir.price, { precision: 4 })} ETH</a>
				</div>
			</div>
		{/each}
	</div>
	<br />
	<Pay
		{payButton}
		disabled
		onClick={() => console.info('🛠 TODO pay in create preview')}
		reservedRate={$project.fundingCycleMetadata.reservedRate.toNumber()}
		weight={$project.fundingCycle.weight}
		weightingFn={weightedAmount}
	/>
</HeavyBorderBox> -->
<style lang="scss">
	.items {
		display: flex;
		overflow: auto;
		gap: 1rem;
		> * {
			flex: 0 0;
			flex-basis: auto;
		}
		&::-webkit-scrollbar {
			display: none;
		}
	}
	.item {
		width: 100px;
		max-width: 200px;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		border: 0.4px solid rgba(255, 255, 255, 0.2);
		padding: 4px;
		cursor: pointer;
		img {
			width: 100px;
			max-width: 100%;
		}
		.name {
			font-size: 0.8rem;
			display: flex;
			align-items: baseline;
			gap: 0.5rem;
		}
		.price {
			font-size: 0.8rem;
			display: flex;
		}
	}
</style>
