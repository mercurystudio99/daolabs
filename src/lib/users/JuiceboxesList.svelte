<script lang="ts">
	import Icon from '$lib/components/Icon';
	import Pagination from '$lib/components/Pagination.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import ProjectCount from '$lib/projects/ProjectCount.svelte';
	import { connectedAccount } from '$stores/web3';
	import EthAmount from '$lib/components/ETHAmount.svelte';
	import ProjectLogo from '$lib/components/ProjectLogo.svelte';
	import type { Project } from '$models/subgraph-entities/vX/project';

	export let userAddress = '';
	export let projects: Project[];

	let loggedInAddress: string;
	connectedAccount.subscribe((value) => {
		loggedInAddress = value;
	});
</script>

{#if projects?.length > 0}
	<Pagination list={projects.filter((p) => p.metadataUri)}>
		<section slot="content" let:listSlice>
			{#each listSlice as project, index}
				<div id={index === 0 ? 'example-project-card' : ''} on:keydown>
					<ProjectCard {project} />
				</div>
			{/each}
		</section>
	</Pagination>
	<ProjectCount count={projects.length} />
	<p>
		<span>
			<Icon name="infoCircle" />
		</span>
		Project(s) you have created.
	</p>
{:else}
	<section class="example-card">
		<a id="example-project-card" href="/#" style="width: 45%;">
			<li>
				<ProjectLogo uri="/images/daolabs-lg.png" size={110} />
				<div>
					<h1>Example Treasury</h1>
					<div>
						<span class="handle">
							<span>@example-treasury</span>
						</span>
					</div>
					<div>
						<EthAmount amount="0" precision={0} />
						<span> since 2022-10-01 </span>
					</div>
					<div class="description">This is a example treasury description.</div>
				</div>
			</li>
		</a>
		{#if userAddress && userAddress.toLowerCase() === loggedInAddress.toLowerCase()}
			<p>You haven't created any treasuries yet.</p>
		{:else}
			<p>This user hasn't created any treasuries yet.</p>
		{/if}
	</section>
{/if}

<style lang="scss">
	section {
		margin: 32px 0;
		display: grid;
		grid-column-gap: 80px;
		grid-row-gap: 32px;
		grid-template-columns: repeat(2, minmax(340px, 1fr));
		grid-auto-flow: row;
	}
	.example-card {
		display: flex;
		flex-direction: column;
	}
	a {
		border-radius: 1px;
		cursor: pointer;
		overflow: hidden;
	}
	li {
		display: flex;
		position: relative;
		align-items: center;
		white-space: pre;
		overflow: hidden;
		padding: 25px 20px;
		border: 1px solid var(--stroke-tertiary);
		transition: border-color 0.12s ease-out;
		box-sizing: border-box;
	}
	li > div {
		margin-left: 20px;
		flex: 1 1 0%;
		min-width: 0px;
		max-height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	li:hover {
		border-color: var(--stroke-primary);
		cursor: pointer;
	}

	a,
	a:hover {
		color: inherit;
	}

	h1 {
		font-size: 18px;
		margin: 0px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	span {
		font-weight: 300;
	}
	.description {
		color: var(--text-tertiary);
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 300;
		max-height: 20px;
	}
	.handle {
		font-weight: 500;
		color: var(--text-secondary);
		font-size: 12px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 1000px) {
		section {
			grid-column-gap: 40px;
		}
		#example-project-card {
			max-width: 500px;
			width: 100% !important;
		}
	}
	@media (max-width: 768px) {
		section {
			grid-template-columns: minmax(340px, 1fr);
		}
	}
</style>
