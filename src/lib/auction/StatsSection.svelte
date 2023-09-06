<script lang="ts">
	import EthAmount from '$lib/components/ETHAmount.svelte';
	import { formattedNum } from '$utils/formatNumber';
	import type { BigNumber } from 'ethers';

	export let sold: number;
	export let treasury: BigNumber | string;
	export let bids: number;
</script>

<section>
	<div>
		<h1>{sold}</h1>
		<span>Sold</span>
	</div>
	<div>
		<h1><EthAmount amount={treasury} precision={0} /></h1>
		<span>Treasury</span>
	</div>
	<div>
		<h1>{formattedNum(bids)}</h1>
		<span>Bids</span>
	</div>
</section>

<style>
	div {
		text-align: center;
		width: 100%;
		max-width: 200px;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.5em;
		font-weight: 600;
		color: var(--text-header);
	}

	section {
		padding: 4rem 2rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		text-align: center;
		margin: 0 auto;
		max-width: 1200;
		background: white;
	}

	span {
		font-size: 1rem;
		font-weight: 300;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 700px) {
		h1 {
			margin-bottom: 0px;
		}

		div:nth-child(n + 2) {
			margin-top: 25px;
		}
	}
</style>
