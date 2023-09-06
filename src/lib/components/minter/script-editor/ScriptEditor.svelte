<script lang="ts">
	import axios from 'axios';
	import Button from '$lib/components/Button.svelte';
	import { generateP5Html } from '$lib/utils/p5Template';
	import P5ScriptPreviewBox from '$lib/components/P5ScriptPreviewBox.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import Icon from '$lib/components/Icon';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { p5ScriptLibraryIpfs } from '$constants/p5ScriptLibraryIpfs';
	import { ipfsCidToWorkerUrl, ipfsUrlToCid } from '$utils/ipfs';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import Codemirror from './Codemirror.svelte';

	export let script: string;
	export let saveChanges: (script: string) => void;
	export let close: () => void;

	const save = () => {
		saveChanges(script);
		close();
	};

	let showResult = false;
	let p5Template = '';

	const play = () => {
		showResult = true;
		// TODO: cloud use function
		p5Template = generateP5Html(script);
	};

	const restart = () => {
		p5Template = '';
		// TODO: cloud use function
		setTimeout(() => {
			p5Template = generateP5Html(script);
		}, 0);
	};

	const options = p5ScriptLibraryIpfs.map((el) => ({
		label: el.name,
		value: el.script,
	}));
	let value: string;
	let loadingScript = false;
	const handleSelect = async (e: CustomEvent) => {
		const scriptCid: string = e.detail.value;
		loadingScript = true;
		const url = ipfsCidToWorkerUrl(ipfsUrlToCid(scriptCid));
		const res = await axios.get(url, {
			headers: {
				apikey: import.meta.env.VITE_API_KEY,
			},
		});
		script = res.data;
		loadingScript = false;
		play();
	};
</script>

<main>
	<h2>p5.js Script Editor</h2>
	<div class="library">
		<div class="header">
			<h4>Scripts library</h4>
			<Popover placement="right" message="Built in scripts">
				<Icon name="questionCircle" />
			</Popover>
		</div>
		<div class="dropdown">
			<Dropdown
				{options}
				placeholder="Select script"
				bind:value
				on:select={handleSelect}
				maxHeight="300px"
			/>
		</div>
	</div>
	<div class="header">
		<h4>P5.js script</h4>
		<Popover placement="right" message="P5.js script">
			<Icon name="questionCircle" />
		</Popover>
	</div>
	<p class="add-text">
		Review the p5.js script to ensure the NFT rendering is as expected.
		<a href="https://p5js.org/"> Learn more. </a>
	</p>
	<div class="hint" />
	<div class="pane-wrapper">
		<Skeleton loading={loadingScript} width="100%" height="500px">
			<Codemirror value={script} />
		</Skeleton>
		<div class="preview">
			{#if showResult}
				<P5ScriptPreviewBox script={p5Template} />
			{/if}
		</div>
	</div>

	<div class="button-container">
		{#if !showResult}
			<Button buttonProps={{ type: 'button' }} type="primary" size="md" on:click={play}>
				Play
			</Button>
		{:else}
			<Button buttonProps={{ type: 'button' }} type="primary" size="md" on:click={restart}>
				Restart
			</Button>
		{/if}
		<Button
			buttonProps={{ type: 'button' }}
			type={script ? 'primary' : 'secondary'}
			size="md"
			on:click={save}
		>
			Save
		</Button>
	</div>
</main>

<style lang="scss">
	main {
		width: calc(100vw - 96px);
		height: calc(100vh - 8rem);
		display: flex;
		flex-direction: column;

		h2 {
			color: var(--text-header);
			font-size: 28px;
		}

		.button-container {
			margin-top: 16px;
			display: flex;
			gap: 16px;
			width: fit-content;
			margin-left: 28px;
		}
	}

	.pane-wrapper {
		display: flex;
		height: calc(100vh - 25rem);
	}

	.preview {
		margin: 0 32px;
		width: 600px;
		align-self: center;
		display: flex;
	}

	.library {
		padding-bottom: 20px;
		border-bottom: 2px solid var(--stroke-tertiary);
	}
	.header {
		display: flex;
		gap: 10px;
		color: var(--text-header);
		margin-top: 10px;
		h4 {
			color: var(--text-header);
		}
	}
	.dropdown {
		max-width: 300px;
	}
	.add-text {
		color: var(--text-secondary);
		font-weight: 300;
		margin-bottom: 16px;
	}

	@media (max-width: 768px) {
		.pane-wrapper {
			flex-direction: column;
			gap: 32px;
			height: 100%;
		}
	}
</style>
