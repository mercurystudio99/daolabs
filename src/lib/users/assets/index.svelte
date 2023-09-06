<script lang="ts">
	import { page } from '$app/stores';
	import type { Balance } from '$services/users/getWalletTokens';

	export let userAddress: string;
	export let balances: Balance[] = [];
	export let route = '';

	let tab: 'tokens' | 'nfts' = 'tokens';
	let totalNftValue: number = -1;
	const setTotalNftValue = (val: number) => {
		totalNftValue = val;
	};

	$: tab = $page.params?.tab === 'nfts' ? 'nfts' : 'tokens';
</script>

<div class="tabs">
	<a
		href="{route || `/user/${userAddress}`}/assets"
		class="tab"
		class:selected={tab === 'tokens'}
		on:keydown>Tokens</a
	>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="5"
		height="5"
		fill="var(--icon-action-primary)"
		viewBox="0 0 16 16"
		transform="translate(0 -1.5)"
	>
		<circle cx="8" cy="8" r="8" />
	</svg>
	<a
		href="{route || `/user/${userAddress}`}/nfts"
		class="tab"
		class:selected={tab === 'nfts'}
		on:keydown>Nft</a
	>
</div>

{#if tab === 'tokens'}
	{#await import('./TokenAssets.svelte') then { default: Erc20Assets }}
		<svelte:component this={Erc20Assets} address={userAddress} {totalNftValue} {balances} />
	{/await}
{:else if tab === 'nfts'}
	{#await import('./NftAssets.svelte') then { default: NftAssets }}
		<svelte:component this={NftAssets} address={userAddress} {setTotalNftValue} />
	{/await}
{/if}

<style>
	.tabs {
		margin-top: 1em;
		text-transform: uppercase;
		color: var(--text-tertiary);
	}

	.tabs .selected {
		color: var(--text-primary);
	}

	.tabs a {
		color: var(--text-tertiary);
		cursor: pointer;
	}

	.tabs svg {
		margin: 0 0.25em;
		fill: var(--text-tertiary);
	}
</style>
