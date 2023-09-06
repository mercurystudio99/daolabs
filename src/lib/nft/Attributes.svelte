<script lang="ts">
	import Attributes from '$lib/components/NftAttributes/Attributes.svelte';
	import Boosts from '$lib/components/NftAttributes/Boosts.svelte';
	import DetailSection from '$lib/components/minter/review-drawer/DetailSection.svelte';
	import Rankings from '$lib/components/NftAttributes/Rankings.svelte';
	import Stats from '$lib/components/NftAttributes/Stats.svelte';
	import { Alchemy } from '$data/alchemy';
	import type { Token } from '@zoralabs/zdk/dist/queries/queries-sdk';

	export let nft: Token;

	let properties: Attributes.Property[] = [];
	let boosts: Attributes.Boost[] = [];
	let rankings: Attributes.Ranking[] = [];
	let stats: Attributes.Stat[] = [];

	function prepareText(trait: string) {
		// Add space before all caps
		return trait.replace(/([A-Z])/g, ' $1').trim();
	}

	async function prepareAttributes(attributes: Token['attributes']) {
		if (!attributes) return;
		// TODO: use firebase functions instead
		const tokenData = await Alchemy.getTokenAttributes(nft.collectionAddress, nft.tokenId);
		for (const attribute of tokenData) {
			const label = prepareText(attribute.trait_type);
			if (typeof attribute.value === 'string') {
				properties = [
					...properties,
					{
						label,
						value: attribute.value,
						rarity: `${(attribute.prevalence * 100).toFixed(0)}%`,
					},
				];
			}
		}

		attributes
			.filter((attribute) => {
				return typeof attribute.value !== 'string';
			})
			.forEach((attribute) => {
				const label = prepareText(attribute.traitType);
				if (attribute.displayType?.startsWith('boost')) {
					boosts = [
						...boosts,
						{
							label,
							value: Number(attribute.value),
							type: attribute.displayType as Attributes.BoostType,
						},
					];
				} else if (attribute.displayType === 'number') {
					stats = [
						...stats,
						{
							label,
							value: Number(attribute.value),
						},
					];
				} else {
					rankings = [
						...rankings,
						{
							label,
							value: attribute.value,
						},
					];
				}
			});
	}

	$: prepareAttributes(nft.attributes);
</script>

{#if properties.length}
	<DetailSection header="Attributes" arrowBelowHeader={false}>
		<Attributes attributes={properties} styles={{ columnGap: '16px', justifyContent: 'center' }} />
	</DetailSection>
{/if}
{#if stats.length}
	<DetailSection header="Stats" arrowBelowHeader={false}>
		<Stats {stats} styles={{ columnGap: '16px', justifyContent: 'center' }} />
	</DetailSection>
{/if}
{#if rankings.length}
	<DetailSection header="Rankings" arrowBelowHeader={false}>
		<Rankings {rankings} />
	</DetailSection>
{/if}
{#if boosts.length}
	<DetailSection header="Boosts" arrowBelowHeader={false}>
		<Boosts {boosts} />
	</DetailSection>
{/if}
