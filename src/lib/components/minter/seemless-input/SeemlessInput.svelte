<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let value;
	export let placeholder = '';
	export let boxSize = '';
	export let handleKey = () => {};
	export let focusOnMount = false;
	export let addon: string = '';

	let inputRef: HTMLInputElement;
	const type = $$props.type;

	onMount(() => {
		if (focusOnMount) {
			inputRef.focus();
		}
	});

	const handleInput = (e) => {
		value = type && type === 'number' ? Number(e.target.value) : e.target.value;
		dispatch('seemlessInputChanged', value);
	};

	const handleKeypress = (e) => {
		if (e.charCode === 13) {
			e.stopPropagation();
			handleKey();
			inputRef.blur();
		}
	};
</script>

<div>
	<input
		bind:this={inputRef}
		class={`seemless-input ${boxSize}`}
		{placeholder}
		class:box={boxSize}
		on:blur
		on:keypress={handleKeypress}
		on:input={handleInput}
		{...$$props}
	/>
	{addon}
</div>

<style lang="scss">
	div {
		display: flex;
		align-items: center;
		width: 100%;
	}
	.seemless-input {
		outline: none;
		border: none;
		background: transparent;
		width: 100%;
	}

	.md {
		padding: 8px 16px;
	}
	.box {
		&:hover {
			outline: 1px solid var(--stroke-secondary);
		}
		&:focus {
			outline: 1px solid var(--stroke-secondary);
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		.md {
			padding: 4px 4px;
		}
	}
</style>
