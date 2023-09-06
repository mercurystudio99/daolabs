<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	import Input from '$lib/components/Input.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { CaptureType, PlaybackType } from '$models/minter/nft-config';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	/*
	TODO: Tooltip text
	*/
	export let close;
	export let saveData: (capture, playback) => void;
	export let capture: {
		type: CaptureType;
		delay: string;
		repeat: string;
	};
	export let playback: {
		type: PlaybackType;
		value: string;
	};

	let errorList;
	const add = () => {
		if (playback.type === PlaybackType.TIMES && !playback.value) {
			errorList = [
				{
					field: 'Playback value',
					message: 'Please specify amount of times to play video',
				},
			];
		} else if (capture.type === CaptureType.DELAY && (!capture.delay || !capture.repeat)) {
			errorList = [
				{
					field: 'Capture timing',
					message: 'Please specify capture timing',
				},
			];
		} else {
			saveData(capture, playback);
			close();
		}
	};

	let captureOptions = [
		{ label: 'Restart each time', value: CaptureType.RESTART },
		{
			label: capture.delay
				? `Delay ${capture.delay} secs, every ${capture.repeat} seconds`
				: 'Delay',
			value: CaptureType.DELAY,
		},
	];

	let showCaptureInput = false;
	const handleCaptureTypeSelect = (e) => {
		showCaptureInput = e.detail.value === CaptureType.DELAY;
		if (capture.delay && capture.repeat) {
			captureOptions = [
				{ label: 'Restart each time', value: CaptureType.RESTART },
				{ label: 'Delay', value: CaptureType.DELAY },
			];
		}
	};

	const handleCaptureInput = () => {
		if (capture.delay && capture.repeat) {
			showCaptureInput = false;
			captureOptions = [
				{ label: 'Restart each time', value: CaptureType.RESTART },
				{
					label: `Delay ${capture.delay} secs, every ${capture.repeat} seconds`,
					value: CaptureType.DELAY,
				},
			];
		}
	};

	let playbackOptions = [
		{ label: 'Play once', value: PlaybackType.ONCE },
		{ label: 'Play n times', value: PlaybackType.TIMES },
		{ label: 'Repeat', value: PlaybackType.REPEAT },
	];

	let showPlaybackInput = false;
	const handlePlaybackTypeSelect = (e) => {
		showPlaybackInput = e.detail.value === PlaybackType.TIMES;
		if (playback.value) {
			playbackOptions = [
				{ label: 'Play once', value: PlaybackType.ONCE },
				{ label: 'Play n times', value: PlaybackType.TIMES },
				{ label: 'Repeat', value: PlaybackType.REPEAT },
			];
		}
	};

	const handlePlaybackInput = () => {
		showPlaybackInput = false;
		playbackOptions = [
			{ label: 'Play once', value: PlaybackType.ONCE },
			{ label: `Play ${playback.value} times`, value: PlaybackType.TIMES },
			{ label: 'Repeat', value: PlaybackType.REPEAT },
		];
	};

	const handleKeyDown = (e: KeyboardEvent, callback: any) => {
		if (e.key === 'Enter') {
			callback();
		}
	};
	$: disabled = !(capture.delay || capture.repeat || playback.value);
</script>

<section>
	<h2>Capture and playback</h2>
	<h4>
		<PopInfo message="TODO: Tooltip text">Capture</PopInfo>
	</h4>
	<div class="wrap">
		<div class="dropdown">
			<HoverDropdown
				options={captureOptions}
				bind:value={capture.type}
				on:select={handleCaptureTypeSelect}
				initial={capture.type}
			/>
		</div>
		{#if showCaptureInput}
			<div class="compound-input">
				<div class="input">
					<Input
						id="capture-delay"
						type="number"
						placeholder="10"
						on:blur={handleCaptureInput}
						bind:value={capture.delay}
						on:keydown={(e) => handleKeyDown(e, handleCaptureInput)}
					/>
				</div>
				<span class="text"> secs, every </span>
				<div class="input">
					<Input
						id="capture-repeat"
						type="number"
						placeholder="10"
						on:blur={handleCaptureInput}
						bind:value={capture.repeat}
						on:keydown={(e) => handleKeyDown(e, handleCaptureInput)}
					/>
				</div>
				<span class="text"> seconds </span>
			</div>
		{/if}
	</div>
	<h4>
		<PopInfo
			message="Select how many times your p5.js file will be played in marketplaces and wallets."
			>Playback</PopInfo
		>
	</h4>
	<div class="wrap">
		<div class="dropdown">
			<HoverDropdown
				options={playbackOptions}
				bind:value={playback.type}
				on:select={handlePlaybackTypeSelect}
				initial={playback.type}
			/>
		</div>
		{#if showPlaybackInput}
			<div class="input">
				<Input
					id="playback-times"
					type="number"
					placeholder="5"
					on:blur={handlePlaybackInput}
					bind:value={playback.value}
					on:keydown={(e) => handleKeyDown(e, handlePlaybackInput)}
				/>
			</div>
		{/if}
	</div>
	<Button size="md" type={disabled ? 'tertiary' : 'primary'} on:click={add}>Add</Button>
</section>

<Modal
	on:close={() => {
		errorList = undefined;
	}}
	show={errorList &&
		bind(FormErrorModal, {
			errorList,
		})}
/>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		max-width: 542px;
		width: min(542px, 75vw);
		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
		}

		h4 {
			color: var(--text-header);
		}

		.wrap {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			margin-bottom: 16px;

			.dropdown {
				width: 185px;
			}
			.compound-input {
				display: flex;
				align-items: center;

				.input {
					max-width: 50px;
				}

				.text {
					margin: 0 6px;
					font-weight: 400;
					font-size: 14px;
					color: var(--text-secondary);
				}
			}
		}
	}
</style>
