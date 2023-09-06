<script lang="ts">
	import Popover from '$lib/components/Popover.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';

	import MissingImage from '../icons/MissingImage.svelte';
	import ReviewField from './ReviewField.svelte';
	import type { DropzoneOutput } from '$models/minter/dropzone';

	export let label: string;
	export let tooltip: string;
	export let image: DropzoneOutput;

	let showDropzone = false;
	let lockDropzoneDisplay = false;

	const handleSelect = (file: DropzoneOutput) => {
		image = file;
	};
	const handleDiscard = () => {
		image.pinInfo = undefined;
		image.preview = '';
	};
</script>

<ReviewField {label} {tooltip}>
	{#if !image.preview}
		{#if showDropzone || lockDropzoneDisplay}
			<div
				class="dropzone"
				on:mouseleave={() => (showDropzone = false)}
				on:touchend={() => (showDropzone = false)}
			>
				<UploadDropzone
					accept={['.png', '.jpg', '.jpeg', '.gif', '.svg']}
					displayAccept={false}
					onDrop={handleSelect}
					preview={!!image.preview}
					discard={handleDiscard}
					on:uploadStarted={() => (lockDropzoneDisplay = true)}
					on:uploadEnded={() => (lockDropzoneDisplay = false)}
				>
					<img class="image" src={image.preview} alt="" />
				</UploadDropzone>
			</div>
		{:else}
			<div
				class="image missing"
				on:mouseenter={() => (showDropzone = true)}
				on:touchstart={() => (showDropzone = true)}
			>
				<MissingImage />
			</div>
		{/if}
	{:else}
		<div class="image-wrapper">
			<Popover placement="top" maxWidth="200px">
				<div slot="content" class="enlarged">
					<img src={image.preview} alt="" />
				</div>
				<img class="image" src={image.preview} alt="" />
			</Popover>
		</div>
	{/if}
</ReviewField>

<style lang="scss">
	.image-wrapper {
		width: 100px;
		max-height: 100px;

		.enlarged {
			width: 100%;

			img {
				width: 100%;
				height: 100%;
			}
		}

		.image {
			width: 100px;
			max-height: 100px;
			object-fit: contain;
		}
	}
	.missing {
		background: var(--background-l2);
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100px;
		width: 100px;
	}
	.dropzone {
		width: 100px;
		height: 100px;
	}
</style>
