<!-- DO NOT DELETE THIS FILE -->
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(async () => {
		await goto(window.location.href.replace(window.location.origin, ''), { replaceState: true });
	});
</script>
