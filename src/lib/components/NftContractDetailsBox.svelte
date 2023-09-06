<script lang="ts">
	import { toSentenceCase } from '$utils/string';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import Icon from '$lib/components/Icon';
	import LongWord from './LongWord.svelte';

	export let details: {
		contractAddress?: string;
		tokenId: string;
		tokenURI?: string;
		tokenStandard: string;
		chain: string;
		royalty?: string | number;
		creator?: string;
	};
</script>

<div class="details-container">
	<p>
		<span>Contract Address</span>
		{#if details.contractAddress}
			<span class="link">
				<EnsOrAddress address={details.contractAddress} ourPlatform={false} />
				<Icon name="link" />
			</span>
		{:else}
			<i>Not known</i>
		{/if}
	</p>
	<p>
		<span>Token ID</span>
		{#if details.tokenURI}
			<a href={details.tokenURI || '/#'}>
				<span class="link">
					<LongWord width={150} ellipsis>
						{details.tokenId}
					</LongWord>
					<Icon name="link" />
				</span>
			</a>
		{:else}
			<LongWord width={150} ellipsis>
				{details.tokenId}
			</LongWord>
		{/if}
	</p>
	<p>
		<span>Token Standard</span>
		<span>{details.tokenStandard}</span>
	</p>
	<p>
		<span>Blockchain</span>
		<span>{toSentenceCase(details.chain)}</span>
	</p>
	<p>
		<span>Creator Fees</span>
		<span>{details.royalty || '0'}%</span>
	</p>
	<p>
		<span>Creator Address</span>
		<span>
			{#if details.creator}
				<EnsOrAddress address={details.creator} />
			{:else}
				<i>Not known</i>
			{/if}
		</span>
	</p>
</div>

<style>
	.details-container {
		display: flex;
		flex-direction: column;
		color: var(--text-tertiary);
	}

	p {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	p:last-child {
		margin-bottom: 0;
	}

	.link {
		color: var(--text-action-primary);
		display: flex;
		align-items: center;
		gap: 8px;
	}
</style>
