<script lang="ts">
	import { onMount } from 'svelte';
	import { initialize } from '$stores/web3';
	import { setCurrentNetworkAlias } from '$utils/web3/networkName';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	onMount(() => void initialize());

	$: browser && $page && setCurrentNetworkAlias();
</script>

<slot />
