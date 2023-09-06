<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormInput from '../form/FormInput.svelte';

	/*
	TODO: Tooltip text
	*/
	export let close;

	export let onConfirm: (saveName: string) => void;
	export let onCancel: () => void;
	export let sessionName: string;

	let saveName = sessionName;

	function cancel() {
		onCancel();
		close();
	}
	function confirm() {
		onConfirm(saveName);
		close();
	}
</script>

<ActionModal title="Save changes">
	<p>Name your project. By default it will be named in format: year-month-day-hour.min.sec</p>

	<FormInput
		id="save-name"
		name="save-name"
		placeholder="Title"
		label="Name*"
		info="Tooltip text"
		bind:value={saveName}
		description="Your current project’s name"
	/>
	<div slot="footer">
		<Button size="md" type="secondary" on:click={cancel}>Discard</Button>
		<Button size="md" on:click={confirm}>Save</Button>
	</div>
</ActionModal>
