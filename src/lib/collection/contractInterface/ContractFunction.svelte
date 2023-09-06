<script lang="ts">
	import { fade } from 'svelte/transition';
	import FormField from '$lib/components/FormField.svelte';
	import Codemirror from '$lib/components/minter/script-editor/Codemirror.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { AbiType } from './types';

	export let func: AbiType;
	export let showJson: boolean;
	export let callContract: ({ name, args }: { name: string; args: any[] }) => Promise<unknown>;
	let values: any[] = func.inputs.map(() => null);
	let readResult = null;

	async function interact() {
		const result = await callContract({ name: func.name, args: values });
		if (func.stateMutability === 'view') {
			readResult = result;
		}
	}

	function getLabel(input: AbiType['inputs'][0]) {
		if (input.name) {
			return `${input.name} (${input.type})`;
		}
		return input.type;
	}
</script>

<div class="function-container">
	{#if showJson}
		<div in:fade>
			<Codemirror value={JSON.stringify(func, null, 2)} readOnly language="json" />
		</div>
	{/if}
	{#each func.inputs as input, index}
		<FormField
			bind:value={values[index]}
			field={{
				id: input.name,
				label: getLabel(input),
				placeholder: `Enter ${input.type}`,
				type: 'input',
				props: {
					type: input.type === 'address' || input.type === 'string' ? 'text' : 'number',
				},
			}}
		/>
	{/each}
	<div class="footer">
		<Button size="md" on:click={interact}
			>{func.stateMutability !== 'view' ? 'Write' : 'Read'}</Button
		>
	</div>
	{#if readResult}
		<div class="read-result">
			{readResult}
		</div>
	{/if}
</div>

<style>
	.footer {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}
	.function-container {
		margin: 0.5rem 2rem 1rem 2rem;
	}
	.read-result {
		margin-top: 1rem;
		word-break: break-all;
		padding: 0.5rem;
		background: var(--background-l1);
	}
</style>
