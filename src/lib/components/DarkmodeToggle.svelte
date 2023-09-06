<script lang="ts">
	import Icon from '$lib/components/Icon';
	import { darkMode, theme } from '$stores';
	import { toggleTheme, setTheme } from '$lib/utils/darkmodeToggleUtils';
	import Popover from './Popover.svelte';

	let colors = [
		'#FF4500',
		'#1E90FF',
		'#FFD700',
		'#7FFF00',
		'#FF69B4',
		'#8A2BE2',
		'#20B2AA',
		'#DC143C',
	];
</script>

<div role="switch" aria-checked={$darkMode} on:click={toggleTheme} on:keydown>
	<div class:active={!$darkMode}>
		<Icon name="sun" />
	</div>
	<div class:active={$darkMode}>
		<Icon name="moon" />
	</div>
	<div id="paintBrush" class:active={$theme} on:keydown>
		<Popover>
			<Icon name="paintBrush" />
			<div slot="content">
				{#each colors as color (color)}
					<div
						class="color"
						style={`background-color: ${color}`}
						on:click={() => setTheme(color)}
						on:keydown
					/>
				{/each}
			</div>
		</Popover>
	</div>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
	}
	div[role='switch'] {
		border: 1px solid var(--accent);
		transition: border-color 0.12s ease-out;
		width: 90px;
		height: 30px;
		border-radius: 15px;
		cursor: pointer;
		color: var(--icon-tertiary);
	}
	div[role='switch']:hover {
		border-color: var(--stroke-secondary);
	}
	div[slot='content'] {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		max-width: 150px;
	}

	.active {
		color: var(--icon-primary);
	}

	.color {
		width: 25px;
		height: 25px;
		border-radius: var(--radius-md);
		margin: 5px;
		cursor: pointer;
	}

	#paintBrush {
		line-height: 0.5;
	}
</style>
