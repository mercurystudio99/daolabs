<script lang="ts">
	import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import Input from '$lib/components/Input.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import PaletteSelector from '../palette-selector/PaletteSelector.svelte';

	export let colors: string[] = [];
	export let maxLength: number = 1;
	export let info: string = null;
	let colorString: string = colors.length > 0 ? colors.join(',') : '';
	let mode: 'input' | 'palette';
	let showPaletteModal = false;

	function parseColorString() {
		colors = colorString ? colorString.split(',').slice(0, maxLength) : [];
		mode = null;
	}

	function onPaletteSelect(palette: string[]) {
		colors = palette;
		colorString = palette.join(',');
	}

	function handleSelect({ detail }) {
		mode = detail.value;
		if (detail.value === 'palette') {
			showPaletteModal = true;
		}
	}

	const plural = maxLength > 1 ? 's' : '';
</script>

<h3 class="title">
	<PopInfo message="Choose the color displayed while loading your collection on marketplaces.">
		Default color{plural}
	</PopInfo>
</h3>
{#if info}
	<InfoBox classes="smMargin" {info} />
{/if}
<div class="container">
	<div class="dropdown">
		<HoverDropdown
			options={[
				{ label: `Enter value${plural} in HEX`, value: 'input' },
				{ label: `Pick a ${maxLength === 1 ? 'color' : 'pallette'}`, value: 'palette' },
			]}
			on:select={handleSelect}
		/>
	</div>
	{#if mode === 'input'}
		<div class="input">
			<Input bind:value={colorString} on:blur={parseColorString} style="font-weight: 300" />
		</div>
	{/if}
	{#if mode !== 'input' && colors.length > 0}
		<div class="colors-container">
			{#each colors as color}
				<div class="color-box" style={`background-color: ${color}`} />
			{/each}
		</div>
	{/if}
</div>
<Modal
	on:close={() => {
		showPaletteModal = false;
	}}
	show={showPaletteModal &&
		bind(PaletteSelector, { onSelect: onPaletteSelect, maxLength, close: () => {} })}
/>

<style lang="scss">
	.title {
		font-weight: 500;
		font-size: 14px;
		line-height: 16px;
		color: var(--text-header);
	}

	.container {
		display: flex;
		width: 100%;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
		.dropdown {
			flex-basis: 40%;
		}
		.input {
			flex-grow: 1;
		}
		.colors-container {
			flex-grow: 1;
			display: flex;
			.color-box {
				flex-grow: 1;
				max-width: 64px;
				height: 32px;
			}
		}
	}
</style>
