<script lang="ts">
	import { modal } from '$stores';
	import Main from '$lib/nft/Main.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import PageError from '$lib/components/error/PageError.svelte';

	export let data: { nftMetadata: any };
</script>

<main>
	{#if data?.nftMetadata?.token}
		<Main
			nft={data.nftMetadata.token}
			events={data.nftMetadata.events}
			sales={data.nftMetadata.sales}
		/>
	{:else if !data?.nftMetadata?.token}
		<PageError customMessage="this nft doesn't seem to exist." />
	{:else}
		<Loading />
	{/if}
</main>
<Modal show={$modal} />

<style>
	main {
		max-width: 1104px;
		margin: 0 auto;
		margin-top: 2.5rem;
		padding: 2rem 1rem;
	}
</style>
