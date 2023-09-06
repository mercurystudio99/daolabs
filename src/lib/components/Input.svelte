<script lang="ts">
	import { utils } from 'ethers';
	import { onMount } from 'svelte';
	import { addressFromEns } from '$utils/web3/address';
	import { copyToClipboard } from '$utils/clipboard';
	import { getTruncatedAddress } from '$lib/utils/getTruncatedAddress';
	import Icon from '$lib/components/Icon';
	import SlideUpInfo from '$lib/components/SlideUpInfo.svelte';
	import Popover from '$lib/components/Popover.svelte';

	export let value: string | number | undefined = undefined;
	export let label: string = '';
	export let type: string = 'text';
	export let disabled = false;
	export let maxlength: number = undefined;
	export let description = '';
	export let inputRef: HTMLElement = null;
	export let styles: { [key: string]: string } = {};
	export let readonly = false;

	let addressInput = '';
	let loading = false;
	let mounted = false;

	let counter: NodeJS.Timeout;
	let count = 1;

	onMount(() => {
		if (type === 'address' && typeof value !== 'undefined') {
			addressInput = value as string;
		}
		mounted = true;
	});

	$: addressInput = value as string;

	async function update(input: string) {
		count = 1;
		if (input) {
			if (input.endsWith('.eth')) {
				clearInterval(counter);
				counter = setInterval(() => count++, 1000);
				value = '';
				loading = true;
				const address = await addressFromEns(input);
				value = address || input;
				loading = false;
				clearInterval(counter);
			} else if (utils.isAddress(input)) {
				value = input;
			} else {
				value = '';
			}
		} else {
			value = '';
		}
		return value;
	}

	$: if (type === 'address' && mounted) {
		update(addressInput).catch((e) => console.log(e));
	}
</script>

{#if label}
	<label style={styles.label} for={$$props.id}>{label}</label>
{/if}

<div class="input-wrapper">
	<div class="prefix">
		<slot name="prefix" />
	</div>
	{#if type === 'address'}
		<input
			style={styles.input}
			{...$$restProps}
			type="text"
			bind:value={addressInput}
			bind:this={inputRef}
			on:blur
			on:focus
			{disabled}
			class:hasPrefix={$$slots.prefix}
			class:hasLabel={label}
			spellcheck="false"
			on:input
			on:keydown
			{...readonly ? { readonly } : {}}
		/>
		{#if addressInput && addressInput.endsWith('.eth') && value}
			<div class="ens-right">
				{getTruncatedAddress(`${value}`)}
			</div>
		{:else if loading}
			<div class="ens-right">
				0x{Array((count % 3) + 1)
					.fill('.')
					.join('')}
			</div>
		{/if}
	{:else}
		<input
			style={styles.input}
			{...{ ...$$restProps, type }}
			{disabled}
			bind:value
			bind:this={inputRef}
			on:blur
			on:focus
			class:hasPrefix={$$slots.prefix}
			class:hasLabel={label}
			on:input
			{...typeof maxlength === 'number' ? { maxlength } : {}}
			on:keydown
			{...readonly ? { readonly } : {}}
		/>
	{/if}
	<div class="addon">
		<slot name="addon" />
		{#if readonly && !disabled}
			<Popover message="Copy" onClick={() => copyToClipboard(`${value}`)}>
				<SlideUpInfo>
					<Icon name="copy" style="color: gray; cursor: crosshair;" />
				</SlideUpInfo>
			</Popover>
		{/if}
	</div>
</div>
{#if description || maxlength}
	<div class="info" style={styles.info}>
		{#if description}
			{description}
		{/if}
		{#if maxlength}
			<span class="max-length">{`${(value || '').toString().length} / ${maxlength}`}</span>
		{/if}
	</div>
{/if}

<style>
	input {
		width: 100%;
		background: transparent;
		border: 1px solid var(--stroke-secondary);
		border-radius: var(--radius-md);
		transition: border-color 120ms ease-out;
		padding: 4px 11px;
		line-height: 1.5715;
		font-weight: 300;
	}

	input:disabled {
		border: 1px solid var(--stroke-tertiary);
		cursor: not-allowed;
		color: var(--text-disabled);
	}

	input::placeholder {
		color: var(--text-tertiary);
		font-weight: 300;
	}

	input:not(:disabled):focus {
		border: var(--accent) 1px solid;
		outline: none;
	}

	input:not(:disabled):hover {
		border: var(--accent) 1px solid;
	}

	input[readonly] {
		background: var(--background-l1);
		color: var(--text-secondary);
		border: 1px solid var(--stroke-tertiary);
		cursor: crosshair;
	}
	input:-webkit-autofill,
	input:-webkit-autofill:hover,
	input:-webkit-autofill:focus,
	input:-webkit-autofill:active {
		transition: background-color 5000s ease-in-out 0s;
		-webkit-text-fill-color: var(--text-primary) !important;
	}

	.input-wrapper {
		position: relative;
	}

	.addon {
		position: absolute;
		top: 5px;
		right: 10px;
		height: 20px;
	}

	.prefix {
		position: absolute;
		top: 5px;
		left: 10px;
	}

	.hasPrefix {
		text-indent: 15px;
	}

	.hasLabel {
		margin-top: 8px;
		margin-bottom: 16px;
	}
	.ens-right {
		position: absolute;
		top: 50%;
		right: 5px;
		transform: translateY(-50%);
		padding: 1px 2px;
		background: var(--background-l0);
	}

	.info {
		display: flex;
		gap: 16px;
		color: var(--text-secondary);
		font-weight: 300;
		font-size: 14px;
		margin-top: 2px;
	}

	.max-length {
		margin-left: auto;
		min-width: fit-content;
	}
</style>
