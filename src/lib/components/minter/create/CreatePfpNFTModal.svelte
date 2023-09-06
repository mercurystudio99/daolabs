<script lang="ts">
	import { onMount } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import {
		initialPfpNftConfig,
		NftStatus,
		NftType,
		type PfpNftConfig,
		initialModificationConfig,
	} from '$models/minter/nft-config';
	import { pfpValidationSchema } from '$models/minter/validation-schemas/pfp-validation';
	import { getErrorList } from '$lib/utils/getErrorList';
	import { prepareAllAttributes } from '$lib/utils/nftCreationUtils';
	import { generateId } from '$lib/utils/generateId';
	import Button, { ButtonType } from '$lib/components/Button.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { pfpNftCreationOptions, pfpNftCreationAdvancedOptions } from '$utils/introjs/options';
	import NftPreviewCards from '../card/NftPreviewCards.svelte';
	import NftCreation from '../nft-creation/NftCreation.svelte';
	import Form from '../form/Form.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import ClosableInfoBox from '../closable-info-box/ClosableInfoBox.svelte';
	import PfpFormContent from '../nft-form-content/PfpFormContent.svelte';
	import PfpNftPreview from '../preview/PfpNftPreview.svelte';
	import AdditionalConfiguration from '../card/AdditionalConfiguration.svelte';
	import DefaultColorBlock from '../form-block/DefaultColorBlock.svelte';
	import type { TokenStandard } from '$models/minter/token-standard';
	import type { AdvancedCollection, PfpCollection } from '$models/minter/collection-config';

	export let close: () => void;
	export let advancedMode = true;
	export let collection: PfpCollection;
	export let saveCollection: (collection: AdvancedCollection) => Promise<void>;
	export let standard: TokenStandard;
	export let deleteDumpNft: (index: number) => void;
	export let getIntro: (introOptions: any, hintOptions: any) => void;

	let keepLink = false;
	let keepDescription = false;
	let showForm = !collection.nfts?.length;

	let errorList: { field: string; message: string }[];

	// Set the expanded preview to the not yet created first nft
	let expanded = [true];
	let attrModification = initialModificationConfig;

	const resetIntro = (mode: boolean) => {
		if (mode) {
			const options = {
				steps: [
					...pfpNftCreationOptions.steps.slice(0, -2),
					...pfpNftCreationAdvancedOptions.steps,
					...pfpNftCreationOptions.steps.slice(-2),
				],
				dontShowAgain: true,
			};
			getIntro(options, null);
		} else {
			getIntro(pfpNftCreationOptions, null);
		}
	};

	onMount(() => {
		const options = {
			steps: [
				...pfpNftCreationOptions.steps.slice(0, -2),
				...pfpNftCreationAdvancedOptions.steps,
				...pfpNftCreationOptions.steps.slice(-2),
			],
			dontShowAgain: true,
		};
		getIntro(options, null);
	});

	const review = async () => {
		collection.nfts = collection.nfts.map(prepareAllAttributes);
		await saveCollection({ ...collection, nftType: NftType.PFP, standard });
		close();
	};

	function getInitialValue() {
		// TODO might need to handle colours when re-introducing defaultColor = Object.values(population.defaultColor);
		return initialPfpNftConfig;
	}

	const { handleSubmit, errors, form, handleChange, handleReset } = createForm<PfpNftConfig>({
		initialValues: getInitialValue(),
		onSubmit: () => {
			const totalPermutation = $form.layers.reduce((acc, val) => acc * val.properties.length, 1);
			if (totalPermutation < Number($form.totalSupply)) {
				errorList = [
					{
						field: 'Attributes',
						message:
							'Available total permutation of layers must be equal to or bigger than total supply.',
					},
				];
				return;
			}
			$form._status = NftStatus.SAVED;
			$form._id = generateId();
			// TODO: this whole attrModification thing is very very messy. Needs refactoring.
			if (attrModification.name.status) {
				if (attrModification.name.removeUnderscore) {
					$form.layers.forEach((attr) => {
						attr.name = attr.name.replace(/_/g, ' ');
					});
				}
				if (attrModification.name.capStatus === 'sentenceCase') {
					$form.layers.forEach((attr) => {
						attr.name =
							(attr.name.charAt(0).toUpperCase() as string) +
							(attr.name.substr(1).toLowerCase() as string);
					});
				} else if (attrModification.name.capStatus === 'allCaps') {
					$form.layers.forEach((attr) => {
						attr.name = attr.name.toUpperCase();
					});
				}
			}
			if (attrModification.value.status) {
				if (attrModification.value.removeUnderscore) {
					$form.layers.forEach((attr) => {
						attr.properties.forEach((property) => {
							property.name = property.name.replace(/_/g, ' ');
						});
					});
				}
				if (attrModification.value.capStatus === 'sentenceCase') {
					$form.layers.forEach((attr) => {
						attr.properties.forEach((property) => {
							property.name =
								(property.name.charAt(0).toUpperCase() as string) +
								(property.name.substr(1).toLowerCase() as string);
						});
					});
				} else if (attrModification.value.capStatus === 'allCaps') {
					$form.layers.forEach((attr) => {
						attr.properties.forEach((property) => {
							property.name = property.name.toUpperCase();
						});
					});
				}
			}
			if (!collection.nfts) {
				collection.nfts = [];
			}
			collection.nfts = [$form, ...collection.nfts];
			collection = collection;
			showForm = false;
			expanded = collection.nfts.map(() => false);
			handleReset();
		},
		validationSchema: pfpValidationSchema,
	});

	errors.subscribe((value) => {
		const err = getErrorList(value);
		if (err.length > 0) {
			errorList = err;
		}
	});

	const submitOverride = (e: Event) => {
		e.preventDefault();
		handleSubmit(e);
	};

	const createAnother = () => {
		showForm = true;
		expanded = [true, ...expanded];
	};

	const deleteNft = (index: number) => {
		collection = {
			...collection,
			nfts: collection.nfts.filter((_, i) => i !== index),
		};
		if (collection.nfts?.length === 0) {
			showForm = true;
		}
		deleteDumpNft(index);
	};

	const updateOrder = (list: PfpNftConfig[]) => {
		collection.nfts = list;
	};

	const updateNft = (data: PfpNftConfig) => {
		const nftIndex = collection.nfts.findIndex((i) => i._id === data._id);
		collection = {
			...collection,
			nfts: [...collection.nfts.slice(0, nftIndex), data, ...collection.nfts.slice(nftIndex + 1)],
		};
	};

	let options = {
		nameFieldDescription: 'An optional name to prepend the NFT token id with.',
		submitButtonText: 'Save NFT',
		submitButtonType: ButtonType.SECONDARY,
		totalSupplyDescription: 'The number of layerings to create with the uploaded attributes.',
	};

	$: options = {
		...options,
		submitButtonType:
			$form.layers.filter((layer) => layer._status === NftStatus.SAVED).length > 0
				? ButtonType.PRIMARY
				: ButtonType.SECONDARY,
	};
</script>

<ClosableInfoBox
	info="The NFT PFP Builder helps creators launch their projects from scratch with No Code. Our UI Builder automatically and randomly synthesizes image layers & uploads images and metadata on IPFS."
	classes="margin"
	id="pfp-info"
/>
<ClosableInfoBox
	info="We provide the easiest-to-use drag and drop editor to help you set up minting websites for your NFT collections."
	classes="margin"
	id="pfp-helper"
/>
<main>
	<div class="form">
		<h2>Create PFP NFT</h2>
		{#if collection.nfts?.length}
			<NftPreviewCards
				savedNfts={collection.nfts || []}
				{deleteNft}
				{updateOrder}
				{updateNft}
				colors={collection.defaultColors}
			/>
			<h4>Create Another PFP NFT in Collection</h4>
			<span class="add-text">
				Add NFT to the collection before finalizing with Review and Deploy.
			</span>
			{#if !showForm}
				<Button
					size="md"
					type="tertiary"
					on:click={createAnother}
					buttonProps={{ id: 'add-another' }}
				>
					Add PFP NFT
				</Button>
			{/if}
		{/if}
		{#if showForm}
			<Form onSubmit={submitOverride}>
				<NftCreation
					bind:advancedMode
					errors={$errors}
					bind:form={$form}
					bind:attrModification
					{handleChange}
					bind:keepDescription
					bind:keepLink
					{options}
					showOptions={{
						keepDescription: false,
						keepLink: false,
						properties: false,
						supply: true,
					}}
					onAdvanced={resetIntro}
				>
					<PfpFormContent nested={true} bind:form={$form} {handleChange} />
					<div slot="advanced" id="pallette-wrap">
						<DefaultColorBlock
							info="PFPs can override the collection's palette, allowing a subset of NFTs to have different colors."
							bind:colors={$form.defaultColors}
							maxLength={6}
						/>
					</div>
				</NftCreation>
			</Form>
		{/if}
		{#if collection.nfts?.length > 0}
			<AdditionalConfiguration bind:collection />
			<div class="button-container">
				<Button
					size="md"
					type={collection.nfts && collection.nfts.length > 0 ? 'primary' : 'tertiary'}
					on:click|once={review}
				>
					Review
				</Button>
			</div>
		{/if}
	</div>
	<PfpNftPreview bind:nft={$form} {collection} {standard} {expanded} />
</main>

<Modal
	on:close={() => {
		errorList = undefined;
	}}
	show={errorList &&
		bind(FormErrorModal, {
			errorList,
		})}
/>

<style>
	h2,
	h4 {
		color: var(--text-header);
	}

	h4 {
		margin-bottom: 16px;
		font-weight: 400;
		font-size: 16px;
	}

	main {
		display: flex;
		padding: 8px;
		gap: 24px;
		width: calc(100vw - 96px);
	}

	.add-text {
		color: var(--text-secondary);
		font-weight: 300;
		margin-bottom: 16px;
	}

	.form {
		display: flex;
		flex-direction: column;
		flex-basis: 50%;
	}

	.button-container {
		margin-top: 16px;
		margin-left: auto;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		main {
			flex-direction: column;
			width: 100%;
		}
	}
</style>
