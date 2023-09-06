<script lang="ts">
	import Icon from '$lib/components/Icon';

	import Popover from '$lib/components/Popover.svelte';
	import { copyToClipboard } from '$utils/clipboard';
	import { ipfsCidUrl } from '$utils/ipfs';

	import IpfsIcon from '../icons/IpfsIcon.svelte';
	import type { PinataPinResponse } from 'pinata_ipfs_sdk';

	export let pinInfo: PinataPinResponse;
</script>

{#if pinInfo}
	<Popover maxWidth="250px">
		<div slot="content">
			<span class="ipsf-hash">
				{`${pinInfo.IpfsHash} (${Math.floor(pinInfo.PinSize / 1000)}kb)`}
				<span
					class="ipfs-icon"
					on:click={() => copyToClipboard(ipfsCidUrl(pinInfo.IpfsHash))}
					on:keydown
				>
					<IpfsIcon />
				</span>
				<Icon
					name="copy"
					on:click={() => copyToClipboard(pinInfo.IpfsHash)}
					style="cursor: pointer"
				/>
			</span>
		</div>
		<slot />
	</Popover>
{:else}
	<slot />
{/if}

<style lang="scss">
	.ipsf-hash {
		font-weight: 500;
		font-size: 11px;
		line-height: 18px;
		color: var(--text-secondary);
		word-break: break-word;

		.ipfs-icon {
			cursor: pointer;
		}
	}
</style>
