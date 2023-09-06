<script lang="ts">
	import { isCollectionDeployed } from '$utils/collectionHelpers';
	import ContractInfo from './ContractInfo.svelte';
	import type { Collection } from '$models/minter/collection-config';

	export let collection: Collection;
</script>

{#if !isCollectionDeployed(collection)}
	<p>Collection is not deployed yet.</p>
{/if}

{#if collection.contracts?.nft?.address}
	<ContractInfo contract={collection.contracts.nft} />
{/if}

{#if collection.contracts?.pricing?.address}
	<ContractInfo contract={collection.contracts.pricing} />
{/if}
