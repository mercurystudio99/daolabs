<script lang="ts">
	import Dropzone from 'svelte-file-dropzone/src/components/Dropzone.svelte';
	import { createEventDispatcher } from 'svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { pinFileToIpfs } from '$utils/ipfs';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import { createCustomNotification } from '$utils/notification';
	import Icon from '$lib/components/Icon';
	import type { UpdateNotification } from '@web3-onboard/core';
	import type { DropEvent, DropzoneOutput, FileWithPath } from '$models/dropzone';

	export let accept: string[] = [];
	export let label: string = '';
	export let title: string = '';
	export let info: string = '';
	export let description: string = '';
	export let disabled: boolean = false;
	export let maxSize: number = 0;
	export let background = 'l0';
	export let required = false;
	export let preview: boolean = false;
	export let multiple: boolean = false;
	export let directory: boolean = false;
	export let onDrop: (
		file: DropzoneOutput,
		acceptedFiles?: FileWithPath[],
		index?: number,
	) => void = () => {};
	export let discard: () => void = undefined;
	export let displayAccept = true;
	export let uploadId: string = '';
	export let dropOverride: (acceptedFiles: FileWithPath[]) => void = null;
	export let loading = false;
	export let id = 'dropzone';

	let errors: string[] = [];
	let progress = 0;

	const dispatch = createEventDispatcher();

	function progressHandler(fraction: number) {
		// NOTE: before you try fixing the 100% progress immediately being fired: https://github.com/axios/axios/issues/2709
		function calculate(progressEvent: ProgressEvent) {
			const singleProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
			progress += Math.round(fraction * singleProgress);
		}
		return calculate;
	}

	const uploadFile = async (
		file: Blob,
		files: FileWithPath[],
		index: number,
		update: UpdateNotification,
	) => {
		const url = URL.createObjectURL(file);
		if (uploadId) {
			onDrop({ preview: url, pinInfo: undefined });
		}
		dispatch('uploadStarted', { uploadId });
		try {
			const res = await pinFileToIpfs(file, undefined, progressHandler(1 / files.length));
			update({
				type: 'success',
				message: `${files[index].name} successfully uploaded`,
			});
			dispatch('uploadEnded', { uploadId });
			onDrop({ preview: url, pinInfo: res }, files, index);
			return true;
		} catch (e) {
			update({
				type: 'error',
				message: `Error uploading ${files[index].name}`,
			});
			dispatch('uploadEnded', { uploadId });
			return false;
		}
	};

	const handleFileSelect = async (e: DropEvent) => {
		errors = [];
		const { acceptedFiles, fileRejections } = e.detail;
		if (dropOverride) return dropOverride(acceptedFiles);
		if (fileRejections.length > 0) {
			const isAllDSstore = fileRejections.every(
				(fileRejection) => fileRejection.file.name === '.DS_Store',
			);
			if (!isAllDSstore) {
				errors = fileRejections.map((rejection) => {
					const errorMessages = rejection.errors.map((err) => err.message);
					return `${rejection.file.name} failed - ${errorMessages.join(', ')}`;
				});
				return false;
			}
		}
		const { update } = createCustomNotification({
			type: 'pending',
			message: 'Uploading files',
		});
		let successCount = 0;
		let failedCount = 0;
		await Promise.all(
			acceptedFiles.map(async (file, index) => {
				// This is so stupid, i.e. the passing of acceptedFiles and index,
				// but I don't have time to go through all the uses of UploadDropzone right now
				// and don't want to break the current API.
				const success = await uploadFile(file, acceptedFiles, index, update);
				successCount += success ? 1 : 0;
				failedCount += !success ? 1 : 0;
			}),
		);
		let message = `${successCount} file${successCount === 1 ? '' : 's'} uploaded successfully`;
		if (failedCount > 0) {
			message += `, ${failedCount} file${failedCount === 1 ? '' : 's'} failed to upload`;
		}
		update({
			type: 'success',
			message,
			autoDismiss: 3000,
		});
		dispatch('done');
		progress = 0;
		return true;
	};
	const acceptedFormats = accept
		.map((format) => format.slice(1))
		.join(', ')
		.toUpperCase();

	$: loading = progress > 0;
</script>

<div class="dropzone-container">
	{#if label}
		<span class="label">
			{label}<small>{required ? '*' : ''}</small>
			{#if info}
				<PopInfo message={info} placement="bottom" />
			{/if}
		</span>
	{/if}
	{#if preview}
		<div class="preview">
			{#if !disabled && discard}
				<CloseButton size=".9rem" position="1.50em" on:click={discard} />
			{/if}
			<slot />
		</div>
	{:else}
		<div class="dropzone" {id}>
			<Dropzone
				{accept}
				{disabled}
				containerStyles={`background: var(--background-${background}); border: none; justify-content:center; height: 100%`}
				{multiple}
				{directory}
				maxSize={maxSize || Infinity}
				on:drop={handleFileSelect}
			>
				<div class="upload-zone">
					{#if errors.length > 0}
						{#each errors as error}
							<o class="error">{error}</o>
						{/each}
					{:else if loading}
						<div class="progress-bar">
							<ProgressBar percentage={progress} />
						</div>
					{:else if disabled}
						<div class="upload-icon">
							<Icon name="close" />
						</div>
						<div class="upload-title">
							{title}
						</div>
					{:else}
						<div class="upload-icon">
							<Icon name="upload" />
						</div>
						<div class="upload-title">
							{title}
						</div>
						<div class="upload-accepted">
							{#if displayAccept}
								{acceptedFormats}
							{/if}
						</div>
						{#if maxSize}
							<p class="max-size">
								Max Size: {maxSize / 1000000} MB
							</p>
						{/if}
					{/if}
				</div>
			</Dropzone>
		</div>
	{/if}
	{#if description}
		<span class="description">
			{description}
		</span>
	{/if}
</div>

<style lang="scss">
	.dropzone-container {
		height: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
		.dropzone {
			height: 100%;
			border-width: 2px;
			border-radius: 2px;
			border: var(--stroke-primary) 1px dashed;
			&:hover {
				border: var(--background-action-primary) 1px dashed;
				cursor: pointer;
			}
		}
		.preview {
			position: relative;
			display: grid;
		}
	}
	.upload-zone {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: transparent;
		.upload-icon {
			color: var(--text-action-primary);
			font-size: 28px;
		}
		.upload-title {
			font-size: 14px;
			color: var(--text-primary);
			font-weight: 400;
		}
		.upload-accepted {
			font-size: 11px;
			color: var(--text-secondary);
			font-weight: 400;
		}
		.max-size {
			margin: 0;
			margin-top: 8px;
			color: var(--text-primary);
			font-weight: 400;
		}
		.error {
			color: var(--text-failure);
		}

		.progress-bar {
			width: 100%;
			height: 8px;
			margin-top: 2px;
			--color: var(--text-action-primary);
		}
	}
	.label {
		margin-left: 2px;
		margin-bottom: 10px;
		color: var(--text-header);
		font-size: 14px;
		font-weight: 500;
		display: flex;
	}
	.description {
		font-size: 14px;
		color: var(--text-secondary);
		margin-top: 10px;
	}
</style>
