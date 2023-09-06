<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import Input from './Input.svelte';
	import PopInfo from './PopInfo.svelte';
	import Textarea from './Textarea.svelte';

	const dispatch = createEventDispatcher();

	export let field: FormField;
	export let styles: {
		[key: string]: string;
	} = {};
	export let value: any = '';
	export let setInvalid: (invalid: boolean) => void = () => {};
	export let popInfoMessage = '';
	export let labelHeaderColored = false;
	let invalid = false;

	let inputRef: HTMLInputElement;

	interface FormField {
		id: string;
		label?: string;
		placeholder?: string;
		description?: string;
		prefix?: string;
		labelProps?: any;
		options?: any;
		useMask?: boolean;
		maskOptions?: {
			mask?: string;
			lazy?: boolean;
		};
		addon?: string;
		type?: string;
		props?: {
			type?: string;
			required?: boolean;
			maxlength?: number;
			rows?: number;
			pattern?: string;
		};
	}

	function checkValidity() {
		const isInvalid = !inputRef?.checkValidity();
		if (setInvalid) {
			setInvalid(isInvalid);
		}
		return isInvalid;
	}

	function handleBlur() {
		if (inputRef && checkValidity()) {
			dispatch('valid', { value: false });
			invalid = true;
		} else if (inputRef) {
			dispatch('valid', { value: true });
			invalid = false;
		}
	}

	function handleFocus() {
		invalid = false;
	}
</script>

{#if field.label}
	{#if popInfoMessage}
		<span style={labelHeaderColored ? 'color: var(--text-header);' : ''}>
			<PopInfo message={popInfoMessage}>
				<label
					for={field.id}
					style={styles.label}
					class:label-with-popinfo={!!popInfoMessage}
					class:label-header={labelHeaderColored}
				>
					{#if field.props?.required && field.label}*{/if}
					{field.label}
				</label>
			</PopInfo>
		</span>
	{:else}
		<label for={field.id} style={styles.label}>
			{#if field.props?.required && field.label}*{/if}
			{field.label}
		</label>
	{/if}
{/if}
{#if field.type === 'input' || field.type === 'address' || !field.type}
	<div class="input">
		{#if field.prefix && field.addon}
			<Input
				id={field.id}
				placeholder={field.placeholder}
				bind:value
				{...field.props}
				{styles}
				type={field.type === 'address' ? 'address' : field.props?.type || 'text'}
				description={field.description}
				on:blur={handleBlur}
				on:focus={handleFocus}
				on:click={handleFocus}
				on:input
				bind:inputRef
			>
				<p slot="prefix">{field.prefix || ''}</p>
				<p slot="addon">{field.addon || ''}</p>
			</Input>
		{:else if field.prefix}
			<Input
				id={field.id}
				placeholder={field.placeholder}
				bind:value
				{...field.props}
				{styles}
				type={field.type === 'address' ? 'address' : field.props?.type || 'text'}
				description={field.description}
				on:blur={handleBlur}
				on:focus={handleFocus}
				on:click={handleFocus}
				on:input
				bind:inputRef
			>
				<p slot="prefix">{field.prefix || ''}</p>
			</Input>
		{:else if field.addon}
			<Input
				id={field.id}
				placeholder={field.placeholder}
				bind:value
				{...field.props}
				{styles}
				type={field.type === 'address' ? 'address' : field.props?.type || 'text'}
				description={field.description}
				on:blur={handleBlur}
				on:focus={handleFocus}
				on:click={handleFocus}
				on:input
				bind:inputRef
			>
				<p slot="addon">{field.addon || ''}</p>
			</Input>
		{:else if field.useMask}
			<Input
				id={field.id}
				placeholder={field.placeholder}
				on:change
				bind:value
				{...field.props}
				{styles}
				maskOptions={field.maskOptions}
			/>
		{:else}
			<Input
				id={field.id}
				placeholder={field.placeholder}
				bind:value
				{...field.props}
				{styles}
				type={field.type === 'address' ? 'address' : field.props?.type || 'text'}
				description={field.description}
				on:blur={handleBlur}
				on:focus={handleFocus}
				on:click={handleFocus}
				on:input
				bind:inputRef
			/>
		{/if}

		{#if invalid}
			<span class="is-required-msg">{inputRef.validationMessage}</span>
		{/if}
	</div>
{:else if field.type === 'textarea'}
	<Textarea
		id={field.id}
		placeholder={field.placeholder}
		bind:value
		{...field.props}
		description={field.description}
	/>
{/if}

<style>
	label {
		display: block;
		margin: 12px 0px 8px;
	}
	label.label-with-popinfo {
		margin-bottom: 3px;
	}
	label.label-header {
		color: var(--text-header);
	}
	.is-required-msg {
		font-size: 0.9rem;
		color: var(--text-failure);
	}

	.input {
		width: 100%;
	}
</style>
