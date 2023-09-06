<script lang="ts">
	import SeemlessInput from './SeemlessInput.svelte';

	export let value;
	export let placeholder = '';
	export let boxSize = '';
	export let handleKey = () => {};

	let isInput = false;

	const handleClick = () => {
		isInput = true;
	};
</script>

{#if isInput}
	<SeemlessInput
		bind:value
		{placeholder}
		{boxSize}
		{handleKey}
		on:blur={() => (isInput = false)}
		focusOnMount
		{...$$restProps}
	/>
{:else}
	<div class="content" on:click={handleClick} on:keydown>
		<slot />
	</div>
{/if}
