<script lang="ts">
	import { getProjectMetadata } from '$data/project';
	import { SECONDS_IN_DAY } from '$constants/numbers';
	import Icon from '$lib/components/Icon';
	import EthAmount from './ETHAmount.svelte';
	import ProjectLogo from './ProjectLogo.svelte';
	import type { TrendingProject } from '$models/subgraph-entities/vX/project';

	export let days: number;
	export let rank: number;
	export let project: TrendingProject;

	function getPercentGainText() {
		if (
			project.createdAt &&
			project.createdAt > new Date().valueOf() / 1000 - days * SECONDS_IN_DAY
		) {
			return 'New';
		}
		const preTrendingVolume = project.totalPaid?.sub(project.trendingVolume);
		if (!preTrendingVolume?.gt(0)) return '+∞';
		const percentGain = project.trendingVolume.mul(10000).div(preTrendingVolume).toNumber();
		let percentRounded: number;
		// If percentGain > 1, round to int
		if (percentGain >= 100) {
			percentRounded = Math.round(percentGain / 100);
			// If 0.1 <= percentGain < 1, round to 1dp
		} else if (percentGain >= 10) {
			percentRounded = Math.round(percentGain / 10) / 10;
			// If percentGain < 0.1, round to 2dp
		} else {
			percentRounded = percentGain / 100;
		}
		return `+${percentRounded}%`;
	}
</script>

<a
	href={project.handle
		? `/@${project.handle}`
		: `/projects/${project.platform}/${project.projectId}`}
>
	<li>
		<div class="rank">{rank + 1}</div>
		{#await getProjectMetadata(project.metadataUri)}
			<p><Icon name="loading" spin /></p>
		{:then result}
			<div class="logo">
				<ProjectLogo uri={result.logoUri} size={70} />
			</div>
			<section>
				<h1>{result.name || project.id}</h1>
				{#if project.handle}
					<div>
						<span class="handle">
							<span>@{project.handle}</span>
						</span>
					</div>
				{/if}
				<EthAmount amount={project.trendingVolume} /> <span>last {days} days</span>
				<b>{getPercentGainText()}</b>
				<p>
					{project.trendingPaymentsCount}
					{project.trendingPaymentsCount > 1 ? 'payments' : 'payment'}
				</p>
			</section>
		{:catch error}
			<p style="color: var(--text-failure)">{error}</p>
		{/await}
	</li>
</a>

<style>
	a {
		color: inherit;
		display: flex;
		margin-bottom: 10px;
		background: var(--background-l2);
	}
	li {
		display: flex;
		align-items: center;
		padding: 8px 20px;
		border: 1px solid var(--stroke-tertiary);
		border-radius: var(--radius-lg);
		height: 100%;
		width: 100%;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 400px) {
		li {
			padding: 12.5px 10px;
		}
	}

	li:hover {
		border-color: var(--stroke-primary);
		cursor: pointer;
	}

	h1 {
		font-size: 16px;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-bottom: 0.1rem;
	}

	b {
		color: var(--text-header);
	}

	section {
		margin-left: 10px;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	p {
		margin: 0;
	}

	p,
	span {
		font-weight: 300;
	}

	.logo {
		width: 70px;
		height: 70px;
		margin-right: 1rem;
	}

	.rank {
		font-size: 20px;
		margin-right: 20px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		li {
			flex: 0 0 100%;
			max-width: calc(100vw - 20px);
		}
	}
</style>
