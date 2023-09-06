<script>
	import BidItem from './BidItem.svelte';

	export let bids;
</script>

<section>
	{#each bids as bid}
		<BidItem {bid} />
	{/each}
</section>
