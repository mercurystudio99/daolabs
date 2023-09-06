<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import DefaultColorBlock from '../form-block/DefaultColorBlock.svelte';
	import FormInput from '../form/FormInput.svelte';
	/*
	TODO: Tooltip text
	*/
	export let close;
	export let saveData: (colors, resolution) => void;

	export let colors: string[];
	export let resolution: string;

	const add = () => {
		saveData(colors, resolution);
		close();
	};

	$: disabled = !(colors[0] || resolution);
</script>

<section>
	<h2>Output Settings</h2>
	<DefaultColorBlock bind:colors maxLength={1} />
	<FormInput
		id="output-resolution"
		name="output-resolution"
		label="Output Resolution"
		info="The output resolution of your NFT. Enter the size of your image."
		placeholder="1000x1000"
		description="Output resolution of your NFT."
		bind:value={resolution}
	/>
	<Button size="md" type={disabled ? 'tertiary' : 'primary'} on:click={add}>Add</Button>
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		max-width: 542px;
		width: min(542px, 75vw);
		overflow-x: hidden;

		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
		}
	}
</style>
