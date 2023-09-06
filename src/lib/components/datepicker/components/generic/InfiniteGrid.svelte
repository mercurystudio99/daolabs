<script lang="ts">
	import { tick } from 'svelte';
	import { spring } from 'svelte/motion';
	import { derived, writable } from 'svelte/store';

	type VisibleData<T> = {
		data: T;
		pos: number;
		index: number;
	};

	export let cellCount = 4;
	export let itemCount = 0;
	export let index = 0;
	export let vertical = true;
	export let get: (index: number) => any;
	export let stiffness = 0.065;
	export let damping = 0.9;
	export let useCache = true;
	export let idKey;

	export const move = (amount: number) => {
		index = Math.max(0, Math.min(itemCount - 1, index + amount));
	};

	const forceUpdate = writable(false);
	export const triggerUpdate = async () => {
		await tick();
		forceUpdate.set(true);
		await tick();
		forceUpdate.set(false);
	};

	let inRange = [-Infinity, Infinity];
	const initialized = writable(false);
	const dim = writable({ w: 0, h: 0 });
	const offset = spring(0, { stiffness, damping });
	export const visibleData = derived(
		[dim, offset, initialized, forceUpdate],
		([{ w, h }, $o, $initialized, $force]) => {
			if (!w || !h || !$initialized) return [];
			if ($o < inRange[0] || $o > inRange[1]) return $visibleData as VisibleData<any>;
			// const divisibleHeight = cellCount > 1 ? h + (cellCount - (h % cellCount)) : h;
			const cellHeight = h / cellCount;
			const start = Math.max(-1, Math.floor((-1 * $o) / cellHeight) - 1);
			const baseOffset = $o % cellHeight;
			return Array(cellCount + 2)
				.fill(0)
				.map((_, i) => {
					const newIndex = i + start;
					const pos = baseOffset + (i - 1) * cellHeight;
					if (newIndex < 0 || newIndex >= itemCount) return undefined;
					let data;
					if ($force || !useCache) {
						data = get(newIndex);
					} else {
						data =
							($visibleData as VisibleData<any>[]).find(({ index: j }) => j === newIndex)?.data ||
							get(newIndex);
					}

					return { data, pos, index: newIndex };
				})
				.filter(Boolean);
		},
		[],
	);

	const updateOffset = (o: number) => {
		inRange = [o, $offset].sort((a, b) => a - b);
		offset.set(o, { hard: !$initialized }).catch((e) => console.log(e));
	};

	let type: string;
	$: type = vertical ? 'rows' : 'columns';
	$: gridStyle = `grid-template-${type}: repeat(${cellCount}, 1fr);`;
	$: {
		if ($dim.w && $dim.h) {
			updateOffset(($dim.h / cellCount) * index * -1);
			if (!$initialized) initialized.set(true);
		}
	}
</script>

<div class="grid" style={gridStyle} bind:clientHeight={$dim.h} bind:clientWidth={$dim.w}>
	{#each $visibleData as obj (obj.data?.[idKey] || obj.index)}
		<div style="transform: translateY({obj.pos}px)">
			<slot {...obj.data} index={obj.index} />
		</div>
	{/each}
</div>

<style>
	.grid {
		overflow: hidden;
		height: 100%;
		display: grid;
	}
	.grid > * {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		transition-property: none !important;
	}
</style>
