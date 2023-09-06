<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import type { Attribute } from '$models/minter/nft-config';

	export let properties: Attribute[];
	export let removeProperty: (index: number) => void;
	export let saveProperty: (newProperty: Attribute) => void;
	export let isDuplicatedProperty = false;

	let newProperty: Attribute;
	let duplicates: string[] = [];
	let isNewDuplicate = false;

	const udpateDuplicates = () => {
		duplicates = properties
			.filter((item, index: number) => properties.findIndex((el) => el.name == item.name) !== index)
			.map(({ name }) => name);
		isDuplicatedProperty = duplicates.length > 0;
	};

	const save = () => {
		if (newProperty.name && newProperty.value) {
			if (properties.find((attr) => attr.name === newProperty.name)) {
				isNewDuplicate = true;
			} else {
				isNewDuplicate = false;
				saveProperty(newProperty);
				newProperty = undefined;
			}
		}
	};

	const remove = (index: number) => {
		removeProperty(index);
		udpateDuplicates();
	};

	const addProperty = () => {
		if (!newProperty) {
			newProperty = { name: '', value: '' };
		}
	};
</script>

{#each properties as property, index}
	<div class="property-container">
		<div class="row">
			<span>Attribute:</span>
			<div class="input">
				<SeemlessInput
					bind:value={property.name}
					on:blur={udpateDuplicates}
					handleKey={udpateDuplicates}
				/>
			</div>
		</div>
		<div class="row">
			<span>Property:</span>
			<div class="input">
				<SeemlessInput bind:value={property.value} />
			</div>
		</div>
		<div class="delete" on:click={() => remove(index)} on:keydown>
			<CloseButton size="0.5rem" position="0" color="--icon-action-primary" />
		</div>

		{#if duplicates.includes(property.name)}
			<span class="info">Such property already exists</span>
		{/if}
	</div>
{/each}
{#if newProperty}
	<div class="property-container">
		<div class="row">
			<span>Attribute:</span>
			<div class="input">
				<SeemlessInput
					bind:value={newProperty.name}
					placeholder="Attribute"
					boxSize="md"
					on:blur={save}
					handleKey={save}
				/>
			</div>
		</div>
		<div class="row">
			<span>Property:</span>
			<div class="input">
				<SeemlessInput
					bind:value={newProperty.value}
					placeholder="Property"
					boxSize="md"
					on:blur={save}
					handleKey={save}
				/>
			</div>
		</div>
		{#if isNewDuplicate}
			<span class="info">Such property already exists</span>
		{/if}
	</div>
{/if}
<Button buttonProps={{ type: 'button' }} type="tertiary" size="md" on:click={addProperty}>
	Add properties
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

			.input {
				flex-basis: 60%;
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
		.info {
			color: var(--text-secondary);
			font-weight: 300;
			font-size: 14px;
		}
	}
</style>
