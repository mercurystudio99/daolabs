<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import { shuffleArray } from '$utils/randomize';
	import Palette from './Palette.svelte';

	interface Color {
		background: string;
		text: string;
	}

	export let close;

	export let onSelect: (palette: string[]) => void;
	export let maxLength: number;

	let palettes: Color[][] = [[]];

	const getPalettes = async () => {
		const response = await fetch('/palettes/palettes.json');
		const colors = await response.json();
		palettes = colors.map((palette: string[]) =>
			palette.map((color: string) => {
				const textColor = 0xffffff - parseInt(`0x${color.slice(1)}`, 16);
				return { background: `${color}`, text: `#${textColor.toString(16).padStart(6, '0')}` };
			}),
		);
	};

	onMount(async () => {
		await getPalettes();
	});

	const addPalette = (palette: Color[]) => {
		onSelect(palette.map((color) => color.background));
		close();
	};
	const addColor = (color: Color) => {
		onSelect([color.background]);
		close();
	};

	const shufflePalettes = () => {
		palettes = shuffleArray(palettes);
	};
</script>

<div class="container">
	<h2 class="header">Trending color Palettes</h2>
	<div class="randomize">
		<Button buttonProps={{ type: 'button' }} size="md" on:click={shufflePalettes}>Randomize</Button>
	</div>
	<p>Choose default color for NFT marketplaces while image is loading.</p>
	<div class="palettes-table">
		{#each palettes as palette}
			<Palette {palette} {addPalette} {addColor} {maxLength} />
		{/each}
	</div>
</div>

<style lang="scss">
	.container {
		max-width: 648px;
		width: 75vw;

		.header {
			color: var(--text-header);
			margin-bottom: 24px;
		}
		.palettes-table {
			display: grid;
			gap: 24px;
			grid-template-columns: repeat(auto-fill, 200px);
			justify-content: center;
		}
		.randomize {
			margin-bottom: 16px;
		}
	}
</style>
