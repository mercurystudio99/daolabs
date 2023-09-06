<script lang="ts">
	import FooterProject from '$lib/components/FooterProject.svelte';
	import UserLandingPage from '$lib/users/UserLandingPage.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { browser } from '$app/environment';
	import type { Balance } from '$services/users/getWalletTokens';

	type Data = {
		address: string;
		balances: Balance[];
	};

	export let data: Data;
</script>

<svelte:head>
	<title>User {data.address} | MOVEMENT</title>
	<script src="/libs/introjs/intro.js"></script>
	<link rel="stylesheet" href="/libs/introjs/introjs.css" />
</svelte:head>

{#if browser}
	<div class="page">
		{#if data.address}
			<UserLandingPage address={data.address} balances={data.balances} />
			<slot />
			<FooterProject />
		{:else}
			<Loading height={600} />
		{/if}
	</div>
{/if}

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		padding-bottom: 82px;
		min-height: calc(100vh - 64px);
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 767px) {
		.page {
			min-height: 100vh;
		}
	}
</style>
