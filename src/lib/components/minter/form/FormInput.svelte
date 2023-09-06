<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import InputDropdown from '$lib/components/InputDropdown.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import FormError from './FormError.svelte';

	export let label = '';
	export let info: string = '';
	export let id: string;
	export let name: string = '';
	export let placeholder: string = '';
	export let value: string | number | undefined = '';
	export let description: string = '';
	export let classes = 'margin';
	export let disabled = false;
	export let required = false;
	export let error = '';
	export let dropdownOptions: { label: string; value: string }[] = [];
	export let type: string = 'text';
	export let maxlength: number = undefined;
	export let readonly = false;
	export let percentInput = false;
</script>

<div class={`input-item ${classes}`} id={`${id}-wrap`}>
	{#if label}
		<label for={id}>
			{label}<small>{required ? '*' : ''}</small>
			{#if info}
				<PopInfo message={info} placement="bottom" />
			{/if}
		</label>
	{/if}
	{#if dropdownOptions.length > 0}
		<InputDropdown
			{name}
			{id}
			{placeholder}
			{disabled}
			options={dropdownOptions}
			bind:value
			on:select
			on:blur
			{...$$restProps}
			{type}
			on:input
		/>
	{:else}
		<Input
			{name}
			{id}
			{placeholder}
			{disabled}
			{type}
			{readonly}
			bind:value
			on:blur
			style={!readonly && 'font-weight: 300; background: var(--background-l0)'}
			{maxlength}
			{description}
			{...$$restProps}
			on:input
		>
			<div class="percent-addon" slot="addon">
				{#if percentInput}
					%
				{/if}
			</div>
		</Input>
	{/if}
	<FormError {error} />
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
			margin-bottom: 6px;
			display: flex;

			small {
				align-self: flex-start;
			}
		}
		.percent-addon {
			position: absolute;
			font-weight: 300;
			right: 0px;
		}
	}
</style>
