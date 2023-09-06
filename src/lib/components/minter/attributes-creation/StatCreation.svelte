<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import type { NumericAttribute } from '$models/minter/nft-config';

	export let stats;
	export let removeStat: (index: number) => void;
	export let saveStat: (newStat: NumericAttribute) => void;

	let newStat: NumericAttribute;
	let defaultMax: string;

	const save = () => {
		if (newStat.name && newStat.value) {
			if (!newStat.max) {
				if (defaultMax) {
					newStat.max = defaultMax;
				} else {
					return;
				}
			}
			saveStat(newStat);
			defaultMax = newStat.max;
			newStat = undefined;
		}
	};

	const addStat = () => {
		if (!newStat) {
			newStat = { name: '', value: '', max: '' };
		}
	};
</script>

{#each stats as stat, index}
	<div class="property-container">
		<div class="row">
			<div class="name-input">
				<SeemlessInput bind:value={stat.name} />
			</div>
			<div class="range-input completed">
				<SeemlessInput bind:value={stat.value} type="number" size={stat.value.length} />
				<span>of</span>
				<SeemlessInput bind:value={stat.max} type="number" size={stat.max.length} />
			</div>
		</div>
		<div class="delete" on:click={() => removeStat(index)} on:keydown>
			<CloseButton size="0.5rem" position="0" color="--icon-action-primary" />
		</div>
	</div>
{/each}
{#if newStat}
	<div class="property-container">
		<div class="row">
			<div class="name-input">
				<SeemlessInput
					bind:value={newStat.name}
					placeholder="StatName"
					boxSize="md"
					on:blur={save}
					handleKey={save}
				/>
			</div>
			<div class="range-input">
				<SeemlessInput
					bind:value={newStat.value}
					type="number"
					placeholder="0"
					boxSize="md"
					on:blur={save}
					handleKey={save}
					style="text-align: center"
				/>
				<span>of</span>
				<SeemlessInput
					bind:value={newStat.max}
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
<Button buttonProps={{ type: 'button' }} type="tertiary" size="md" on:click={addStat}>
	Add stats
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
