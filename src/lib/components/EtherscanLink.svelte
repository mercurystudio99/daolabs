<script lang="ts" context="module">
	import { get } from 'svelte/store';
	import { readNetwork } from '$stores/web3';
	import { NetworkName } from '$models/network-name';

	export function etherscanLink(type: string, value: string): string {
		let subdomain = '';
		if (get(readNetwork).alias !== NetworkName.mainnet) {
			subdomain = `${get(readNetwork).alias}.`;
		}
		return `https://${subdomain}etherscan.io/${type}/${value}`;
	}
</script>

<script lang="ts">
	import Popover from '$lib/components/Popover.svelte';
	import Icon from '$lib/components/Icon';
	import ExternalLink from './ExternalLink.svelte';
	import EnsOrAddress from './EnsOrAddress.svelte';

	export let value: string;
	export let type: 'tx' | 'address';
	export let truncated: boolean = false;
	export let showTooltip = true;

	const href = etherscanLink(type, value);
</script>

{#if showTooltip}
	<Popover
		message={type === 'tx' ? 'See transaction' : 'Go to Etherscan'}
		placement="left"
		nowrap={true}
	>
		<ExternalLink {href}>
			{#if type === 'tx'}
				<span class="link">
					<Icon name="link" />
				</span>
			{:else}
				<EnsOrAddress truncate={truncated} address={value} showTooltip={false} />
			{/if}
		</ExternalLink>
	</Popover>
{:else}
	<ExternalLink {href}>
		{#if type === 'tx'}
			<span class="link">
				<Icon name="link" />
			</span>
		{:else}
			<EnsOrAddress truncate={truncated} address={value} showTooltip={false} />
		{/if}
	</ExternalLink>
{/if}

<style>
	.link {
		color: var(--text-primary);
	}

	.link:hover {
		color: var(--text-action-primary);
		transition: color 0.2s ease-in-out;
	}
</style>
