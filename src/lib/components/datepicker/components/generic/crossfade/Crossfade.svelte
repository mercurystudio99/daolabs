<script lang="ts">
	import { setContext } from 'svelte';
	import { readable } from 'svelte/store';
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	export let key = {};
	export let duration: number;

	export let easing = cubicInOut;
	const durationFn = (d: number) => Math.max(150, Math.sqrt(d * 150));
	const [send, receive] = crossfade({
		duration,
		easing,
		fallback(node) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;
			return {
				duration: durationFn(duration),
				easing,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
			};
		},
	});
	const store = readable({ key, send, receive });
	setContext('crossfade', store);
</script>

<slot {key} {send} {receive} />
