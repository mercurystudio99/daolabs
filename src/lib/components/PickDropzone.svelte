<script lang="ts">
	import Dropzone from 'svelte-file-dropzone/src/components/Dropzone.svelte';
	import { createEventDispatcher } from 'svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import Icon from '$lib/components/Icon';
	import type { DropEvent, FileWithPath } from '$models/dropzone';

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
	export let discard: () => void = () => {};
	export let displayAccept = true;
	export let dropOverride: (acceptedFiles: FileWithPath[]) => void = null;
	export let id = 'dropzone';

	const dispatch = createEventDispatcher();

	const handleFileSelect = (e: DropEvent) => {
		const { acceptedFiles } = e.detail;
		if (dropOverride) return dropOverride(acceptedFiles);
		dispatch('select', acceptedFiles);
		return true;
	};
	const acceptedFormats = accept
		.map((format) => format.slice(1))
		.join(', ')
		.toUpperCase();
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
