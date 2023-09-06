<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import clickOutsideDirective from '$utils/clickOutside';
	import Icon from './Icon';
	import type { DropdownOption } from './Dropdown';

	export let options: DropdownOption[];
	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
	export let placeholder = '';
	export let initial: DropdownOption['value'] | undefined = undefined;
	export let value: DropdownOption['value'];
	export let defaultFirst = false;
	export let disabled = false;
	export let maxHeight = 'auto';
	export let id = 'dropdown';

	let isOpen = false;
	let keyboardSelected = -1;
	let selectedOption: DropdownOption;

	const dispatch = createEventDispatcher();

	function selectedItem(optionValue: DropdownOption['value']) {
		value = optionValue;
		isOpen = false;
		dispatch('select', { value });
	}
	function opener() {
		if (!disabled) {
			isOpen = !isOpen;
			keyboardSelected = -1;
		}
	}

	if (!placeholder) {
		value = initial || options[0].value;
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			if (isOpen && keyboardSelected >= 0) {
				selectedItem(options[keyboardSelected].value);
			} else {
				opener();
			}
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (keyboardSelected < options.length - 1) {
				keyboardSelected += 1;
			}
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (keyboardSelected > 0) {
				keyboardSelected -= 1;
			}
		}
	};

	$: selectedOption =
		options.find((option) => option.value === value) || (defaultFirst && options[0]);
</script>

<div class="custom-select" {id}>
	<div
		class={`select-selected ${size}`}
		class:disabled
		on:click={opener}
		on:keydown={handleKeydown}
	>
		{#if selectedOption?.icon}
			<Icon
				name={selectedOption.icon}
				{...selectedOption.iconProps ? selectedOption.iconProps : {}}
			/>
		{/if}
		{selectedOption?.label || placeholder}
	</div>
	<!-- NOTE: onclickOutside will not show a warning when eslint config is fixed for .svelte files to see app.d.ts -->
	{#if isOpen}
		<div
			class="dropdown"
			style={`max-height: ${maxHeight};`}
			transition:slide={{ duration: 300 }}
			use:clickOutsideDirective
			on:clickOutside={() => {
				isOpen = false;
			}}
		>
			{#each options as option, index}
				<div
					class="select-item"
					class:active={option.value === value}
					class:selected={index === keyboardSelected}
					on:click={() => selectedItem(option.value)}
					on:keydown
				>
					{option.label}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.custom-select {
		width: 100%;
		position: relative;
		border: 1px solid var(--stroke-secondary);
		border-radius: 2px;
	}

	.custom-select:hover {
		border-color: var(--stroke-primary);
	}

	.dropdown {
		position: absolute;
		overflow: auto;
		width: 100%;
		margin-top: 1px;
		background: var(--background-l0);
		z-index: 900;
		box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%),
			0 9px 28px 8px rgb(0 0 0 / 5%);
	}

	.select-item {
		padding: 6px 12px;
		cursor: pointer;
	}

	.active {
		font-weight: 600;
	}
	.active,
	.select-item:hover {
		background: var(--background-l2);
	}

	.select-selected {
		background-color: transparent;
	}

	.select-selected {
		color: var(--text-secondary);
		font-weight: 400 !important;
		cursor: pointer;
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.disabled {
		background-color: var(--background-disabled);
		color: var(--text-disabled);
	}
	.select-selected.xs {
		padding: 3px 12px;
		font-size: 11px;
	}

	.select-selected.sm {
		padding: 3px 12px;
	}

	.select-selected.md {
		padding: 4px 12px;
	}

	/* Style the arrow inside the select element: */
	.select-selected:after {
		position: absolute;
		content: '';
		width: 0;
		height: 0;
		border: 6px solid transparent;
		border-color: var(--text-primary) transparent transparent transparent;
		right: 10px;
	}
	.select-selected.disabled::after {
		border-color: var(--text-disabled) transparent transparent transparent;
	}

	.select-selected.xs:after {
		top: 8px;
	}

	.select-selected.sm:after {
		top: 11px;
	}

	.select-selected.md:after {
		top: 14px;
	}

	.selected {
		background: var(--background-l2);
	}
</style>
