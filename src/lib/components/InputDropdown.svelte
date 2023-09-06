<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import clickOutsideDirective from '$utils/clickOutside';
	import Icon from '$lib/components/Icon';
	import Input from './Input.svelte';

	export let name: string;
	export let id: string;
	export let options: { [key: string]: any }[];
	export let placeholder = '';
	export let value;
	export let disabled = false;

	let isOpen = false;

	const dispatch = createEventDispatcher();

	function selectedItem(optionValue) {
		value = optionValue;
		isOpen = false;
		dispatch('select', { value });
	}
	function opener() {
		if (!disabled) {
			isOpen = !isOpen;
		}
	}
</script>

<div class="custom-select">
	<Input
		{name}
		{id}
		{placeholder}
		{disabled}
		bind:value
		style="font-weight: 300; background: var(--background-l0)"
		{...$$restProps}
	>
		<div class="opener" on:click={opener} slot="addon" on:keydown>
			<Icon name="chevronDown" />
		</div>
	</Input>
	{#if isOpen}
		<div
			class="dropdown"
			transition:slide={{ duration: 300 }}
			use:clickOutsideDirective
			on:clickOutside={() => {
				isOpen = false;
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

		.opener {
			display: flex;
			align-items: center;
			height: 100%;
			font-size: 16px;
		}
		.dropdown {
			position: absolute;
			width: 100%;
			margin-top: 1px;
			background: var(--background-l0);
			z-index: 900;
			box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%),
				0 9px 28px 8px rgb(0 0 0 / 5%);
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
		}
	}
</style>
