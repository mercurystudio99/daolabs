<script lang="ts">
	import Dropdown from '$lib/components/Dropdown.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Input from '$lib/components/Input.svelte';
	import FormError from './FormError.svelte';
	import type { DropdownOption } from '$lib/components/Dropdown';

	export let label = '';
	export let info: string = '';
	export let id: string;
	export let description: string = '';
	export let classes = 'margin';
	export let disabled = false;
	export let options: DropdownOption[];
	export let value: string = '';
	export let readonly = false;
	export let required = false;
	export let error = '';
	export let placeholder = '';
	export let changeFn = () => {};
</script>

<div class={`input-item ${classes}`}>
	{#if label}
		<label for={id}>
			{label}<small>{required ? '*' : ''}</small>
			{#if info}
				<PopInfo message={info} placement="bottom" />
			{/if}
		</label>
	{/if}
	{#if readonly}
		<Input {readonly} {value} />
	{:else}
		<div class="dropdown">
			<Dropdown {options} bind:value {disabled} {placeholder} on:select={changeFn} {id} />
		</div>
	{/if}
	{#if description}
		<p class="description">{description}</p>
	{/if}
	<FormError {error} />
	<slot />
</div>

<style lang="scss">
	.input-item {
		&.margin {
			margin-bottom: 16px;
		}

		label {
			color: var(--text-header);
			font-size: 14px;
			font-weight: 500;
			margin-bottom: 7px;
			display: flex;
			small {
				align-self: flex-start;
			}
		}

		.description {
			font-size: 14px;
			color: var(--text-secondary);
			margin-top: 6px;
			margin-bottom: 5px;
		}

		.dropdown {
			background-color: var(--background-l0);
		}
	}
</style>
