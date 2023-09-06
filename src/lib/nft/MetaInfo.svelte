<script lang="ts">
	import Icon from '$lib/components/Icon';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import { connectedAccount } from '$stores/web3';
	import type { Token } from '@zoralabs/zdk/dist/queries/queries-sdk';

	export let nft: Token;

	// TODO: add real data
	let favoritesCount = 0;
	let viewsCount = 0;
</script>

<h1>
	{nft?.name ?? nft?.tokenId}
</h1>

<div class="stats">
	{#if nft?.owner}
		<div class="stat">
			<Icon name="user" /> <span>Owned by</span>
			{#if $connectedAccount.toLowerCase() === nft.owner.toLowerCase()}
				You
			{:else}
				<EnsOrAddress address={nft.owner} />
			{/if}
		</div>
	{/if}
	{#if true}
		<div class="stat">
			<Icon name="eye" />
			{viewsCount} <span>views</span>
		</div>
	{/if}
	{#if true}
		<div class="stat">
			<Icon name="favorite" />
			{favoritesCount} <span>favorites</span>
		</div>
	{/if}
</div>

<style>
	h1 {
		color: var(--text-header);
		word-break: break-word;
	}

	span {
		color: var(--text-tertiary);
	}

	.stats {
		display: flex;
		flex-direction: row;
		gap: 1em;
		margin-top: 1em;
		align-items: center;
	}

	.stat {
		color: var(--text-action-primary);
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 0.5em;
		text-transform: uppercase;
		margin-right: 0.5em;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		.stats {
			flex-direction: column;
			width: 100%;
			align-items: flex-start;
		}
	}
</style>
