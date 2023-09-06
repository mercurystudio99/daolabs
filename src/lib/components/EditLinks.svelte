<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';

	export let close;
	export let saveData: (link: string) => void;
	export let customInvalidFunc: (link: string) => boolean;
	export let customInvalidMessage: string;

	let invalid = false;
	let customInvalid = false;
	let link = '';

	const add = () => {
		if (link) {
			if (customInvalidFunc?.(link)) {
				invalid = true;
				customInvalid = true;
			} else {
				saveData(link);
				close();
			}
		} else {
			invalid = true;
		}
	};

	const onChange = (e) => {
		if (e.target.checkValidity()) {
			invalid = false;
			customInvalid = false;
		} else {
			invalid = true;
		}
	};
</script>

<section>
	<h2>Add a link</h2>

	<FormField
		field={{
			id: 'link',
			placeholder: 'https://yoursite.io/stuff/111',
			props: {
				type: 'url',
				required: true,
			},
		}}
		on:input={onChange}
		bind:value={link}
	/>
	{#if customInvalid}
		{customInvalidMessage}
	{/if}
	<br />
	<Button
		buttonProps={{ type: 'button' }}
		size="md"
		type={'primary'}
		disabled={invalid}
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
	}
</style>
