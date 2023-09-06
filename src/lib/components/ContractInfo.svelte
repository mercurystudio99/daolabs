<script lang="ts">
	import { ipfsCidUrl } from '$utils/ipfs';
	import ClipboardTooltip from './ClipboardTooltip.svelte';
	import EnsOrAddress from './EnsOrAddress.svelte';
	import HeavyBorderBox from './HeavyBorderBox.svelte';
	import Icon from './Icon';
	import PopInfo from './PopInfo.svelte';
	import Popover from './Popover.svelte';
	import type { Contract } from '$models/minter/nft-config';

	export let contract: Contract;
</script>

<HeavyBorderBox>
	<h3>
		<PopInfo message="Tooltip text">Contract deployed</PopInfo>
	</h3>
	<h4>
		<PopInfo message="Tooltip text">Name</PopInfo>
	</h4>
	<div class="content">
		{contract.name}
	</div>
	{#if contract.creator}
		<h4>
			<PopInfo message="Tooltip text">Creator</PopInfo>
		</h4>
		<div class="content">
			<EnsOrAddress address={contract.creator} showTooltip={false} />
			<Popover placement="top" message="Go to Etherscan">
				<a
					target="_blank"
					href={`https://etherscan.io/address/${contract.creator}}`}
					rel="noreferrer"
				>
					<Icon name="etherscan" style="transition: unset" />
				</a>
			</Popover>
			<ClipboardTooltip target={contract.creator} />
		</div>
	{/if}
	<h4><PopInfo message="Tooltip text">Address</PopInfo></h4>
	<div class="content">
		{contract.address}
		<Popover placement="top" message="Go to Etherscan">
			<a target="_blank" href={`https://etherscan.io/address/${contract.address}`} rel="noreferrer">
				<Icon name="etherscan" style="transition: unset" />
			</a>
		</Popover>
		<Popover placement="left" message="Download contract">
			<Icon name="jsonFile" />
		</Popover>
		<ClipboardTooltip target={contract.address} />
	</div>
	{#if contract.standard}
		<h4><PopInfo message="Tooltip text">Token standard</PopInfo></h4>
		<div class="content">
			{contract.standard}
		</div>
	{/if}
	{#if contract.ipfs}
		<h4><PopInfo message="Tooltip text">IPFS address</PopInfo></h4>
		<div class="content">
			{contract.ipfs.IpfsHash}
			<Popover message="Go to IPFS">
				<a target="_blank" href={ipfsCidUrl(contract.ipfs.IpfsHash)} rel="noreferrer">
					<Icon name="ipfs" />
				</a>
			</Popover>
			<ClipboardTooltip target={contract.ipfs.IpfsHash} />
		</div>
	{/if}
</HeavyBorderBox>

<style>
	h3,
	h4 {
		color: var(--text-header);
	}

	a,
	.content {
		color: var(--text-secondary);
	}

	.content {
		margin-bottom: 12px;
		word-break: break-word;
	}
</style>
