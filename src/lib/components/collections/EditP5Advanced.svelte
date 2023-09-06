<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Modal, { bind, type ModalType } from '$lib/components/Modal.svelte';
	// import EditP5CaptureModal from '$lib/components/minter/edit/EditP5CaptureModal.svelte';
	import EditP5Output from '$lib/components/minter/edit/EditP5Output.svelte';
	import type { P5NftConfig } from '$models/minter/nft-config';

	export let nft: P5NftConfig;
	let captureModal: ModalType;

	const updateOutput = (
		colors: string[],
		resolution: string,
		format: { type: string; format: string },
	) => {
		nft.defaultColor = colors[0];
		nft.outputResolution = resolution;
		nft.outputFormat = format;
	};

	const openOutputModal = () => {
		captureModal = bind(EditP5Output, {
			saveData: updateOutput,
			colors: [nft.defaultColor],
			resolution: nft.outputResolution,
			format: nft.outputFormat,
			close: () => {},
		});
	};

	// const updateCapture = (
	// 	capture: { type: CaptureType; delay: string; repeat: string },
	// 	playback: { type: PlaybackType; value: string },
	// ) => {
	// 	nft.capture = capture;
	// 	nft.playback = playback;
	// };

	// const openCaptureModal = () => {
	// 	captureModal = bind(EditP5CaptureModal, {
	// 		saveData: updateCapture,
	// 		capture: nft.capture,
	// 		playback: nft.playback,
	// 		close: () => {},
	// 	});
	// };

	$: outputButtonText = nft.defaultColor || nft.outputResolution ? 'Edit' : 'Add';
	// $: playbackValue =
	// 	nft.playback.type === PlaybackType.ONCE
	// 		? 'Play once'
	// 		: nft.playback.type === PlaybackType.TIMES
	// 		? `Play ${nft.playback.value} times`
	// 		: 'Repeat';
</script>

<!-- <h3>Capture and playback</h3>
<div class="modal-info">
	Capture:
	<span class="value">
		{#if nft.capture.type === CaptureType.DELAY}
			Delay {nft.capture.delay} seconds, every {nft.capture.repeat} seconds
		{:else}
			Restart every time
		{/if}
	</span>
	Playback:
	<span class="value">
		{playbackValue}
	</span>
</div>
<div class="modal-button">
	<Button
		buttonProps={{ type: 'button', id: 'capture' }}
		type="tertiary"
		size="md"
		on:click={openCaptureModal}
	>
		Edit
	</Button>
</div> -->
<h3>Output Settings</h3>
{#if nft.defaultColor || nft.outputResolution}
	<div class="modal-info">
		{#if nft.outputResolution}
			Resolution:
			<span class="value">
				{nft.outputResolution}
			</span>
		{/if}
		{#if nft.defaultColor}
			Color:
			<span class="value">
				{nft.defaultColor}
			</span>
		{/if}
		<!-- {#if nft.outputFormat}
			Format:
			<span class="value">
				{nft.outputFormat.type}
			</span>
		{/if} -->
	</div>
{/if}
<div class="modal-button">
	<Button
		buttonProps={{ type: 'button', id: 'output' }}
		type="tertiary"
		size="md"
		on:click={openOutputModal}
	>
		{outputButtonText}
	</Button>
</div>

<Modal
	on:close={() => {
		captureModal = undefined;
	}}
	show={captureModal}
	styleInnerContent={{ overflow: 'visible' }}
/>

<style>
	h3 {
		color: var(--text-header);
		font-size: 16px;
		margin-bottom: 16px;
	}
	.modal-button {
		padding-bottom: 16px;
		margin-bottom: 16px;
		border-bottom: 1px solid var(--stroke-tertiary);
		display: flex;
		flex-direction: column;
	}
	.modal-info {
		padding: 8px 12px;
		display: flex;
		flex-direction: column;
		border: 0.4px solid var(--stroke-tertiary);
		margin-bottom: 16px;
		color: var(--text-secondary);
	}
	.modal-info .value {
		font-weight: 300;
		margin-bottom: 4px;
	}
</style>
