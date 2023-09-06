<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	import { BoostType, type Boost } from '$models/minter/nft-config';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';

	export let boosts: Boost[];
	export let removeBoost: (index: number) => void;
	export let saveBoost: (newBoost: Boost) => void;

	let newBoost: Boost;

	const save = () => {
		if (newBoost.name && newBoost.value) {
			saveBoost(newBoost);
			newBoost = undefined;
		}
	};

	const addBoost = () => {
		if (!newBoost) {
			newBoost = { name: '', value: '', type: BoostType.number };
		}
	};
</script>

{#each boosts as boost, index}
	<div class="property-container">
		<div class="row">
			<div class="input">
				<SeemlessInput bind:value={boost.name} />
			</div>
			<div class="input">
				<SeemlessInput
					bind:value={boost.value}
					type="number"
					size={boost.value.length}
					style="width:auto"
				/>{boost.type === BoostType.percentage ? '%' : ''}
			</div>
		</div>
		<div class="delete" on:click={() => removeBoost(index)} on:keydown>
			<CloseButton size="0.5rem" position="0" color="--icon-action-primary" />
		</div>
	</div>
{/each}
{#if newBoost}
	<div class="property-container">
		<div class="dropdown">
			<HoverDropdown
				bind:value={newBoost.type}
				options={[
					{ label: 'Number', value: BoostType.number },
					{ label: 'Percentage', value: BoostType.percentage },
				]}
			/>
		</div>
		<div class="row">
			<div class="input">
				<SeemlessInput
					bind:value={newBoost.name}
					placeholder="BoostName"
					boxSize="md"
					on:blur={save}
					handleKey={save}
				/>
			</div>
			<div class="input">
				<SeemlessInput
					bind:value={newBoost.value}
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
<Button buttonProps={{ type: 'button' }} type="tertiary" size="md" on:click={addBoost}>
	Add boosts
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

			.input {
				flex-basis: 45%;
				display: flex;
				align-items: center;
			}
		}

		.dropdown {
			margin-bottom: 8px;
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
