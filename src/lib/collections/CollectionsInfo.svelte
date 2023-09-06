<script>
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import { connectedAccount } from '$stores/web3';
</script>

<main>
	<h1>Collections on Movement</h1>
	{#if $connectedAccount}
		<a href="/user/{$connectedAccount}/collections">
			<Button>Create collection</Button>
		</a>
	{/if}
</main>

<p>
	<span>
		<Icon name="infoCircle" />
	</span>
	A Collection (also referred to as non-fungible token collection) is an assortment of blockchain digital
	assets produced by an individual, community, business, artist (or group of artists) containing a number
	of verifiable attributes such as inventory count, provenance, and transaction history.
</p>
<p>
	Below are the Collections that have been created on Movement, to browse, discover and mint. Anyone
	can create a Collection, all that is needed is a little Ethereum and some creativity. Once you
	decide the type of content that you want to create, our tools work with image, music, video, code,
	and generative layered images/vector files (commonly referred to as PFP), we think you can go to
	market in 5 mins. Whatever content you produce, our tools were designed to democratize and
	transform how digital assets are to be generated, marketed, and distributed.
</p>

<style>
	h1 {
		color: var(--text-header);
	}

	p {
		max-width: 800px;
		margin-bottom: 20px;
		font-size: 14px;
		font-weight: 300;
		line-height: 1.4;
	}

	main {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
</style>
