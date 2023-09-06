<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { constants } from 'ethers';
	import { computePosition, autoPlacement, type ComputePositionReturn } from '@floating-ui/dom';
	import { getProjectMetadata } from '$data/project';
	import { formatDate } from '$utils/formatDate';

	import Icon from '$lib/components/Icon';
	import EthAmount from './ETHAmount.svelte';
	import ProjectLogo from './ProjectLogo.svelte';
	import type { Project } from '$models/subgraph-entities/vX/project';
	import type { ProjectMetadataV6 } from '$models/project-metadata';

	export let project: Project;
	export let hidden = false;
	export let select = false;

	let loading = true;
	let metadata: ProjectMetadataV6;
	let popoverShow = false;
	let popoverRef: HTMLElement;
	let wrapperRef: HTMLElement;
	const dispatch = createEventDispatcher();

	onMount(async () => {
		try {
			metadata = await getProjectMetadata(project.metadataUri);
			dispatch('fetchMetadata', metadata);
		} catch (error) {
			console.log(error);
		}
		loading = false;
	});

	function setPosition({ x, y, strategy }: ComputePositionReturn) {
		Object.assign(popoverRef.style, {
			position: strategy,
			left: `${x}px`,
			top: `${y}px`,
		});
	}

	function togglePopover() {
		if (popoverShow) {
			popoverShow = false;
		} else {
			computePosition(wrapperRef, popoverRef, {
				middleware: [autoPlacement()],
			})
				.then(setPosition)
				.then(() => {
					popoverShow = true;
				})
				.catch((e) => console.log(e));
		}
	}

	// If the total paid is greater than 0, but less than 10 ETH, show two decimal places.
	const precision =
		project && project.totalPaid?.gt(0) && project.totalPaid.lt(constants.WeiPerEther) ? 2 : 0;
	// const terminalVersion = getTerminalVersion(project.terminal);
	$: isArchived = Boolean(metadata?.archived);
</script>

{#if loading}
	<div class="container">
		<li>
			<div class="loading">
				<Icon name="loading" spin />
			</div>
		</li>
	</div>
{:else}
	<div class="container" style="display: {hidden ? 'none' : 'block'};">
		<li class={select ? 'select' : ''}>
			<ProjectLogo uri={metadata.logoUri} size={110} />
			<section>
				<h1>{metadata.name}</h1>
				<div>
					<span class="handle">
						{#if project.handle}
							<span>@{project.handle}</span>
						{:else}
							Project {project.projectId}
						{/if}
					</span>
				</div>
				<div>
					<EthAmount amount={project.totalPaid} {precision} />
					<span>
						since {project.createdAt && formatDate(project.createdAt * 1000, 'yyyy-MM-dd')}
					</span>
				</div>
				{#if metadata.description}
					<div
						class="description"
						bind:this={wrapperRef}
						on:mouseenter={togglePopover}
						on:mouseleave={togglePopover}
					>
						{metadata.description}
					</div>
				{/if}
				{#if isArchived}
					<div class="archived">ARCHIVED</div>
				{/if}
			</section>
		</li>
	</div>
{/if}
<div bind:this={popoverRef} class="popover {popoverShow && 'show'}">
	{metadata?.description}
</div>

<style>
	.container {
		border-radius: 1px;
		cursor: pointer;
		overflow: hidden;
	}
	.select {
		border-color: var(--text-action-primary);
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

	li:hover {
		border-color: var(--stroke-primary);
		cursor: pointer;
	}

	.container,
	.container:hover {
		color: inherit;
	}

	h1 {
		font-size: 18px;
		margin: 0px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	section {
		margin-left: 20px;
		flex: 1 1 0%;
		min-width: 0px;
		max-height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	span {
		font-weight: 300;
	}
	.archived {
		position: absolute;
		top: 0;
		right: 0;
		padding: 2px 4px;
		background: var(--background-l1);
		font-size: 0.7rem;
		color: var(--text-tertiary);
		font-weight: 500;
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
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--text-header);
		transform: scale(2);
		height: 100%;
		width: 100%;
	}

	.popover {
		position: absolute;
		max-width: 250px;
		background: var(--background-l0);
		box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
		transition: visibility 0.3s cubic-bezier(0.75, -0.02, 0.2, 0.97);
		padding: 10px;
		z-index: 999;
		font-size: 0.85rem;
		font-weight: 300;
		white-space: normal;
		visibility: hidden;
		word-break: break-all;
	}

	.popover.show {
		visibility: visible;
	}

	@media (max-width: 850px) {
		li {
			flex: 0 0 100%;
			margin-bottom: 0px;
		}
	}
</style>
