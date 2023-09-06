<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { p5ValidationSchema } from '$models/minter/validation-schemas/p5-validation';
	import { generateP5Html } from '$lib/utils/p5Template';
	import Button from '$lib/components/Button.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Modal, { bind, type ModalType } from '$lib/components/Modal.svelte';
	import { getErrorList } from '$lib/utils/getErrorList';
	import { ipfsUrlToCid } from '$utils/ipfs';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import P5ScriptPreviewBox from '$lib/components/P5ScriptPreviewBox.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { getPreviewUrlForTokenId, pushPreviewsToIpfs, pushScriptToIpfs } from '$utils/p5js';
	import EditP5Advanced from '$lib/components/collections/EditP5Advanced.svelte';
	import ScriptEditor from '../script-editor/ScriptEditor.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import Form from '../form/Form.svelte';
	import NftEdit from './NftEdit.svelte';
	import type { P5NftConfig } from '$models/minter/nft-config';
	import type { FileWithPath } from '$models/minter/dropzone';

	/*
	TODO: Tooltip text
	*/
	export let close: () => void;
	export let nft: P5NftConfig;
	export let updateNft: (form: P5NftConfig) => void;

	let advancedMode = true;
	let iframeRef: HTMLIFrameElement;
	let scriptText = '';
	let initialScriptText = '';
	let p5Template = '';
	let scriptPreview = '';
	let errorList: { field: string; message: string }[];
	let formModal: ModalType;
	let captureModal: ModalType;
	let loadingScript = false;

	onMount(async () => {
		loadingScript = true;
		const url = ipfsUrlToCid(nft.script);
		const res = await axios.get(url, {
			headers: {
				apikey: import.meta.env.VITE_API_KEY,
			},
		});
		scriptText = res.data;
		initialScriptText = res.data;
		scriptPreview = getPreviewUrlForTokenId(nft, 1);
		loadingScript = false;
	});

	const { handleSubmit, errors, form, handleChange } = createForm<P5NftConfig>({
		initialValues: nft,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-use-before-define
		onSubmit,
		validationSchema: p5ValidationSchema,
	});

	function shouldPinScript() {
		return scriptText !== initialScriptText;
	}

	function shouldUpdatePreviews() {
		if (shouldPinScript()) return true;
		if (nft.totalSupply !== $form.totalSupply) return true;
	}

	async function onSubmit() {
		if (!scriptText) {
			errorList = [{ field: 'Script', message: 'Required' }];
			return;
		}
		if (shouldPinScript()) {
			$form.script = await pushScriptToIpfs(scriptText);
		}
		if (shouldUpdatePreviews()) {
			$form.ipfs = await pushPreviewsToIpfs($form, scriptText);
		}
		updateNft($form);
		close();
	}

	const handleScriptSelect = (acceptedFiles: FileWithPath[]) => {
		const reader = new FileReader();
		reader.readAsText(acceptedFiles[0]);
		reader.onload = (e) => {
			scriptText = e.target.result as string;
		};
	};

	const handleScriptDiscard = () => {
		p5Template = '';
		scriptText = '';
	};

	const renderSketch = () => {
		p5Template = generateP5Html(scriptText);
	};

	const openEditor = () => {
		formModal = bind(ScriptEditor, {
			close: () => {},
			script: scriptText,
			saveChanges: (script) => {
				scriptText = script;
			},
		});
	};

	errors.subscribe((value) => {
		const scriptErrors = getErrorList(value, { script: 'Script' });
		if (scriptErrors.length > 0) {
			errorList = scriptErrors;
		}
	});
</script>

<div class="container">
	<h2 class="header">Edit P5 NFT</h2>
	<Form onSubmit={handleSubmit}>
		{#if scriptPreview}
			<div class="previewImage">
				<img src={scriptPreview} alt="preview" />
			</div>
		{/if}
		<NftEdit bind:advancedMode errors={$errors} form={$form} {handleChange}>
			<h4 class="title">
				<PopInfo message="Tooltip text">p5.js NFT<small>*</small></PopInfo>
			</h4>
			<p class="add-text">
				Review the p5.js script to ensure the NFT rendering is as expected.
				<a href="https://p5js.org/"> Learn more. </a>
			</p>
			<div class="dropzone">
				<UploadDropzone
					info="Tooltip text"
					accept={['.js']}
					title="Upload Script"
					dropOverride={handleScriptSelect}
				/>
			</div>
			<Skeleton loading={loadingScript} width="100%" height="150px">
				<Textarea
					id="script"
					label="Script"
					placeholder="Provide script that needs to be executed"
					rows="5"
					maxHeight={400}
					bind:value={scriptText}
				/>
			</Skeleton>
			<div class="button-container">
				<Button buttonProps={{ type: 'button' }} size="md" on:click={openEditor}>Editor</Button>
				<Button
					buttonProps={{ type: 'button' }}
					type="tertiary"
					size="md"
					on:click={handleScriptDiscard}
				>
					Clear
				</Button>
				<Button buttonProps={{ type: 'button' }} size="md" on:click={renderSketch}>Play</Button>
			</div>
			{#if p5Template}
				<div class="preview">
					<P5ScriptPreviewBox bind:iframeRef script={p5Template} />
				</div>
			{/if}
			<div slot="advanced">
				<EditP5Advanced nft={$form} />
			</div>
		</NftEdit>
	</Form>
</div>
<Modal
	on:close={() => {
		errorList = undefined;
	}}
	show={errorList &&
		bind(FormErrorModal, {
			errorList,
		})}
/>
<Modal
	on:close={() => {
		formModal = undefined;
	}}
	show={formModal}
/>
<Modal
	on:close={() => {
		captureModal = undefined;
	}}
	show={captureModal}
	styleInnerContent={{ overflow: 'visible' }}
/>

<style lang="scss">
	.previewImage img {
		max-width: 500px;
		max-height: 300px;
		margin: 0 auto;
		display: block;
	}
	.container {
		display: flex;
		flex-direction: column;
		width: 536px;
		padding: 32px;

		.header {
			color: var(--text-header);
			margin: 0;
		}
		.dropzone {
			position: relative;
			margin-bottom: 16px;
			width: 100%;
			height: 100px;
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

		.add-text {
			color: var(--text-secondary);
			font-weight: 300;
			margin-bottom: 16px;
		}

		.button-container {
			margin: 16px 0;
			display: flex;
			gap: 16px;
			width: fit-content;
			margin-left: auto;
		}
		.preview {
			border-bottom: 1px solid var(--stroke-tertiary);
			width: 100%;
			max-width: 500px;
			height: 500px;
			margin: 16px auto;
			position: relative;
			display: flex;
			align-items: center;
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 700px) {
		.container {
			width: auto;
			padding: 16px;
		}
	}
</style>
