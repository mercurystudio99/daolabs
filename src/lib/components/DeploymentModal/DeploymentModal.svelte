<script lang="ts">
	import { onMount } from 'svelte';
	import { readNetwork } from '$stores/web3';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import Timeline from '$lib/components/Timeline';
	import Tick from '$lib/components/Tick.svelte';
	import type { ActionMap } from './types';

	export let close = () => {};

	export let actions: ActionMap = {};
	export let steps = [
		{ label: 'Compiling contract', time: '2 minutes' },
		{
			label: 'Awaiting signature',
			description: 'Open MetaMask and sign the transaction',
			descriptionIcon: 'metamask',
			time: '2 minutes',
		},
		{
			label: 'Deploying contract',
			description: 'Waiting for deployment to be minted',
			descriptionIcon: 'metamask',
			time: '2 minutes',
		},
		{
			label: 'Verifying contract',
			description: 'Make sourcecode public on Etherscan',
			descriptionIcon: 'etherscan',
			time: '2 minutes',
		},
	];

	let activeStep = 0;
	let errored = false;

	async function mockAction() {
		return new Promise<void>((resolve) => {
			const timeoutId = setTimeout(() => {
				clearTimeout(timeoutId);
				resolve();
			}, 2000);
		});
	}

	async function deploy() {
		for (let i = 0; i < steps.length; i++) {
			activeStep = i;
			if (!actions[activeStep]) {
				await mockAction();
			} else {
				// TODO handle rejected promise
				try {
					await actions[activeStep]();
				} catch (e) {
					console.error(e);
					errored = true;
					return;
				}
			}
		}
		activeStep = steps.length;
	}

	onMount(deploy);
</script>

<h1>Deploying on {$readNetwork.alias}</h1>
<Timeline {steps} activeIndex={activeStep} {errored} let:step let:current let:done>
	<h2>{step.label}</h2>
	{#if step.description}
		<p>{step.description} <Icon name={step.descriptionIcon} /></p>
	{/if}
	{#if step.time}
		<p>Estimated {step.time} <Icon name="stopwatch" /></p>
	{/if}
	{#if current <= activeStep}
		{#if !errored}
			{done ? 'Done in ' : 'Elapsed '} <Tick {done} />s
		{:else if errored && !done}
			<p class="failed">Failed</p>
		{/if}
	{/if}
</Timeline>
{#if activeStep === steps.length}
	<Button fullWidth type="primary" size="sm" on:click={close}>Done</Button>
{/if}

<style>
	h1 {
		color: var(--text-header);
	}

	h2 {
		color: var(--header-color);
		text-transform: uppercase;
		margin-bottom: 0;
	}

	p {
		font-weight: 300;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.failed {
		color: var(--text-failure);
	}
</style>
