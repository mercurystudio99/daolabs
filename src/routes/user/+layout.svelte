<script lang="ts">
	import FooterProject from '$lib/components/FooterProject.svelte';
	import UserLandingPage from '$lib/users/UserLandingPage.svelte';
	import { browser } from '$app/environment';
</script>

<svelte:head>
	<title>User | MOVEMENT</title>
	<script src="/libs/introjs/intro.js"></script>
	<link rel="stylesheet" href="/libs/introjs/introjs.css" />
</svelte:head>

{#if browser}
	<div class="page">
		<UserLandingPage />
		<slot />
		<FooterProject />
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
