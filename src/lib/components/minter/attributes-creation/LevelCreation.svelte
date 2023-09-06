<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import type { NumericAttribute } from '$models/minter/nft-config';

	export let levels;
	export let removeLevel: (index: number) => void;
	export let saveLevel: (newLevel: NumericAttribute) => void;

	let newLevel: NumericAttribute;

	const save = () => {
		if (newLevel.name && newLevel.value && newLevel.max) {
			saveLevel(newLevel);
			newLevel = undefined;
		}
	};

	const addLevel = () => {
		if (!newLevel) {
			newLevel = { name: '', value: '', max: '' };
		}
	};
</script>

{#each levels as level, index}
	<div class="property-container">
		<div class="row">
			<div class="name-input">
				<SeemlessInput bind:value={level.name} />
			</div>
			<div class="range-input completed">
				<SeemlessInput bind:value={level.value} type="number" size={level.value.length || 1} />
				<span>of</span>
				<SeemlessInput bind:value={level.max} type="number" size={level.max.length || 1} />
			</div>
		</div>
		<div class="delete" on:click={() => removeLevel(index)} on:keydown>
			<CloseButton size="0.5rem" position="0" color="--icon-action-primary" />
		</div>
	</div>
{/each}
{#if newLevel}
	<div class="property-container">
		<div class="row">
			<div class="name-input">
				<SeemlessInput
					bind:value={newLevel.name}
					placeholder="LevelName"
					boxSize="md"
					on:blur={save}
					handleKey={save}
				/>
			</div>
			<div class="range-input">
				<SeemlessInput
					bind:value={newLevel.value}
					type="number"
					placeholder="0"
					boxSize="md"
					on:blur={save}
					handleKey={save}
					style="text-align: center"
				/>
				<span>of</span>
				<SeemlessInput
					bind:value={newLevel.max}
					type="number"
					placeholder="0"
					boxSize="md"
					on:blur={save}
					handleKey={save}
					style="text-align: center"
				/>
			</div>
		</div>
	</div>
{/if}
<Button buttonProps={{ type: 'button' }} type="tertiary" size="md" on:click={addLevel}>
	Add levels
</Button>

<style lang="scss">
	.property-container {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 8px 16px;
		border: 0.4px solid var(--stroke-tertiary);
		margin-bottom: 16px;

		.row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 4px;

			&:last-child {
				margin-bottom: 0;
			}

			span {
				font-weight: 500;
				margin-right: 10px;
			}

			.name-input {
				flex-basis: 50%;
			}

			.range-input {
				flex-basis: 50%;
				display: flex;
				align-items: center;
				margin-left: 16px;

				span {
					color: var(--text-tertiary);
					margin: 0 16px;
				}

				&.completed {
					span {
						color: var(--text-primary);
					}
				}
			}
		}

		&:hover {
			.delete {
				visibility: visible;
			}
		}

		.delete {
			color: var(--text-action-primary);
			visibility: hidden;
			position: absolute;
			top: 8px;
			right: 8px;
		}
	}
</style>
