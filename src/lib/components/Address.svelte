<script lang="ts">
	import { getTruncatedAddress } from '$lib/utils/getTruncatedAddress';

	let data: HTMLElement;
	$: if (data) {
		data.innerText = getTruncatedAddress(data?.innerText);
	}
</script>

<div bind:this={data}><slot /></div>
