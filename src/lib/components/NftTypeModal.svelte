<script lang="ts">
	import DescriptiveNumberedButton from '$lib/create/DescriptiveNumberedButton.svelte';
	import { startIntroTour, startHint } from '$utils/introjs/intro-js';
	import CreateAdvancedCollection from './minter/create/CreateAdvancedCollection.svelte';
	import CreateImportJson from './minter/create/CreateImportJson.svelte';
	import CreateSimpleNft from './minter/create/CreateSimpleNft.svelte';
	import { openModal, bind } from './Modal.svelte';
	import type { Collection } from '$models/minter/collection-config';

	// TODO: Add in the link for the tutorials and documentation.

	export let close: () => void;
	export let createNft: (data: Collection) => Promise<void>;

	let introOptions: any;
	let hintOptions: any;
	const handleStartIntro = () => {
		if (introOptions) startIntroTour(introOptions);
		if (hintOptions) startHint(hintOptions);
	};

	const getIntro = (_introOptions, _hintOptions = null) => {
		introOptions = _introOptions;
		hintOptions = _hintOptions;
	};

	const createSingleNft = () => {
		openModal(bind(CreateSimpleNft, { createNft, getIntro, close }), {
			fullscreen: true,
			helpButton: true,
			handleStartIntro,
		});
		close();
	};
	const createAdvanced = () => {
		openModal(bind(CreateAdvancedCollection, { createNft, getIntro, close }), {
			fullscreen: true,
			helpButton: true,
			handleStartIntro,
		});
		close();
	};
	const createPfp = () => {
		// Shortcut to create an NFT with the PFP type.
		openModal(bind(CreateAdvancedCollection, { createNft, shortcutToPfp: true, getIntro, close }), {
			fullscreen: true,
			helpButton: true,
			handleStartIntro,
		});
		close();
	};

	const importConfigJson = () => {
		openModal(bind(CreateImportJson, { createNft, close }), { fullscreen: true });
		close();
	};

	const buttons: {
		title: string;
		description: string;
		onClick: () => void;
		disabled?: boolean;
	}[] = [
		{
			title: 'Editions',
			description: 'Create a limited edition series of a single artwork.',
			onClick: createSingleNft,
		},
		{
			title: 'Generative',
			description: 'Create a limited edition series where each NFT is unique, randomly generated.',
			onClick: createPfp,
		},
		{
			title: 'Advanced',
			description: 'Direct access to the collection, minting, and metadata definitions.',
			onClick: createAdvanced,
		},
		{
			title: 'Import',
			description: 'Import config json',
			onClick: importConfigJson,
		},
	];
</script>

<main>
	<h2>Select contract type</h2>
	<p>
		Welcome, select the type of Collection you want to create; each option below provides a workflow
		with a preview of the minting and marketplace experience. Our contracts support either EOA or a
		Treasury to route proceeds. It is recommended for splits involving more than 2 parties, create a
		dedicated splits contract, called Splitter.
		<a href="#/">Tutorials and documentation are available here.</a>
	</p>
	{#each buttons as button, number}
		<DescriptiveNumberedButton
			{...button}
			number={number + 1}
			visited={false}
			disabled={button.disabled}
		/>
	{/each}
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		padding: 8px;
		max-width: 600px;
	}
	h2 {
		color: var(--text-header);
	}
	p {
		font-weight: 300;
	}
</style>
