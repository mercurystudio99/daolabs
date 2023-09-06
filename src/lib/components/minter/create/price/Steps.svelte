<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	export let steps = 1;
	export let currentStep = 0;

	function handleNext() {
		currentStep += 1;
	}

	function handlePrev() {
		currentStep -= 1;
	}
</script>

{#if currentStep === 0}
	<slot />
	<slot name="step-0" />
{:else if currentStep < steps && currentStep === 1}
	<slot name="step-1" />
{:else if currentStep < steps && currentStep === 2}
	<slot name="step-2" />
{:else if currentStep < steps && currentStep === 3}
	<slot name="step-3" />
{:else if currentStep < steps && currentStep === 4}
	<slot name="step-4" />
{/if}

<div class="buttons">
	<slot name="prepend-btn" />
	{#if steps > 1 && currentStep > 0}
		<Button on:click={handlePrev}>Previous</Button>
	{:else}
		<span>&nbsp;</span>
	{/if}

	{#if currentStep < steps - 1}
		<Button on:click={handleNext}>Next</Button>
	{:else}
		<span>&nbsp;</span>
	{/if}
	<slot name="append-btn" />
</div>

<style>
	.buttons {
		margin-top: 0.5rem;
		display: flex;
		justify-content: flex-end;
	}
</style>
