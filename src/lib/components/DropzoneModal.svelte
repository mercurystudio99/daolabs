<script lang="ts">
	import ActionModal from './ActionModal.svelte';
	import Button from './Button.svelte';
	import UploadDropzone from './UploadDropzone.svelte';
	import type { DropzoneOutput } from '$models/dropzone';

	export let close;
	export let message = '';
	export let title: string;
	export let accept: string[];
	export let saveChanges: (file: DropzoneOutput) => void;

	let uploadedFile: DropzoneOutput;
	let fileLoading = false;

	const handleFileSelect = (file: DropzoneOutput) => {
		uploadedFile = file;
	};
	const handleFileDiscard = () => {
		uploadedFile = undefined;
	};

	const save = () => {
		saveChanges(uploadedFile);
		close();
	};
</script>

<ActionModal {title}>
	{#if message}
		<p>{message}</p>
	{/if}

	<div class="dropzone">
		<UploadDropzone
			{accept}
			title="Upload file"
			onDrop={handleFileSelect}
			preview={!!uploadedFile}
			discard={handleFileDiscard}
			on:uploadStarted={() => (fileLoading = true)}
			on:uploadEnded={() => (fileLoading = false)}
		>
			<img class="preview" src={uploadedFile.preview} alt="" />
		</UploadDropzone>
	</div>
	<div slot="footer">
		<Button size="md" on:click={save} disabled={fileLoading}>Save</Button>
	</div>
</ActionModal>

<style lang="scss">
	.dropzone {
		width: 67vw;
		max-width: 450px;
		.preview {
			width: 100%;
		}
	}
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
</style>
