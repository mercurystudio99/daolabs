<script lang="ts">
	import { onMount } from 'svelte';
	import blacklist from '$constants/blacklist';
	import { getProjects } from '$data/project';
	import SmallProjectCard from '$lib/components/SmallProjectCard.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { readNetwork } from '$stores/web3';
	import type { Project } from '$models/subgraph-entities/vX/project';

	let projects: Project[] = [];
	let projectsLoading = true;

	async function fetchFour(cnt: number) {
		if (projects.length > 3) {
			projects = projects.slice(0, 4);
			projectsLoading = false;
			return;
		}

		const unfilteredResponse = await getProjects({
			pageSize: 4,
			pageNumber: cnt,
			platform: 'daolabs',
		});
		const res = unfilteredResponse.filter(({ projectId }) => !blacklist.includes(projectId));

		projects = projects.concat(res);

		if (unfilteredResponse.length < 4) {
			projects = projects.slice(0, 4);
			projectsLoading = false;
			return;
		}
		await fetchFour(cnt + 1);
	}

	onMount(() => readNetwork.subscribe(() => fetchFour(0)));
</script>

<section>
	<article>
		<h3>Featured treasuries</h3>
		{#if projectsLoading}
			<Loading height={300} fullWidth />
		{:else}
			<div class="projects">
				{#each projects.filter((p) => p.metadataUri) as project}
					<SmallProjectCard {project} />
				{/each}
			</div>
		{/if}
	</article>
</section>

<style>
	h3 {
		color: var(--text-header);
		font-family: 'Montserrat';
		font-style: normal;
		font-weight: 700;
		font-size: 16px;
		/* float: left; */
		line-height: 25px;
		letter-spacing: -0.002em;
		margin-bottom: 26px;
		/* align with projects */
		margin-left: calc(10% + 20px);
	}

	article {
		margin: auto;
		max-width: 1150px;
		/* text-align: center; */
	}

	section {
		margin: 80px 0px 0px;
		padding: 80px 40px;
		background: var(--background-l1);
	}

	.projects {
		display: flex;
		gap: 20px;
		width: 80%;
		justify-content: space-between;
		margin: 0px auto;
		flex-wrap: wrap;
		padding: 0px 20px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		section {
			padding: 80px 40px;
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 767px) {
		.projects {
			width: 100%;
			padding: 40px 10px;
		}
	}

	@media (min-width: 768px) and (max-width: 1100px) {
		.projects {
			justify-content: center;
		}
	}

	@media (max-width: 850px) {
		section {
			margin-top: 50px;
		}
	}
</style>
