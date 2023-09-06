<script>
	import { scale } from 'svelte/transition';
	import { getContext } from 'svelte';
	import { storeContextKey } from '../../context';

	const store = getContext(storeContextKey);
</script>

<div
	in:scale|local={{ start: $store.activeViewDirection * 0.5 + 1, delay: 110 }}
	out:scale|local={{ start: $store.activeViewDirection * -0.5 + 1 }}
>
	<slot />
</div>
