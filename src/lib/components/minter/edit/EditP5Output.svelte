<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	// import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	// import Input from '$lib/components/Input.svelte';
	// import PopInfo from '$lib/components/PopInfo.svelte';
	import DefaultColorBlock from '../form-block/DefaultColorBlock.svelte';
	import FormInput from '../form/FormInput.svelte';

	export let close = () => {};
	export let saveData: (colors, resolution, format) => void;
	export let colors: string[];
	export let resolution: string;
	export let format: { type: string; format: string };

	const add = () => {
		saveData(colors, resolution, format);
		close();
	};

	$: disabled = !(colors[0] || resolution || format.type);
</script>

<section>
	<h2>Output Settings</h2>
	<DefaultColorBlock bind:colors maxLength={1} />
	<!-- TODO: Commented out until we support script/image/video -->
	<!-- <h4>
		<PopInfo message="Select the format your p5.js file will be rendered in.">Output format</PopInfo
		>
	</h4>
	<div class="format-wrap"> -->
	<!-- <div class="dropdown">
			<HoverDropdown
				options={[
					{ label: 'Script', value: 'Script' },
					{ label: 'Image', value: 'Image' },
					{ label: 'Video', value: 'Video' },
				]}
				bind:value={format.type}
			/>
		</div> -->
	<!-- {#if showFormatInput}
			<div class="input">
				<Input id="format" placeholder="PNG" bind:value={format.format} />
			</div>
		{/if} -->
	<!-- </div> -->
	<FormInput
		id="output-resolution"
		name="output-resolution"
		label="Output Resolution"
		info="Enter the canvas resolution of your p5.js file."
		placeholder="1000x1000"
		description="Output resolution of your NFT."
		bind:value={resolution}
	/>
	<Button
		size="md"
		buttonProps={{ type: 'button' }}
		type={disabled ? 'tertiary' : 'primary'}
		on:click={add}>Add</Button
	>
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		width: min(542px, 75vw);
		overflow-x: hidden;

		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
		}

		/* h4 {
			color: var(--text-header);
		}
		.format-wrap {
			display: flex;
			flex-wrap: wrap;
			gap: 16px;
			margin-bottom: 16px;

			.dropdown {
				width: 185px;
			}
			/* .input {
				margin: 0 6px;
				max-width: 50px;
			} */
		/* }  */
	}
</style>
