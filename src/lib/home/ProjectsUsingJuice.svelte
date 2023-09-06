<script lang="ts">
	import Icon from '$lib/components/Icon';
	import { querySubgraph, type WhereConfig } from '$utils/graph';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import ETHAmount from '$lib/components/ETHAmount.svelte';
	import { formatHistoricalDate } from '$utils/formatDate';
	import Trans from '$lib/components/Trans.svelte';
	import { readNetwork } from '$stores/web3';
	import { getTrendingProjects } from '$data/project';
	import TrendingProjectsCard from '$lib/components/TrendingProjectsCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import RichNote from '$lib/components/RichNote.svelte';
	import SplitPanels from '$lib/components/layouts/SplitPanels.svelte';
	import type { PayEvent } from '$models/subgraph-entities/vX/pay-event';

	export let days = 7;
	export let count = 6;

	async function getLatestPayments(platform?: string) {
		let where: WhereConfig<'payEvent'>[] = [
			{
				key: 'pv',
				value: '2',
			},
		];
		if (platform) {
			where.push({
				key: 'project',
				operator: '',
				value: `{platform: "${platform}"}`,
			});
		}
		return querySubgraph({
			entity: 'payEvent',
			keys: [
				'amount',
				'beneficiary',
				'note',
				'timestamp',
				'id',
				{ entity: 'project', keys: ['id', 'projectId', 'platform'] },
			],
			first: 20,
			orderDirection: 'desc',
			orderBy: 'timestamp',
			where: where,
		});
	}

	let projects: Promise<any[]>;
	$: if ($readNetwork) {
		projects = getTrendingProjects('daolabs', count, days);
	}

	let latestPayment: Promise<PayEvent[]>;
	$: if ($readNetwork) {
		latestPayment = getLatestPayments('daolabs');
	}
</script>

<SplitPanels>
	<svelte:fragment slot="left">
		<h1>
			<Trans>Trending treasuries</Trans>
		</h1>
		{#await projects}
			<Icon name="loading" spin={true} />
		{:then loadedProjects}
			{#each loadedProjects as project, rank}
				<TrendingProjectsCard {rank} {project} {days} />
			{/each}
		{:catch error}
			<p style="color: var(--text-failure)">{error}</p>
		{/await}
		<a href="/projects?tab=trending">
			<Button fullWidth type="secondary" size="md">More trending treasuries</Button>
		</a>
	</svelte:fragment>
	<svelte:fragment slot="right">
		<h1><Trans>Recently contributed</Trans></h1>
		<div class="payments">
			{#await latestPayment}
				<Icon name="loading" spin={true} />
			{:then payments}
				{#each payments as payment}
					<div class="payment">
						<InfoSpaceBetween>
							<div slot="left">
								<a href="/projects/{payment.project.platform}/{payment.project.projectId}">
									<p>Project {payment.project.projectId}</p>
								</a>
								<ETHAmount amount={payment.amount} precision={4} />
							</div>
							<div slot="right">
								<p class="timestamp">
									{payment.timestamp && formatHistoricalDate(payment.timestamp * 1000)}
								</p>
								<p class="address"><EnsOrAddress address={payment.beneficiary} /></p>
							</div>
						</InfoSpaceBetween>
						<div>
							<RichNote note={payment.note} style={{ marginTop: '10px' }} />
						</div>
					</div>
				{/each}
			{/await}
		</div>
	</svelte:fragment>
</SplitPanels>

<style>
	h1 {
		color: var(--text-header);
		font-weight: 600;
		font-size: 1.3rem;
		margin-bottom: 2rem;
	}

	.payments {
		max-height: 1070px;
		overflow: auto;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.payments::-webkit-scrollbar {
		display: none;
	}

	a {
		display: flex;
		justify-content: center;
	}

	p {
		margin: 0;
		font-weight: 700;
	}

	a p {
		color: var(--text-primary);
	}

	a p:hover {
		color: var(--text-action-secondary);
	}

	.address {
		font-weight: 300;
	}

	.timestamp {
		color: var(--text-secondary);
		font-size: 0.7rem;
		font-weight: 300;
	}

	.payment {
		padding-top: 10px;
		margin-bottom: 10px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--stroke-tertiary);
	}

	a[href='/projects?tab=all'] {
		margin-top: 20px;
	}
</style>
