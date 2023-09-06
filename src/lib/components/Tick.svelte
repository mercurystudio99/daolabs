<script lang="ts">
	import { onMount } from 'svelte';

	export let tick = 0;
	export let done = false;

	let interval: ReturnType<typeof setInterval>;

	$: if (done) {
		clearInterval(interval);
	}

	onMount(() => {
		interval = setInterval(() => {
			tick += 1;
		}, 1000);
	});
</script>

{tick}
