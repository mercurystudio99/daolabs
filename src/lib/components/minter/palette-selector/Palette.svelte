<script lang="ts">
	import { HeartIcon, PlusCircleIcon } from 'svelte-feather-icons';

	interface Color {
		background: string;
		text: string;
	}

	export let maxLength: number;

	export let palette: Color[] = [];

	export let addPalette: (palette: Color[]) => void;
	export let addColor: (color: Color) => void;
</script>

<div class="palette">
	<div class="colors" class:palette-mode={maxLength > 1} class:color-mode={maxLength === 1}>
		{#each palette as color}
			<div class="color" style={`background-color: ${color.background}; color: ${color.text}`}>
				<span>{color.background.slice(1)}</span>
				<div class="add-color-button" on:click={() => addColor(color)} on:keydown>
					<PlusCircleIcon size="1.6x" />
					Add
				</div>
			</div>
		{/each}
		<div class="add-button-container">
			<div class="add-palette-button" on:click={() => addPalette(palette)} on:keydown>
				<PlusCircleIcon size="1.6x" />
				Add the whole palette
			</div>
		</div>
	</div>
	<!-- TODO: enable after color fetch update with likes -->
	{#if false}
		<div class="likes">
			<HeartIcon size="1.2x" />
			26.2k
		</div>
	{/if}
</div>

<style lang="scss">
	.palette {
		display: flex;
		flex-direction: column;
		.colors {
			display: flex;
			width: 200px;
			height: 48px;
			overflow: hidden;
			position: relative;

			.add-button-container {
				position: absolute;
				visibility: hidden;
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: flex-end;
				.add-palette-button {
					font-size: 10px;
					line-height: 16px;
					color: var(--text-tertiary);
					display: flex;
					align-items: center;
					gap: 4px;
					cursor: pointer;
					margin-bottom: 4px;
				}
			}

			.color {
				height: 100%;
				flex-grow: 1;
				display: flex;
				align-items: center;
				position: relative;

				.add-color-button {
					position: absolute;
					bottom: 2px;
					left: 40%;
					visibility: hidden;
					font-size: 10px;
					line-height: 16px;
					display: flex;
					align-items: center;
					gap: 4px;
					cursor: pointer;
				}

				span {
					width: 100%;
					display: none;
					font-size: 10px;
				}
			}
		}
		.palette-mode {
			&:hover {
				.add-palette-button {
					visibility: visible;
				}
			}
		}
		.color-mode {
			.color {
				&:hover {
					flex-grow: 2;
					color: black;
					cursor: pointer;
					span {
						display: flex;
						justify-content: center;
					}
					.add-color-button {
						visibility: visible;
					}
				}
			}
		}
		.likes {
			align-self: flex-end;
			padding: 4px 0;
			display: flex;
			align-items: center;
			gap: 8px;
			color: var(--text-secondary);
		}
	}
</style>
