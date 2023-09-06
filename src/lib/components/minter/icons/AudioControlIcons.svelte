<script lang="ts">
	export let width = '24';
	export let height = '24';
	export let iconName:
		| 'repeat'
		| 'previous'
		| 'pause'
		| 'play'
		| 'mix'
		| 'next'
		| 'volumeMax'
		| 'volumeMin';

	const pathsByName = {
		repeat: [
			'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3',
			'M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3',
		],
		previous: ['M21 5v14l-8 -7z', 'M10 5v14l-8 -7z'],
		pause: [
			'M6.70874 5.31055V19.7105H9.70874V5.31055H6.70874ZM12.5983 5.31055V19.7105H15.5983V5.31055H12.5983Z',
		],
		mix: [
			'M18 4l3 3l-3 3',
			'M18 20l3 -3l-3 -3',
			'M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5',
			'M21 7h-5a4.978 4.978 0 0 0 -2.998 .998m-4.002 8.003a4.984 4.984 0 0 1 -3 .999h-3',
		],
		next: ['M3 5v14l8 -7z', 'M14 5v14l8 -7z'],
		volumeMax: [
			'M15 8a5 5 0 0 1 0 8',
			'M17.7 5a9 9 0 0 1 0 14',
			'M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a0.8 .8 0 0 1 1.5 .5v14a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5',
		],
		volumeMin: [
			'M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a0.8 .8 0 0 1 1.5 .5v14a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5',
			'M16 10l4 4m0 -4l-4 4',
		],
		play: ['M7 4v16l13 -8z'],
	};
	let paths = pathsByName[iconName];
</script>

<svg
	{width}
	{height}
	viewBox={`0 0 ${width} ${height}`}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	stroke-width="2"
	stroke="currentColor"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#if iconName === 'pause'}
		<rect x="6" y="5" width="4" height="14" rx="1" />
		<rect x="14" y="5" width="4" height="14" rx="1" />
	{:else}
		{#each paths as path}
			<path d={path} />
		{/each}
	{/if}
</svg>
