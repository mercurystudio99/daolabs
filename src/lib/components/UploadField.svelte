<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon';
	import { ipfsCidUrl, pinFileToIpfs } from '$utils/ipfs';

	export let onChange: (src: string) => void;
	export let url = '';
	export let accept: string;

	let problem: string | undefined;
	let loading = false;
	let file: HTMLInputElement;

	function loadFile(_url: string) {
		if (onChange) {
			onChange(_url);
		}
		url = _url;
	}

	onMount(() =>
		file.addEventListener('change', (e) => {
			loading = true;
			const inputElement = e.target as HTMLInputElement;
			// Return in the case of cancelling
			// this looks awful, because it is
			if (!inputElement) {
				loading = false;
				return;
			}
			// Get the selected file
			const [firstFile] = inputElement.files as any as File[];
			if (!firstFile) {
				loading = false;
				return;
			}
			// Get the file name and size
			const { size } = firstFile;
			// Convert size in bytes to kilo bytes
			const fileSize = size / 1000;
			if (fileSize > 500) {
				problem = 'File size must be less than 500 KB';
				url = '';
				loading = false;
				return;
			}
			problem = undefined;

			const handler = async () => {
				// Set the text content
				const res = await pinFileToIpfs(firstFile);
				const ipfsUrl = ipfsCidUrl(res?.IpfsHash);
				loading = false;
				loadFile(ipfsUrl);
				url = ipfsUrl;
			};

			handler().catch(() => {
				loading = false;
			});
		}),
	);
</script>

{#if loading}
	<Icon name="loading" spin />
{/if}
<label for="icon">
	Logo or Sticker
	<input bind:this={file} id="icon" type="file" {accept} />
	<div>
		{#if url}
			<Icon
				name="closeCircle"
				on:click={() => {
					url = '';
				}}
			/>
		{:else}
			<Icon name="fileImage" />
			<span>Upload</span>
		{/if}
	</div>
</label>
{#if url}
	<div class="preview-wrapper">
		<img id="output" class={url ? 'file-preview' : ''} src={url} alt="Uploaded logo" />
		<a class="file-name" class:hide={!url} href={url}>{url}</a>
	</div>
{/if}
{#if problem}
	<Icon name="exclamationCircle" />
	{problem}
{/if}

<style>
	input[type='file'] {
		display: none;
	}

	div {
		color: var(--text-over-action-secondary);
		margin: 20px;
		cursor: pointer;
	}

	img {
		display: none;
	}

	.hide {
		display: none;
	}
	.preview-wrapper {
		display: flex;
		gap: 20px;
		align-items: center;
		word-wrap: break-word;
	}
	.file-name {
		width: calc(100% - 130px);
		text-overflow: ellipsis;
		font-size: 12px;
	}
	.file-preview {
		display: inline-block;
		max-width: 100px;
		max-height: 100px;
	}
</style>
