<script lang="ts">
	import { BigNumber } from 'ethers';
	import { ipfsCidUrl } from '$utils/ipfs';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormInput from '$lib/components/minter/form/FormInput.svelte';
	import { type EditionConfig, NftStatus, initialEditionConfig } from '$models/minter/nft-config';
	import { generateId } from '$lib/utils/generateId';
	import type { DropzoneOutput } from '$models/dropzone';

	export let editions: EditionConfig[] = [];

	let currency = BigNumber.from(V2_CURRENCY_ETH);
	let previewImage: string;
	let currentEditionIndex: number;

	const addEdition = () => {
		editions = [...editions, { ...initialEditionConfig, _id: generateId() }];
	};

	const saveEdition = () => {
		editions = editions.map((edition) => {
			return {
				...edition,
				_status: NftStatus.SAVED,
			};
		});
		previewImage = '';
	};

	function handleFileSelect(file: DropzoneOutput) {
		previewImage = file.preview;
		editions[currentEditionIndex].file = ipfsCidUrl(file.pinInfo.IpfsHash);
	}

	function handleFileDiscard() {
		previewImage = '';
		editions[currentEditionIndex].file = '';
	}

	$: showForm = editions.filter((edition) => edition._status === NftStatus.UNFINISHED).length;
	$: currentEditionIndex = editions.length - 1;
</script>

<section>
	{#if showForm}
		<div class="dropzone">
			<UploadDropzone
				label="File"
				required={true}
				info="Upload your NFT content: images, SVGs, video & audio files, and 3D models will work."
				accept={['.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4']}
				title="Upload file"
				onDrop={handleFileSelect}
				preview={!!previewImage}
				discard={handleFileDiscard}
			>
				<img class="preview" src={previewImage} alt="" />
			</UploadDropzone>
		</div>

		<span id="edition-description">
			<Textarea
				id="description"
				info="Describe or add context to your NFT collection. This will be displayed in marketplaces and wallets."
				label="Description"
				placeholder="This is example of a default description."
				bind:value={editions[currentEditionIndex].description}
				rows="4"
				maxlength={1000}
			/>
		</span>

		<div class="currency-input" id="edition-price">
			<label for="price">
				<PopInfo
					message="The ETH (Ether) price of each editions[currentEditionIndex].  Edition NFTs have the most basic pricing scheme.  Enter zero for the NFT to only cost a gas fee."
				>
					Price
				</PopInfo>
			</label>
			<CurrencyInput
				disabledCurrency
				bind:currency
				bind:inputValue={editions[currentEditionIndex].price}
				step={0.0001}
			/>
			{#if Number(editions[currentEditionIndex].price) === 0}
				<span
					>The ETH price of each editions[currentEditionIndex]. A price of 0 is free (gas only).</span
				>
			{/if}
		</div>
		<!-- TODO: open mint means that there is no fixed supply or end date -->
		<span id="edition-supply">
			<FormInput
				id="supply"
				label="Supply"
				info="By default, collections have a supply of 1. Enter 0 for unlimited mints."
				placeholder="Unlimited"
				description="The number of NFTs that can be minted."
				type="number"
				bind:value={editions[currentEditionIndex].totalSupply}
			/>
		</span>
	{/if}
	{#if showForm}
		<Button size="md" on:click={saveEdition} type={'primary'}>Save Edition</Button>
	{:else}
		<Button size="md" on:click={addEdition} type={'secondary'}>Add Edition</Button>
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
	}
	.currency-input {
		margin: 16px 0;
		display: flex;
		flex-direction: column;
	}
	.currency-input span {
		font-weight: 300;
		color: var(--text-secondary);
	}

	label {
		color: var(--text-header);
		margin-bottom: 8px;
	}
	.preview {
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
	}
	.dropzone {
		margin-bottom: 16px;
		font-size: 4px;
	}
</style>
