<script lang="ts">
	import { onMount } from 'svelte';
	import type { Balance } from '$services/users/getWalletTokens';

	export let address: string;
	export let totalNftValue: number;
	export let balances: Balance[] = [];

	let ERC20AssetList: typeof import('./ERC20AssetList.svelte').default;
	let Erc20Transactions: typeof import('./Transactions.svelte').default;

	onMount(async () => {
		ERC20AssetList = (await import('./ERC20AssetList.svelte')).default;
		Erc20Transactions = (await import('./Transactions.svelte')).default;
	});
</script>

<main>
	<section class="leftColumn">
		<svelte:component this={ERC20AssetList} {address} {totalNftValue} {balances} />
	</section>
	<section>
		<svelte:component this={Erc20Transactions} {address} />
	</section>
</main>

<style>
	main {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 2rem;
	}
	section {
		width: 50%;
	}

	/* mobile  */
	@media only screen and (max-width: 600px) {
		main {
			flex-direction: column;
		}
		section {
			width: 100%;
		}
	}
</style>
