<script lang="ts">
	import { slide } from 'svelte/transition';
	import Icon from '$lib/components/Icon';

	import Input from '$lib/components/Input.svelte';
	import { PlaybackType } from '$models/minter/nft-config';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import FormBlock from './FormBlock.svelte';
	/*
	TODO: Tooltip text
	*/
	export let playback: { type: PlaybackType; value: string };

	if (!playback) {
		playback = { type: PlaybackType.ONCE, value: '' };
	}

	let valueEntered = false;
	const options = [
		{ label: 'Play once', value: PlaybackType.ONCE },
		{ label: 'Play n times', value: PlaybackType.TIMES },
		{ label: 'Repeat', value: PlaybackType.REPEAT },
	];

	let visibility = 'hidden';
	$: style = `--visibility: ${visibility};`;
	function selectedItem(optionValue) {
		playback.type = optionValue;
		visibility = 'hidden';
	}

	$: selectedOption = options.find((option) => option.value === playback.type) || options[0];
</script>

<FormBlock title="Playback" info={'Control playback behaviour for wallets and marketplaces.'}>
	<div class="container">
		<div class="dropdown">
			<div
				class="custom-select"
				on:mouseenter={() => (visibility = 'visible')}
				on:touchstart={() => (visibility = 'visible')}
				on:mouseleave={() => (visibility = 'hidden')}
				id="playback"
			>
				<div class="select-selected">
					{#if playback.type === PlaybackType.TIMES && valueEntered}
						Play
						<SeemlessInput
							bind:value={playback.value}
							size={playback.value.length || 1}
							style="width:auto"
						/>
						Times
					{:else}
						{selectedOption.label}
					{/if}
					<Icon name="chevronDown" />
				</div>
				<div class="dropdown" transition:slide={{ duration: 300 }} {style}>
					{#each options as option}
						<div
							class="select-item"
							class:active={option.value === playback.type}
							on:click={() => selectedItem(option.value)}
							on:keydown
						>
							{option.label}
						</div>
					{/each}
				</div>
			</div>
		</div>
		{#if playback.type === PlaybackType.TIMES && !valueEntered}
			<div class="input">
				<Input
					id="playback-times"
					placeholder="5"
					bind:value={playback.value}
					on:blur={() => (valueEntered = true)}
				/>
			</div>
		{/if}
	</div>
</FormBlock>

<style lang="scss">
	.container {
		display: flex;

		.dropdown {
			margin-right: 32px;
			flex-basis: 40%;

			.custom-select {
				width: 100%;
				position: relative;
				border-radius: 2px;
				border: 1px solid transparent;
				color: var(--text-secondary);
				&:hover {
					border: 1px solid var(--stroke-primary);
				}
				.dropdown {
					visibility: var(--visibility);
					position: absolute;
					width: 100%;
					margin-top: 1px;
					background: var(--background-l0);
					z-index: 900;
					box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%),
						0 9px 28px 8px rgb(0 0 0 / 5%);
				}
				.select-item {
					padding: 6px 12px;
					cursor: pointer;

					&:hover {
						background: var(--background-l2);
					}
				}

				.active {
					font-weight: 600;
				}

				.select-selected {
					background-color: transparent;
					color: var(--text-primary);
					font-weight: 400 !important;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 4px 12px;
				}
			}
		}
		.input {
			flex-basis: 50%;
		}
	}
</style>
