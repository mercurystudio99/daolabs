<script lang="ts">
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import { deepCopy } from '$utils/object';
	import Store from '$utils/Store';
	import CollectionMetadata from '$lib/collection/CollectionMetadata.svelte';
	import DeployNft from '$lib/collection/DeployNft.svelte';
	import NftSection from '$lib/collection/NFTSection.svelte';
	import { isCurrentUserSpaceCadet } from '$utils/users/user';
	import DeployedNftInfo from '$lib/collection/DeployedNftInfo.svelte';
	import NftSectionReadOnly from '$lib/collection/NFTSectionReadOnly.svelte';
	import ContractInfo from '$lib/components/ContractInfo.svelte';
	import type { AdvancedCollection } from '$models/minter/collection-config';
	import type { NftConfig } from '$models/minter/nft-config';

	export let collection: AdvancedCollection;
	export let saveCollection: (form: AdvancedCollection) => Promise<void>;
	export let updateCollectionNfts: () => Promise<void>;
	export let readonly: boolean;

	const createForm = (coll: AdvancedCollection): NftConfig[] => {
		let copy: NftConfig[] = [];
		if (coll.nfts) {
			// TODO: check why this isn't set by default somewhere more appropriate
			copy = deepCopy(coll.nfts);
			copy.forEach((nft) => {
				if (!nft.attributes) {
					nft.attributes = {
						properties: [],
						levels: [],
						stats: [],
						boosts: [],
					};
				} else {
					nft.attributes = {
						properties: nft.attributes.properties ?? [],
						levels: nft.attributes.levels ?? [],
						stats: nft.attributes.stats ?? [],
						boosts: nft.attributes.boosts ?? [],
					};
				}
			});
		}
		return copy;
	};

	const nfts = new Store(createForm(collection));

	$: {
		nfts.update(() => createForm(collection));
	}
</script>

{#if readonly}
	<DeployedNftInfo>
		<ContractInfo contract={collection.contracts.nft} />
		<NftSectionReadOnly />
	</DeployedNftInfo>
	<br />
	<HeavyBorderBox>
		<CollectionMetadata
			{collection}
			{nfts}
			{saveCollection}
			updateCollection={updateCollectionNfts}
			readonly={!isCurrentUserSpaceCadet() && readonly}
		/>
	</HeavyBorderBox>
	{#if isCurrentUserSpaceCadet()}
		<HeavyBorderBox>
			<DeployNft {collection} {saveCollection} />
		</HeavyBorderBox>
	{/if}
{:else}
	<HeavyBorderBox>
		<NftSection {collection} {nfts} {saveCollection} {createForm} />
	</HeavyBorderBox>
	<HeavyBorderBox>
		<CollectionMetadata
			{collection}
			{nfts}
			{saveCollection}
			updateCollection={updateCollectionNfts}
		/>
	</HeavyBorderBox>
	<HeavyBorderBox>
		<DeployNft {collection} {saveCollection} />
	</HeavyBorderBox>
{/if}
