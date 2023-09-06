<script lang="ts">
	import { onMount } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import Button from '$lib/components/Button.svelte';
	import Modal, { bind, type ModalType } from '$lib/components/Modal.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { generateId } from '$lib/utils/generateId';
	import { getErrorList } from '$lib/utils/getErrorList';
	import { generateP5Html } from '$lib/utils/p5Template';
	import EditP5Advanced from '$lib/components/collections/EditP5Advanced.svelte';
	import {
		initialP5NftConfig,
		NftStatus,
		NftType,
		type P5NftConfig,
	} from '$models/minter/nft-config';
	import { p5ValidationSchema } from '$models/minter/validation-schemas/p5-validation';
	import {
		nftCreationNextOptions,
		p5NftCreationAdvancedOptions,
		p5NftCreationOptions,
	} from '$utils/introjs/options';
	import {
		needsRandomSeed,
		removeRandomSeed,
		pushPreviewsToIpfs,
		pushScriptToIpfs,
	} from '$utils/p5js';
	import { randomIntGenerator } from '$lib/utils/sfc32';
	import AdditionalConfiguration from '../card/AdditionalConfiguration.svelte';
	import NftPreviewCards from '../card/NftPreviewCards.svelte';
	import Form from '../form/Form.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import NftCreation from '../nft-creation/NftCreation.svelte';
	import AdvancedCollectionPreview from '../preview/AdvancedCollectionPreview.svelte';
	import P5NftPreview from '../preview/P5NftPreview.svelte';
	import ScriptEditor from '../script-editor/ScriptEditor.svelte';
	import type { TokenStandard } from '$models/minter/token-standard';
	import type { P5Collection } from '$models/minter/collection-config';
	import type { FileWithPath } from '$models/dropzone';

	export let close: () => void;
	export let standard: TokenStandard;
	export let deleteDumpNft: (index: number) => void;
	export let collection: P5Collection;
	export let saveCollection: (collection: P5Collection) => Promise<void>;
	export let getIntro: (introOptions: any, hintOptions: any) => void;

	let advancedMode = true;
	let errorModal: ModalType;
	let formModal: ModalType;
	let iframeRef: HTMLIFrameElement;

	let p5Template = '';
	let scriptText = '';
	let metaInfo = '';

	let showForm = !collection.nfts?.length;
	let keepDescription = false;
	let keepLink = false;

	let seed: string;

	let addDisabled = false;

	const review = async () => {
		await saveCollection({ ...collection, nftType: NftType.P5JS, standard });
		close();
	};

	let errorList: { field: string; message: string }[];

	const resetIntro = (mode: boolean) => {
		if (mode) {
			const options = {
				steps: [
					...p5NftCreationOptions.steps.slice(0, -2),
					...p5NftCreationAdvancedOptions.steps,
					...p5NftCreationOptions.steps.slice(-2),
				],
				dontShowAgain: true,
			};
			getIntro(options, null);
		} else {
			getIntro(p5NftCreationOptions, null);
		}
	};

	async function onPushPreviewsToIpfs(nft: P5NftConfig) {
		addDisabled = true;
		// TODO error handling incase ipfs upload errors
		nft.ipfs = await pushPreviewsToIpfs(nft, scriptText);
		addDisabled = false;
	}

	const { handleSubmit, errors, form, handleChange, handleReset } = createForm<P5NftConfig>({
		initialValues: initialP5NftConfig,
		onSubmit: async () => {
			if (!scriptText) {
				errorList = [{ field: 'Script', message: 'Required' }];
				return;
			}
			if (needsRandomSeed(scriptText)) {
				$form.seed = seed;
			}
			void onPushPreviewsToIpfs($form);
			$form.script = await pushScriptToIpfs(scriptText);
			$form._status = NftStatus.SAVED;
			$form._id = generateId();
			if (!collection.nfts) {
				collection.nfts = [$form];
			} else {
				collection.nfts.push($form);
			}
			collection = collection;
			p5Template = '';
			scriptText = '';
			showForm = false;
			handleReset();
			getIntro(nftCreationNextOptions, null);
		},
		validationSchema: p5ValidationSchema,
	});

	errors.subscribe((value) => {
		const err = getErrorList(value);
		if (err.length > 0) {
			errorList = err;
		}
	});

	onMount(() => {
		const options = {
			steps: [
				...p5NftCreationOptions.steps.slice(0, -2),
				...p5NftCreationAdvancedOptions.steps,
				...p5NftCreationOptions.steps.slice(-2),
			],
			dontShowAgain: true,
		};
		getIntro(options, null);
	});

	// const generateMetaInfo = (scripText: string) => {
	// 	// TODO we want to send the canvas size to firebase too... property on the nft metadata?
	// 	// TODO we want to send the *unmodified* script to firebase, and the seed separatly
	// 	// so that we can generate several nfts from the same script
	// 	const canvasSize = scripText.match(/createCanvas\((\d+),\s*(\d+)\)/);
	// 	// Default canvas size is 100X100
	// 	const width = canvasSize ? canvasSize[1] : 100;
	// 	const height = canvasSize ? canvasSize[2] : 100;
	// 	const canvasString = `<b>Canvas size:</b> ${width}x${height}`;
	// 	// if (seed) {
	// 	// 	return `${canvasString} <br> <b>Seed:</b> ${seed}`;
	// 	// }
	// 	return canvasString;
	// };

	function notifyUser(totalSupply: number) {
		return totalSupply > 1 && !needsRandomSeed(scriptText);
	}

	const renderSketch = () => {
		if (!needsRandomSeed) {
			p5Template = generateP5Html(scriptText);
			return;
		}
		if (!seed) {
			const { seed: newSeed } = randomIntGenerator();
			seed = newSeed;
		}

		scriptText = removeRandomSeed(scriptText);
		// metaInfo = generateMetaInfo(scriptText);
		p5Template = generateP5Html(scriptText);
	};

	const handleScriptSelect = (acceptedFiles: FileWithPath[]) => {
		const reader = new FileReader();
		reader.readAsText(acceptedFiles[0]);
		reader.onload = (e) => {
			scriptText = e.target.result as string;
		};
		renderSketch();
	};

	const handleScriptDiscard = () => {
		p5Template = '';
		scriptText = '';
		metaInfo = '';
	};

	const createAnother = () => {
		showForm = true;
		if (keepDescription) {
			$form.description = collection.nfts[0].description;
		}
		if (keepLink) {
			$form.externalLink = collection.nfts[0].externalLink;
		}
	};
	const deleteNft = (index: number) => {
		collection.nfts.splice(index, 1);
		collection = collection;
		deleteDumpNft(index);
		if (collection.nfts?.length === 0) {
			showForm = true;
		}
	};
	const updateOrder = (list: P5NftConfig[]) => {
		collection.nfts = list;
	};

	const updateNft = (nftConfig: P5NftConfig) => {
		const nftIndex = collection.nfts.findIndex((i) => i._id === nftConfig._id);
		collection.nfts[nftIndex] = nftConfig;
		collection = collection;
	};

	const openEditor = () => {
		formModal = bind(ScriptEditor, {
			script: scriptText,
			saveChanges: (script) => {
				scriptText = script;
				renderSketch();
			},
			close: () => {},
		});
	};

	$: errorModal = errorList && bind(FormErrorModal, { errorList });
	$: console.log(collection);
</script>

<main>
	<div class="form">
		<h2>Create p5.js NFT</h2>
		{#if collection.nfts?.length > 0}
			<h4>Review p5.js NFT</h4>
			<div class="nft-list">
				<NftPreviewCards
					savedNfts={collection.nfts}
					{deleteNft}
					{updateOrder}
					{updateNft}
					colors={collection.defaultColors}
				/>
			</div>

			<h4>Create Another p5.js NFT in Collection</h4>
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
					Add p5.js NFT
				</Button>
			{/if}
		{/if}
		{#if showForm}
			<Form onSubmit={handleSubmit}>
				<div class="box">
					<!-- TODO: fix by sorting out the attr modification implementation -->
					<NftCreation
						bind:advancedMode
						errors={$errors}
						bind:form={$form}
						{handleChange}
						bind:keepDescription
						bind:keepLink
						onAdvanced={resetIntro}
					>
						<h4 class="title">
							<PopInfo message="p5.js is a JavaScript library for creative coding."
								>p5.js NFT<small>*</small></PopInfo
							>
						</h4>
						<p class="add-text">
							Review the p5.js script to ensure the NFT rendering is as expected.
							<a href="https://p5js.org/"> Learn more. </a>
						</p>
						<div class="dropzone" id="script-upload-wrap">
							<UploadDropzone
								info="Tooltip text"
								accept={['.js']}
								title="Upload Script"
								dropOverride={handleScriptSelect}
								id="script-upload"
							/>
						</div>
						<span id="script-wrap">
							<Textarea
								id="script"
								label="Script"
								placeholder="Provide script that needs to be executed"
								rows="5"
								maxHeight={400}
								bind:value={scriptText}
							/>
						</span>
						{#if scriptText && notifyUser($form.totalSupply)}
							<div class="notice">
								<p class="warning">
									Supply is more than 1, but the script includes no randomness. Only 1 preview image
									will be uploaded and used for all in the supply.
								</p>
							</div>
						{/if}
						{#if metaInfo}
							<div class="metaInfo">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html metaInfo}
							</div>
						{/if}
						<div class="button-container">
							<Button
								buttonProps={{ type: 'button', id: 'editor' }}
								size="md"
								on:click={openEditor}
							>
								Editor
							</Button>
							<Button
								buttonProps={{ type: 'button', id: 'clear' }}
								type="tertiary"
								size="md"
								on:click={handleScriptDiscard}
							>
								Clear
							</Button>
							<Button
								buttonProps={{ type: 'button', id: 'play' }}
								size="md"
								on:click={renderSketch}
								disabled={!scriptText}
							>
								Play
							</Button>
						</div>
						<div slot="advanced" id="output-wrap">
							<EditP5Advanced nft={$form} />
						</div>
					</NftCreation>
				</div>
			</Form>
		{/if}
		{#if collection.nfts?.length > 0}
			<AdditionalConfiguration bind:collection />
			<div class="button-container">
				<Button
					size="md"
					type={collection.nfts && collection.nfts.length > 0 ? 'primary' : 'tertiary'}
					on:click={review}
					buttonProps={{ id: 'review' }}
					disabled={addDisabled}
				>
					Review
				</Button>
			</div>
		{/if}
	</div>
	{#if showForm}
		<P5NftPreview nft={$form} {collection} template={p5Template} {standard} bind:iframeRef />
	{:else}
		<AdvancedCollectionPreview {collection} />
	{/if}
</main>

<Modal
	on:close={() => {
		errorList = undefined;
	}}
	show={errorModal}
/>
<Modal
	on:close={() => {
		formModal = undefined;
	}}
	show={formModal}
/>

<style lang="scss">
	main {
		display: flex;
		padding: 8px;
		gap: 24px;
		width: calc(100vw - 96px);
		.form {
			display: flex;
			flex-direction: column;
			flex-basis: 50%;
		}
		.box {
			display: flex;
			flex-direction: column;

			.title {
				color: var(--text-header);
				small {
					align-self: flex-start;
				}
			}

			.dropzone {
				position: relative;
				margin-bottom: 16px;
				width: 100%;
				height: 100px;
			}
		}

		h2 {
			font-size: 28px;
			color: var(--text-header);
			margin-bottom: 16px;
		}
		h4 {
			margin-bottom: 16px;
			color: var(--text-header);
			font-weight: 400;
			font-size: 16px;
		}
		.nft-list {
			padding-bottom: 16px;
			border-bottom: 1px solid var(--stroke-tertiary);
			margin-bottom: 16px;
		}

		.add-text {
			color: var(--text-secondary);
			font-weight: 300;
			margin-bottom: 16px;
		}

		.button-container {
			margin: 16px 0;
			display: flex;
			gap: 16px;
			margin-left: auto;
		}
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		main {
			flex-direction: column;
			width: 100%;
		}
	}
</style>
