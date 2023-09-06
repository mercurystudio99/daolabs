<script lang="ts">
	import ClipboardTooltip from '$lib/components/ClipboardTooltip.svelte';
	import Img from '$lib/components/Img.svelte';
	import Icon from '$lib/components/Icon';
	import LinksDisplay from '$lib/components/LinksDisplay.svelte';
	import Paragraph from '$lib/components/Paragraph.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import DownloadAbiIcon from '$lib/components/DownloadABIIcon.svelte';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import { layouts } from '$constants/styles/layouts';
	import OpenSeaCollectionStats from './OpenSeaCollectionStats.svelte';
	import type { OpenSeaAssetContract } from '$data/opensea';

	export let contractInfo: OpenSeaAssetContract;
	export let loading = true;

	let innerWidth: number = 1000;
	let links: string[] = [];

	function getInstagramLink() {
		if (contractInfo.collection?.instagram_username) {
			return `https://instagram.com/${contractInfo.collection.instagram_username}`;
		}
		return null;
	}

	function getMediumLink() {
		if (contractInfo.collection?.medium_username) {
			return `https://medium.com/${contractInfo.collection.medium_username}`;
		}
		return null;
	}

	function getTwitterLink() {
		if (contractInfo.collection?.twitter_username) {
			return `https://twitter.com/${contractInfo.collection.twitter_username}`;
		}
		return null;
	}

	$: if (contractInfo) {
		const unfilteredLinks = [
			contractInfo.externalLink,
			contractInfo.collection?.discord_url,
			getInstagramLink(),
			getMediumLink(),
			getTwitterLink(),
			contractInfo.collection?.telegram_url,
		];
		links = unfilteredLinks.filter((link) => link);
	}

	$: truncate = innerWidth < layouts.screen.sm;
</script>

<svelte:window bind:innerWidth />

<header>
	<div style="margin-bottom:20px">
		{#if loading}
			<div class="main">
				<Skeleton width="140px" height="140px" />
				<div class="info loading">
					<Skeleton height="40px" width="250px" style="margin-bottom: 10px" />
					<Skeleton height="20px" style="margin-bottom: 10px" />
					<Skeleton height="20px" style="margin-bottom: 10px" />
					<Skeleton height="30px" style="margin-bottom: 10px" />
				</div>
			</div>
		{:else}
			<div class="main">
				<Img
					src={replaceIpfsDomain(contractInfo.image_url)}
					alt={contractInfo.name}
					styles={{ width: '140px', height: '140px' }}
					placeholder="https://via.placeholder.com/110?text=..."
				/>
				<div class="info">
					<h1>{contractInfo.name}</h1>
					<div class="links">
						<LinksDisplay {links} stripHandle={false} />
					</div>
					<div class="contract">
						Contract Address:
						<div class="contract-links">
							<EnsOrAddress address={contractInfo.address} showTooltip={false} {truncate} />
							<div>
								<Popover placement="top" message="Go to Collection">
									<a href={`/nft/${contractInfo.address}`} rel="noreferrer">
										<Icon name="pfpType" />
									</a>
								</Popover>

								<Popover placement="top" message="Download ABI">
									<DownloadAbiIcon address={contractInfo.address} name={contractInfo.name} />
								</Popover>
								<ClipboardTooltip target={contractInfo.address} />
							</div>
						</div>

						{#if !truncate}
							<OpenSeaCollectionStats {contractInfo} />
						{/if}
					</div>
				</div>
			</div>
			{#if truncate}
				<OpenSeaCollectionStats {contractInfo} {truncate} />
			{/if}
		{/if}
	</div>
	{#if loading}
		<Skeleton height="40px" width="100%" />
	{:else if contractInfo.description}
		<Paragraph description={contractInfo.description} characterLimit={250} markdown />
	{/if}
</header>

<style>
	header {
		margin-bottom: 5em;
	}

	h1 {
		color: var(--text-header);
		font-size: 1.2rem;
	}

	.contract {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		color: var(--text-action-primary);
	}
	.contract-links {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		column-gap: 20px;
	}

	.info {
		font-size: 1em;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.links {
		display: flex;
		font-size: 1em;
		margin-bottom: 0.5em;
		flex-wrap: wrap;
	}

	:global(.links a) {
		margin-right: 2em;
	}

	.loading {
		width: 100%;
	}

	.main {
		display: flex;
		flex-direction: row;
		gap: 20px;
		margin-bottom: 1em;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		.main {
			align-items: center;
		}
	}
</style>
