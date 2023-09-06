<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import type { DropzoneOutput } from '$models/minter/dropzone';

	export let close: () => void;
	export let saveData: (logo: string, defaultImage: string, banner: string) => void;
	export let logo: string;
	export let defaultImage: string;
	export let banner: string;
	export let readonly = false;

	let backgroundUploads = [];
	let uploadTimer: NodeJS.Timer;
	let uploadTime: number = 1;

	let logoPreview = logo;
	let defaultPreview = defaultImage;
	let bannerPreview = banner;

	const handleLogoSelect = (file: DropzoneOutput) => {
		logoPreview = file.preview;
		if (file.pinInfo) {
			logo = ipfsCidUrl(file.pinInfo.IpfsHash);
		}
	};
	const handleImageSelect = (file: DropzoneOutput) => {
		defaultPreview = file.preview;
		if (file.pinInfo) {
			defaultImage = ipfsCidUrl(file.pinInfo.IpfsHash);
		}
	};
	const handleBannerSelect = (file: DropzoneOutput) => {
		bannerPreview = file.preview;
		if (file.pinInfo) {
			banner = ipfsCidUrl(file.pinInfo.IpfsHash);
		}
	};
	const handleLogoDiscard = () => {
		logo = '';
		logoPreview = '';
	};
	const handleImageDiscard = () => {
		defaultImage = '';
		defaultPreview = '';
	};
	const handleBannerDiscard = () => {
		banner = '';
		bannerPreview = '';
	};

	const add = () => {
		if (!uploadTimer) {
			saveData(logo, defaultImage, banner);
			close();
		}
	};

	const handleUploadStarted = (e) => {
		const { uploadId } = e.detail;
		backgroundUploads.push(uploadId);
		if (backgroundUploads.length === 1) {
			uploadTimer = setInterval(() => {
				uploadTime += 1;
			}, 1000);
		}
	};
	const handleUploadEnded = (e) => {
		const { uploadId } = e.detail;
		backgroundUploads = backgroundUploads.filter((id) => id !== uploadId);
		if (backgroundUploads.length === 0) {
			clearInterval(uploadTimer);
			uploadTimer = undefined;
			uploadTime = 1;
		}
	};

	$: disabled = !(logo || defaultImage || banner);
	$: uploadDropzoneTitle = readonly ? 'Unable to upload image' : 'Upload image';
</script>

<section>
	<h2>Images</h2>
	<div class="dropzone">
		<UploadDropzone
			title={uploadDropzoneTitle}
			accept={['.png', '.jpg', '.jpeg', '.gif', '.svg']}
			label="Collection Logo"
			info="A 350x350 image is recommended. Upload a GIF for an animated logo."
			description="Your collection's logo will be displayed on navigation pages."
			onDrop={handleLogoSelect}
			preview={!!logoPreview}
			discard={!readonly && handleLogoDiscard}
			uploadId="logo"
			disabled={readonly}
			on:uploadStarted={handleUploadStarted}
			on:uploadEnded={handleUploadEnded}
		>
			<img class="preview" src={logoPreview} alt="" />
		</UploadDropzone>
	</div>
	<div class="dropzone">
		<UploadDropzone
			title={uploadDropzoneTitle}
			accept={['.png', '.jpg', '.jpeg', '.gif', '.svg']}
			label="Default Image"
			info="A 600x400 image is recommended. Upload a GIF for an animated image."
			description="This image will be used when featuring your collection on the homepage or on category pages."
			onDrop={handleImageSelect}
			preview={!!defaultPreview}
			discard={!readonly && handleImageDiscard}
			uploadId="defaultImage"
			disabled={readonly}
			on:uploadStarted={handleUploadStarted}
			on:uploadEnded={handleUploadEnded}
		>
			<img class="preview" src={defaultPreview} alt="" />
		</UploadDropzone>
	</div>
	<div class="dropzone">
		<UploadDropzone
			title={uploadDropzoneTitle}
			accept={['.png', '.jpg', '.jpeg', '.gif', '.svg']}
			label="Banner Image"
			info={'A 1400x400 image is recommended. Upload a GIF for an animated banner.'}
			description="Your banner appears at the top of your collection page. Avoid including too much text in this banner image, as the dimensions change on different devices."
			onDrop={handleBannerSelect}
			preview={!!bannerPreview}
			discard={!readonly && handleBannerDiscard}
			uploadId="banner"
			disabled={readonly}
			on:uploadStarted={handleUploadStarted}
			on:uploadEnded={handleUploadEnded}
		>
			<img class="preview" src={bannerPreview} alt="" />
		</UploadDropzone>
	</div>
	{#if !readonly}
		<Button size="md" type={uploadTimer || disabled ? 'tertiary' : 'primary'} on:click={add}>
			{#if uploadTimer}
				<Icon name="clock" />
				{`${uploadTime}sec `}
			{/if}
			Add
		</Button>
	{/if}
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		max-width: 542px;
		padding-bottom: 1rem;

		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
		}
		.dropzone {
			margin-bottom: 16px;
		}
		.preview {
			width: 100%;
		}
	}
</style>
