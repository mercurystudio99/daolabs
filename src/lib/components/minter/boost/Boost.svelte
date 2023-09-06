<script lang="ts">
	import { default as BoostComponent } from '$lib/components/NftAttributes/Boost.svelte';
	import { BoostType, type Boost } from '$models/minter/nft-config';
	import type { AdvancedCollection } from '$models/minter/collection-config';

	export let boost: Boost;
	export let collection: AdvancedCollection;

	const getMaxBoost = (): number => {
		if (boost.type === BoostType.percentage) {
			return 100;
		}
		let highest = Number(boost.value);
		if (collection.nfts && collection.nfts.length > 0) {
			collection.nfts.forEach((nft) => {
				if (nft.attributes && nft.attributes.boosts) {
					nft.attributes.boosts.forEach((b) => {
						if (b.name === boost.name && b.type === BoostType.number) {
							highest = Math.max(highest, Number(b.value));
						}
					});
				}
			});
		}
		return highest;
	};
	const max = getMaxBoost();

	const percentage = (Number(boost.value) / max) * 100;
</script>

<BoostComponent
	boost={{ label: boost.name, value: Number(boost.value), type: boost.type }}
	{percentage}
/>
