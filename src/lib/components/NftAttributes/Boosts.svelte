<script lang="ts">
	import Boost from './Boost.svelte';

	export let boosts: Attributes.Boost[] = [];
</script>

<div class="boosts">
	{#each boosts as boost}
		<Boost {boost} />
	{/each}
</div>

<style>
	.boosts {
		display: flex;
		gap: 30px;
		flex-wrap: wrap;
	}
</style>
