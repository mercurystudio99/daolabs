<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	import Input from '$lib/components/Input.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { PlaybackType } from '$models/minter/nft-config';
	import FormInput from '../form/FormInput.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	/*
	TODO: Tooltip text
	*/
	export let close;
	export let saveData: (resolution, playback) => void;
	export let playback: {
		type: PlaybackType;
		value: string;
	};
	export let resolution: string;

	let errorList;
	const add = () => {
		if (playback.type === PlaybackType.TIMES && !playback.value) {
			errorList = [
				{
					field: 'Playback value',
					message: 'Please specify amount of times to play video',
				},
			];
		} else {
			saveData(resolution, playback);
			close();
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
			{ label: `Play ${playback.value || 'n'} times`, value: PlaybackType.TIMES },
			{ label: 'Repeat', value: PlaybackType.REPEAT },
		];
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handlePlaybackInput();
		}
	};

	$: disabled = !(playback.type === 'Times' && !!playback.value) && !resolution;
</script>

<section>
	<h2>Playback</h2>
	<h4>
		<PopInfo message="Tooltip text">Playback</PopInfo>
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
					on:keydown={handleKeyDown}
				/>
			</div>
		{/if}
	</div>
	<FormInput
		id="output-resolution"
		label="Output Resolution"
		info="Tooltip text"
		placeholder="1000x1000"
		description="Output resolution"
		bind:value={resolution}
	/>
	<Button size="md" type={disabled ? 'tertiary' : 'primary'} on:click={add}>Save</Button>
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

			.input {
				max-width: 50px;
			}
		}
	}
</style>
