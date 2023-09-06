<script lang="ts">
	import HiddenInput from '../seemless-input/HiddenInput.svelte';
	import ReviewField from './ReviewField.svelte';

	export let label: string;
	export let tooltip: string;
	export let value: string;
</script>

<ReviewField {label} {tooltip}>
	<HiddenInput placeholder="--" bind:value>
		<span class="value">{value || '--'}</span>
	</HiddenInput>
</ReviewField>

<style lang="scss">
	.value {
		font-weight: 500;
		max-height: 100px;
		color: var(--text-secondary);
	}
</style>
