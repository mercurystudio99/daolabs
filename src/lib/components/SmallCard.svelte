<script lang="ts">
	import { onMount } from 'svelte';
	import { layouts } from '$constants/styles/layouts';
	import ProjectLogo from './ProjectLogo.svelte';
	import Loading from './Loading.svelte';
	import EthAmount from './ETHAmount.svelte';
	import type { BigNumber } from 'ethers';

	export let logoUri: string;
	export let title: string;
	export let left: { value: BigNumber | string; label: string } = undefined;
	export let right: { value: BigNumber | string; label: string } = undefined;
	export let href: string;
	export let loading = true;

	let isMobile = false;

	onMount(() => {
		isMobile = window.innerWidth < layouts.screen.md;
	});
</script>

<a {href}>
	{#if loading}
		<Loading />
	{:else}
		<ProjectLogo uri={logoUri} size={isMobile ? 60 : 180} />
		<div class="info">
			<span>{title}</span>
			<div class="columns">
				{#if left}
					<div class:full={!right}>
						<span class="label">{left.label}</span>
						<p><b><EthAmount amount={left.value} precision={2} /></b></p>
					</div>
				{/if}
				{#if right}
					<div class:full={!left}>
						<p><b><EthAmount amount={right.value} precision={2} /> {right.label}</b></p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</a>

<style>
	a {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		overflow: hidden;
		width: 175px;
		min-height: 175px;
		text-align: center;
		background-color: var(--background-l3);
		border: 1px solid var(--stroke-tertiary);
		border-radius: var(--radius-lg);
		transition: border-color 0.12s ease-out;
		color: var(--text-primary);
	}

	a:hover {
		border-color: var(--stroke-primary);
	}

	p {
		margin: 0;
	}

	span {
		color: var(--text-primary);
		margin: 0px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.columns {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-around;
		width: 100%;
	}

	.info {
		margin: 0.5rem 0;
		min-width: 0px;
		width: 100%;
		white-space: pre;
	}

	.label {
		color: var(--text-secondary);
		font-size: 0.7rem;
		font-weight: 300;
	}

	@media (max-width: 767px) {
		a {
			width: 100%;
			padding: 0.5rem;
			flex-direction: row;
		}

		.info {
			width: 100%;
			font-size: 14px;
		}
	}
</style>
