<script lang="ts">
	import { slide } from 'svelte/transition';
	import { t } from '$lib/translations';
	import clickOutsideDirective from '$utils/clickOutside';
	import Icon from '$lib/components/Icon';
	import ExternalLink from './ExternalLink.svelte';
	import Collapse from './Collapse.svelte';

	export let isMobile: boolean = false;
	let isOpen: boolean = false;

	const resources = [
		{
			label: 'About',
			href: '/about',
		},
		{
			label: 'Docs',
			href: 'https://docs.move.xyz/daolabs/documentation/README.md',
		},
		{
			label: 'Proposals',
			href: 'https://docs.move.xyz/daolabs/daos/move/proposals/README.md',
		},
		{
			label: 'Snapshot',
			href: 'https://snapshot.org/#/snapshot.movedao.eth',
		},
		{
			label: 'Blog',
			href: 'https://docs.move.xyz/daolabs/blog/README.md',
		},
		{
			label: 'GitHub',
			href: 'https://github.com/DAOLABS-WTF',
		},
	];
</script>

{#if isMobile}
	<button
		class="isMobile"
		use:clickOutsideDirective
		on:clickOutside={() => (isOpen = false)}
		on:click={() => {
			isOpen = !isOpen;
		}}
	>
		{$t('common.Resources')}
		<Icon name="down" direction={isOpen ? 's' : 'n'} />
	</button>
	{#if isOpen}
		<nav class="isMobile" transition:slide>
			{#each resources as resource}
				<ExternalLink href={resource.href}
					>{$t(`common.${resource.label}`, { default: resource.label })}</ExternalLink
				>
			{/each}
		</nav>
	{/if}
{:else}
	<Collapse bind:isOpen>
		<button class:isMobile>
			{$t('common.Resources')}
			<Icon name="down" direction={isOpen ? 's' : 'n'} />
		</button>
		<nav
			use:clickOutsideDirective
			on:clickOutside={() => {
				isOpen = false;
			}}
			slot="content"
		>
			{#each resources as resource}
				<ExternalLink href={resource.href}
					>{$t(`common.${resource.label}`, { default: resource.label })}</ExternalLink
				>
			{/each}
		</nav>
	</Collapse>
{/if}

<style>
	button {
		background: none;
		border: none;
		outline: inherit;
		display: inline-flex;
		justify-content: space-between;
		cursor: pointer;
		align-items: center;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 0px;
		margin: 24px 0px 0px;
		padding-left: 0px;
		padding-right: 0px;

		display: flex;
		gap: 7px;
	}

	button.isMobile {
		margin: 0;
		padding: 0;
		margin-top: 7px;
		width: 88%;
	}

	nav {
		display: flex;
		flex-direction: column;
		background: var(--background-l0);
		max-width: 120px;
		border: 1px solid var(--stroke-primary);
	}

	nav.isMobile {
		max-width: 100%;
		border: none;
	}

	:global(nav[slot='content'] a, nav.isMobile a) {
		cursor: pointer;
		align-items: center;
		line-height: 40px;
		font-weight: 500;
		color: var(--text-primary);
		padding: 0px 15px;
	}
</style>
