<script lang="ts">
	import EthAmount from '$lib/components/ETHAmount.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { formattedNum } from '$utils/formatNumber';
	import { querySubgraph } from '$utils/graph';

	// async function getData() {
	// 	return querySubgraph({
	// 		entity: 'protocolLog',
	// 		keys: ['erc20Count', 'paymentsCount', 'projectsCount', 'volumePaid']
	// 	});
	// }
</script>

<section>
	{#await querySubgraph( { entity: 'protocolLog', keys: ['erc20Count', 'paymentsCount', 'projectsCount', 'volumePaid'] }, )}
		<Loading />
	{:then data}
		<div>
			<h1>{data[0].projectsCount}</h1>
			<span>Projects on Juicebox</span>
		</div>
		<div>
			<h1><EthAmount amount={data[0].volumePaid} precision={0} /></h1>
			<span>Raised on Juicebox</span>
		</div>
		<div>
			<h1>{formattedNum(data[0].paymentsCount)}</h1>
			<span>Payments made</span>
		</div>
	{/await}
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
