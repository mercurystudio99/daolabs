<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import axios from 'axios';
	import { ipfsCidToWorkerUrl, ipfsUrlToCid, replaceIpfsDomain } from '$utils/ipfs';
	import { getNewRandomNumber } from '$utils/numbers';
	import { loadSunvoxLibrary } from '$utils/svlib';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import Icon from '$lib/components/Icon';
	import Img from '$lib/components/Img.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Record from '$lib/components/Record.svelte';
	import AudioControlIcons from '../icons/AudioControlIcons.svelte';
	import Slider from '../slider/Slider.svelte';
	import type { MusicTrack } from '$models/minter/music-player';

	export let cover: string = '';
	export let tracks: MusicTrack[] = [];
	export let currentTrack = 0;
	export let editable = false;
	export let discardTrack: (index: number) => void = () => {};

	let loop = false;
	let volume = 1;
	let paused = true;
	let mixed = false;
	let player: HTMLAudioElement;
	let duration: number;
	let currentTime = 0;

	$: isSunvoxPlayer = tracks[currentTrack]?.isSunvox;

	onMount(() => {
		if (tracks.length > 1) {
			tracks.forEach((track) => {
				if (!track.duration && !track.isSunvox) {
					const audio = new Audio();
					audio.src = track.file;
					audio.onloadedmetadata = () => {
						track.duration = audio.duration;
						tracks = tracks;
					};
				}
			});
		}
	});
	onDestroy(() => {
		if (isSunvoxPlayer && !paused) {
			// @ts-ignore
			// eslint-disable-next-line no-undef
			sv_stop(0);
		}
	});

	let listRef: HTMLDivElement;
	const scrollNext = () => {
		listRef.scrollBy(0, 76);
	};

	const formatTime = (time: number): string => {
		if (!time) {
			return '0:00';
		}
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};
	const play = () => {
		if (isSunvoxPlayer) {
			// @ts-ignore
			// eslint-disable-next-line no-undef
			sv_play(0);
			paused = false;
		} else {
			player.play().catch((e) => console.log(e));
		}
	};
	const pause = () => {
		if (isSunvoxPlayer) {
			// @ts-ignore
			// eslint-disable-next-line no-undef
			sv_stop(0);
			paused = true;
		} else {
			player.pause();
		}
	};
	const changeVolume = ({ currentTarget }) => {
		if (isSunvoxPlayer) {
			// @ts-ignore
			// eslint-disable-next-line no-undef
			sv_volume(0, currentTarget.value * 100);
		}
		volume = Number(currentTarget.value);
	};
	const seek = ({ currentTarget }) => {
		if (isSunvoxPlayer) {
			// @ts-ignore
			// eslint-disable-next-line no-undef
			sv_rewind(0, currentTarget.value);
			currentTime = currentTarget.value;
			if (paused) {
				// @ts-ignore
				// eslint-disable-next-line no-undef
				sv_play(0);
				paused = false;
			}
		} else {
			player.pause();
			currentTime = currentTarget.value;
			player.play().catch((e) => console.log(e));
		}
	};

	const discardCover = () => {
		cover = '';
	};

	let loading = false;
	let sunvoxTimer: NodeJS.Timer;

	const loadSunvoxTrack = async (file: string) => {
		clearInterval(sunvoxTimer);
		loading = true;
		const url = ipfsCidToWorkerUrl(ipfsUrlToCid(file));
		const res = await axios.get(url, {
			headers: {
				apikey: import.meta.env.VITE_API_KEY as string,
			},
			responseType: 'arraybuffer',
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const byteArray = new Uint8Array(res.data);
		// @ts-ignore
		// eslint-disable-next-line no-undef
		sv_load_from_memory(0, byteArray);
		// duration = sv_get_song_length_lines(0);
		// sunvoxTimer = setInterval(() => {
		// 	//@ts-ignore
		// 	currentTime = sv_get_current_line(0);
		// }, 1000);
		loading = false;
	};

	const checkAndLoadSunvox = async (_length: number, current: number) => {
		if (tracks.some((track) => track.isSunvox)) {
			loadSunvoxLibrary();
		}
		if (tracks[current]?.isSunvox) {
			await loadSunvoxTrack(tracks[current].file);
		}
	};

	const switchTrack = async (index: number) => {
		let newIndex = index;
		if (index < 0) {
			newIndex = tracks.length - 1;
		}
		if (index === tracks.length) {
			newIndex = 0;
		}
		currentTrack = newIndex;
		if (isSunvoxPlayer) {
			pause();
			await loadSunvoxTrack(tracks[newIndex].file);
		} else {
			player.autoplay = true;
		}
	};

	const handleNext = () => {
		if (loop) {
			return;
		}
		let next = currentTrack + 1;
		if (mixed) {
			next = getNewRandomNumber(currentTrack, 0, tracks.length - 1);
		}
		switchTrack(next).catch((e) => console.log(e));
	};

	const closeButtonClicked = () => {
		discardTrack(currentTrack);
		switchTrack(0).catch((e) => console.log(e));
	};

	$: checkAndLoadSunvox(tracks.length, currentTrack).catch((e) => console.log(e));
</script>

<div class="player-container">
	<div class="cover-container" style="background-color: gray" class:missing={!cover}>
		{#if cover}
			{#if editable}
				<CloseButton size="0.7rem" position="5px" on:click={discardCover} />
			{/if}
			<Img
				styles={{
					width: '100%',
					borderRadius: '10px',
					background: 'var(--background-player-cover)',
				}}
				src={replaceIpfsDomain(cover)}
				alt={ipfsUrlToCid(cover)}
				placeholder="https://via.placeholder.com/200?text=..."
			/>
		{:else}
			<Record />
		{/if}
	</div>
	{#if tracks.length > 1}
		<div class="tracks-container">
			<div class="track-list" bind:this={listRef}>
				{#each tracks as track, index}
					<div
						class="track"
						class:current={currentTrack === index}
						on:click={() => switchTrack(index)}
						on:keydown
					>
						<div class="row">
							{`${index + 1}. ${track.name}`}
							{#if !isSunvoxPlayer}
								<span class="duration">{formatTime(track.duration)}</span>
							{/if}
						</div>
						<span class="artist-name">
							{track.artist}
						</span>
					</div>
					<div class="divider" />
				{/each}
			</div>
			{#if tracks.length > 3}
				<div class="arrow-down" on:click={scrollNext} on:keydown>
					<Icon name="chevronDown" />
				</div>
			{/if}
		</div>
	{/if}
	{#if loading}
		<Loading fullWidth />
	{:else if tracks.length > 0}
		<div class="player">
			{#if editable}
				<CloseButton size="0.7rem" position="5px" on:click={closeButtonClicked} />
			{/if}

			{#if !isSunvoxPlayer}
				<audio
					src={tracks[currentTrack].file}
					preload="metadata"
					{loop}
					bind:this={player}
					bind:currentTime
					bind:volume
					bind:paused
					bind:duration
					on:ended={handleNext}
				/>
				<div class="progress">
					<div class="timers">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration)}</span>
					</div>
					<Slider bind:value={currentTime} id="progress" on:input={seek} bind:max={duration} />
				</div>
			{/if}
			<div class="controls">
				<div class="icon" class:active={loop} on:click={() => (loop = !loop)} on:keydown>
					<AudioControlIcons iconName="repeat" />
				</div>
				{#if tracks.length > 1}
					<div class="icon" on:click={() => switchTrack(currentTrack - 1)} on:keydown>
						<AudioControlIcons iconName="previous" />
					</div>
				{/if}
				{#if paused}
					<div class="icon" on:click={play} on:keydown>
						<AudioControlIcons iconName="play" />
					</div>
				{:else}
					<div class="icon" on:click={pause} on:keydown>
						<AudioControlIcons iconName="pause" />
					</div>
				{/if}
				{#if tracks.length > 1}
					<div class="icon" on:click={() => switchTrack(currentTrack + 1)} on:keydown>
						<AudioControlIcons iconName="next" />
					</div>
				{/if}
				<div class="icon" class:active={mixed} on:click={() => (mixed = !mixed)} on:keydown>
					<AudioControlIcons iconName="mix" />
				</div>
			</div>
			<div class="volume">
				<div class="icon">
					<AudioControlIcons iconName="volumeMin" />
				</div>
				<Slider bind:value={volume} id="volume" on:input={changeVolume} max={1} step={0.01} />
				<div class="icon">
					<AudioControlIcons iconName="volumeMax" />
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.player-container {
		display: flex;
		flex-direction: column;
		max-width: 650px;
		min-width: 300px;
		.cover-container {
			position: relative;
			padding: 26px;
			border-radius: 10px;
			box-shadow: inset 0px 0px 100px 100px var(--background-l0);
			width: 100%;
		}
		.missing {
			display: flex;
			align-items: center;
			justify-content: center;
			aspect-ratio: 1;
			border: 0.4px solid rgba(0, 0, 0, 0.2);
			font-size: 100px;
			color: rgba(245, 163, 18, 0.24);
			height: 500;
		}
		.tracks-container {
			width: 100%;
			background: var(--background-l0);
			border-radius: 10px;
			padding: 8px 0;

			.track-list {
				max-height: 215px;
				overflow: scroll;
				display: flex;
				flex-direction: column;
				-ms-overflow-style: none;
				scrollbar-width: none;

				&::-webkit-scrollbar {
					display: none;
				}

				.divider {
					margin: 8px 16px;
					min-height: 2px;
					background-color: var(--stroke-tertiary);
				}

				.track {
					padding: 12px 32px;
					font-size: 14px;
					line-height: 16px;
					cursor: pointer;

					.row {
						display: flex;
						justify-content: space-between;

						.duration {
							color: var(--text-tertiary);
						}
					}
					.artist-name {
						color: var(--text-secondary);
					}
				}
				.current {
					background: var(--background-player-active);
				}
			}
			.arrow-down {
				color: white;
				font-size: 16px;
				width: fit-content;
				border-radius: 50%;
				background-color: #808285;
				display: flex;
				align-content: center;
				justify-content: center;
				cursor: pointer;
				margin: 8px auto 0 auto;
			}
		}
		.player {
			position: relative;
			width: 100%;
			display: flex;
			flex-direction: column;
			background: var(--background-l0);
			border-radius: 10px;
			padding: 5%;

			.progress {
				display: flex;
				flex-direction: column;

				.timers {
					display: flex;
					justify-content: space-between;
					font-size: 11px;
					font-weight: 500;
					color: var(--text-tertiary);
					margin-bottom: 14px;
				}
			}
			.controls {
				display: flex;
				justify-content: space-between;
				width: 160px;
				min-height: 24px;
				margin: 8px auto;
				align-items: center;
				color: #808285;
			}
			.icon {
				cursor: pointer;
				display: flex;
				padding: 4px;
			}
			.active {
				background-color: var(--background-player-active);
			}
			.volume {
				display: flex;
				gap: 16px;
				width: 100%;
				align-items: center;
			}
		}
	}
</style>
