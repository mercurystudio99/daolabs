<script lang="ts">
	/**
	 * NOTE: Do we need this, given the pfp simulation thing? Maybe just show a list of ipfs hashes?
	 */
	import { onMount } from 'svelte';
	import { ipfsCidToFirebaseUrl } from '$utils/ipfs';
	import Img from '$lib/components/Img.svelte';
	import ClipboardTooltip from '$lib/components/ClipboardTooltip.svelte';
	import Icon from '$lib/components/Icon';
	import Dropdown from '$lib/components/Dropdown.svelte';

	import type { PfpNftConfig } from '$models/minter/nft-config';

	export let nfts: PfpNftConfig[];

	let current = nfts.findIndex((nft) => nft.ipfs?.length > 0) || 0;

	function changePopulation(e: CustomEvent) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		current = e.detail.value;
	}

	$: nftDropdownOptions = nfts
		.filter((p) => p.ipfs?.length > 0)
		.map((nft: PfpNftConfig, index: number) => {
			return {
				value: index,
				label: nft.name || `NFT ${index + 1}`,
			};
		});
</script>

<!-- TODO: some handling if # of ipfs is > 100. batch load on scroll. -->
{#if nfts.some((p) => p.ipfs)}
	{#if nftDropdownOptions.length > 1}
		<header>
			<div class="dropdown">
				<Dropdown
					size="xs"
					options={nftDropdownOptions}
					value={nftDropdownOptions[current].value}
					on:select={changePopulation}
				/>
			</div>
		</header>
	{/if}
	<main>
		{#each nfts[current]?.ipfs as pin}
			<div class="imgWrapper">
				<Img
					styles={{ width: '100%', height: '100%', objectFit: 'cover' }}
					loadingStyles={{ width: '150px', height: '150px' }}
					src={ipfsCidUrl(pin.IpfsHash)}
					alt="A layering"
					placeholder={'https://via.placeholder.com/200?text=...'}
				/>
				<div class="imgOverlay">
					<div class="imgText">
						<!-- <IpfsCidTooltip cid={pin.IpfsHash}>
						</IpfsCidTooltip> -->
					<a target="_blank" href={url} rel="noopener noreferrer">
						{name} #{index}
						<Icon name="ipfs" />
					</a>
					<div class="center">
						<ClipboardTooltip target={url} />
					</div>
				</div>
			</div>
		</div>
	{/each}
</main>

<style>
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] 
	*/
	@media (min-width: 750px) {
		main {
			width: 700px;
			margin: 0 auto;
			display: grid;
			grid-template-columns: repeat(auto-fill, 200px);
			grid-template-rows: repeat(auto-fill, 200px);
			grid-gap: 1rem;
			justify-items: center;
			align-items: center;
		}
	}

	header {
		display: flex;
		margin-right: 28px;
		justify-content: flex-end;
	}

	header .dropdown {
		width: 200px;
	}

	.center {
		text-align: center;
	}

	.imgWrapper {
		position: relative;
	}

	.imgOverlay {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100%;
		width: 100%;
		transition: 0.5s ease;
		opacity: 0;
	}

	.imgOverlay:hover {
		opacity: 1;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.imgOverlay .imgText {
		color: white;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		-ms-transform: translate(-50%, -50%);
		word-break: break-all;
	}
</style>
