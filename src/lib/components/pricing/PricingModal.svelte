<script lang="ts">
	import { onMount } from 'svelte';
	import PricingFixedForm from './PricingFixedForm.svelte';
	import PricingAuctionForm from './PricingAuctionForm.svelte';
	import type { AdvancedCollection } from '$models/minter/collection-config';

	export let collection: AdvancedCollection;
	export let close;
	export let saveCollection: (form: AdvancedCollection) => Promise<void>;
	export let method: 'fixed' | 'highest' | 'declining' = 'fixed';

	let activeMethod: 'fixed' | 'highest' | 'declining';

	onMount(() => {
		if (collection.pricing) {
			activeMethod = collection.pricing.method;
		} else {
			activeMethod = method;
		}
	});
</script>

{#if activeMethod === 'fixed'}
	<PricingFixedForm {collection} {close} {saveCollection} bind:method={activeMethod} />
{:else if activeMethod === 'highest' || activeMethod === 'declining'}
	<PricingAuctionForm {collection} {close} {saveCollection} bind:method={activeMethod} />
{/if}
