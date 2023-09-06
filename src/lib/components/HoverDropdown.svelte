<script lang="ts">
	import { slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import clickOutsideDirective from '$utils/clickOutside';
	import Icon from '$lib/components/Icon';

	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let options: { [key: string]: any }[];
	export let value = undefined;
	export let placeholder = '';
	export let initial = undefined;
	export let review: boolean = false;

	if (!placeholder) {
		value = initial || options[0].value;
	}

	const dispatch = createEventDispatcher();

	let visibility = 'hidden';
	$: style = `--visibility: ${visibility};`;
	function selectedItem(optionValue) {
		value = optionValue;
		visibility = 'hidden';
		dispatch('select', { value });
	}

	$: selectedOption = options.find((option) => option.value === value);
</script>

<div
	class="custom-select"
	class:review
	{...$$props}
	on:mouseenter={() => (visibility = 'visible')}
	on:mouseleave={() => (visibility = 'hidden')}
>
	<div class={`select-selected ${size}`} on:click={() => (visibility = 'visible')} on:keydown>
		{selectedOption?.label || placeholder}
		{#if !review}
			<Icon name="chevronDown" />
		{/if}
	</div>
	{#if !review}
		<div
			class="dropdown"
			transition:slide={{ duration: 300 }}
			{style}
			use:clickOutsideDirective
			on:clickOutside={() => {
				visibility = 'hidden';
			}}
		>
			{#each options as option}
				<div
					class="select-item"
					class:active={option.value === value}
					on:click={() => selectedItem(option.value)}
					on:keydown
				>
					{option.label}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.custom-select {
		width: 100%;
		position: relative;
		border-radius: 2px;
		border: 1px solid transparent;

		&:hover {
			border: 1px solid var(--stroke-primary);
		}
		.dropdown {
			visibility: var(--visibility);
			position: absolute;
			width: auto;
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
			color: var(--text-primary);
			font-weight: 300 !important;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: space-between;

			&.sm {
				padding: 1px 12px;
			}
			&.md {
				padding: 4px 12px;
			}
		}
	}

	.review {
		cursor: default;

		&:hover {
			border: 1px solid transparent;
		}
	}
</style>
