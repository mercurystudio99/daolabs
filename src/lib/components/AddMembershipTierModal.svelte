<script lang="ts">
	import { getContext } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import FormField from './FormField.svelte';
	import type { DropzoneOutput, FileWithPath } from '$models/dropzone';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';
	import type { Dirty } from 'src/app';
	import type { EditingNftRewardTier } from '$models/nftRewardTier';

	export let project: Store<V2ProjectContextType>;
	export let minPrice = 0.0001;
	export let otherTiersPrices: number[] = [];

	const initialState: EditingNftRewardTier = {
		priceInput: 0,
		maxSupply: 0,
		file: '',
		name: '',
		link: $project?.projectMetadata?.infoUri || '',
		description: '',
		default: false,
	};

	export let close: (...args: any[]) => void;
	export let handleSave: (...args: any[]) => void = null;
	export let tierForm = { ...initialState };

	const dirty: Dirty = getContext('SHOW_DIRTY');

	$: {
		dirty?.check(initialState, tierForm || initialState);
	}

	const handleFileSelect = (file: DropzoneOutput, acceptedFiles: FileWithPath[]) => {
		const format: string = acceptedFiles[0].name.split('.').pop().toUpperCase();
		switch (format) {
			case 'JPG':
			case 'JPEG':
			case 'PNG':
			case 'JIF':
				// mediaType = 'Image';
				break;
			case 'MP4':
			case 'WEBM':
				// mediaType = 'Video';
				break;
		}
		tierForm.file = ipfsCidUrl(file.pinInfo.IpfsHash);
	};
	const handleFileDiscard = () => {
		tierForm.file = '';
	};

	function resetPrice(price: number) {
		if (!tierForm.priceInput || tierForm.priceInput < minPrice) {
			price = minPrice;
		}
		while (otherTiersPrices.includes(price)) {
			price = (price * 10000 + 1) / 10000;
		}
		return price;
	}

	$: isOK = (() => {
		const { priceInput, name, file, link } = tierForm;
		return (
			priceInput &&
			name &&
			file &&
			(link ? link.match(/^https?:\/\/\w+/) : true) &&
			tierForm.priceInput >= minPrice &&
			!otherTiersPrices.includes(Number(tierForm.priceInput))
		);
	})();

	const addTier = () => {
		if (isOK) {
			handleSave({ ...tierForm });
			close();
			tierForm = { ...initialState };
		}
	};

	tierForm.priceInput = resetPrice(Number(tierForm.priceInput));

	$: if (!tierForm.maxSupply || tierForm.maxSupply < 1) {
		tierForm.maxSupply = 1;
	} else if (!Number.isInteger(tierForm.maxSupply)) {
		tierForm.maxSupply = Math.floor(tierForm.maxSupply);
	}
</script>

<slot name="header" />

<div class="box">
	<h3>Add membership tier</h3>
	<p>
		Encourage treasury contributions by offering membership tiers based on artwork or utility, tiers
		are determined by the supply and contribution amount.
	</p>

	<FormField
		field={{
			id: 'tier-name',
			label: 'Membership Tier Name',
			description: "Your NFT's name, if left blank then the supply count will be used.",
			placeholder: 'Membership NFT tier name',
		}}
		labelHeaderColored
		popInfoMessage="Your membership tier NFT's name."
		bind:value={tierForm.name}
	/>
	<div class="flex">
		<div>Reward people who contributed at least</div>
		<div>
			<Input
				type="number"
				bind:value={tierForm.priceInput}
				disabled={tierForm.default}
				placeholder={0.1}
				step={0.0001}
				min={minPrice}
				on:blur={() => (tierForm.priceInput = resetPrice(Number(tierForm.priceInput)))}
			/>
		</div>
		<div>ETH</div>
	</div>
	<div class="flex">
		<div>Total supply at this tier</div>
		<div>
			<Input
				type="number"
				bind:value={tierForm.maxSupply}
				disabled={tierForm.default}
				placeholder={10}
			/>
		</div>
		<div>NFTs</div>
	</div>

	<h4>NFT</h4>
	<UploadDropzone
		accept={['.png', '.jpg', '.jpeg', '.gif', '.webp']}
		title="Upload an image"
		onDrop={handleFileSelect}
		preview={!!tierForm.file}
		discard={handleFileDiscard}
	>
		<img class="preview" src={tierForm.file} alt="" />
	</UploadDropzone>

	<FormField
		field={{
			id: 'tier-description',
			label: 'Description',
			description: '',
			placeholder: 'Provide a detailed description of your NFT or utility',
			type: 'textarea',
		}}
		labelHeaderColored
		popInfoMessage="Provide a detailed description of your NFT"
		bind:value={tierForm.description}
	/>

	<FormField
		popInfoMessage="External Link"
		field={{
			id: 'tier-link',
			description: '',
			label: 'External Link',
			placeholder: 'https://move.xyz',
			props: {
				type: 'url',
			},
		}}
		labelHeaderColored
		bind:value={tierForm.link}
	/>
	<br />

	<Button
		size="md"
		fullWidth
		type={isOK ? 'primary' : 'secondary'}
		disabled={!isOK}
		on:click={addTier}>Add membership tier</Button
	>
</div>

<style lang="scss">
	.box {
		width: 500px;
		max-width: 100%;
		max-height: 75vh;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		p {
			color: var(--text-secondary);
			font-weight: 300;
			margin: 0;
		}

		h3 {
			color: var(--text-header);
			margin: 0;
			font-size: 1.2rem;
		}

		h4 {
			color: var(--text-header);
			margin: 0;
		}
		.preview {
			width: 100%;
			max-width: 100px;
		}
		.flex {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 1rem;
		}
		.flex > div:nth-child(1) {
			width: 100%;
		}
		.flex > div:nth-child(2) {
			width: 13ch;
		}
		.flex > div:nth-child(3) {
			width: 6ch;
			display: block;
		}
	}
</style>
