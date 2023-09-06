<script lang="ts">
	import { writable } from 'svelte/store';
	import { convertTouchEventToArray } from '../../directives/scrollable';

	export let y = 0;
	const last = writable(0);

	const wheel = (evt: WheelEvent) => (y += evt.deltaY);

	const touchstart = (evt: TouchEvent) => last.set(convertTouchEventToArray(evt)[0].pageY);
	const touchmove = (evt: TouchEvent) => {
		const touches = convertTouchEventToArray(evt);
		y -= touches[0].pageY - $last;
		last.set(touches[0].pageY);
	};
</script>

<div
	on:wheel={wheel}
	on:touchstart|stopPropagation={touchstart}
	on:touchmove|stopPropagation={touchmove}
>
	<slot />
</div>

<style>
	div {
		height: 100%;
		display: grid;
		overflow: hidden;
	}
</style>
