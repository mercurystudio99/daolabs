<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import DefaultColorBlock from '../form-block/DefaultColorBlock.svelte';

	export let close;
	export let saveData: (colors) => void;

	export let colors: string[] = [];

	const add = () => {
		saveData(colors);
		close();
	};

	$: disabled = colors.length === 0;
</script>

<section>
	<h2>Collection Customization</h2>
	<DefaultColorBlock bind:colors maxLength={12} />
	<Button size="md" type={disabled ? 'tertiary' : 'primary'} on:click={add}>Add</Button>
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		max-width: 542px;
		overflow-y: visible;
		width: min(542px, 75vw);

		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
		}
	}
</style>
