<script lang="ts">
	import { format } from 'date-fns';
	import { onMount } from 'svelte';
	import InlineCalendar from '$lib/components/datepicker/components/InlineCalendar.svelte';
	// import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	import Input from '$lib/components/Input.svelte';
	import {
		type AdvancedCollection,
		RevealType,
		initialRevealConfig,
	} from '$models/minter/collection-config';
	import clickOutsideDirective from '$utils/clickOutside';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import Icon from '$lib/components/Icon';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	/*
	TODO: Tooltip text
	*/
	export let collection: AdvancedCollection;

	// NOTE: we don't bind revealChecked to collection.reveal because
	// we want handleRevealData to run before the binding happens
	let revealChecked = Boolean(collection.reveal);
	let selected: Date;
	let showCalendar = false;

	// eslint-disable-next-line
	const datePattern = "^(0?[1-9]|[1-2][0-9]|3[0-1]) [A-Za-z]{3} [0-9]{4} (([0-1][0-9])|(2[0-3])):[0-5][0-9]$";
	const failureStyles = {
		input: 'border: 1px solid var(--stroke-failure);',
	};
	let dateStyles = {};

	const handleImageSelect = (file: DropzoneOutput) => {
		collection.reveal.preRevealImage = ipfsCidUrl(file.pinInfo.IpfsHash);
	};

	const handleImageDisard = () => {
		collection.reveal.preRevealImage = '';
	};

	const handleRevealData = (e: CustomEvent & { target: { checked: Boolean } }) => {
		if (!e.target.checked) {
			collection.reveal = null;
			revealChecked = false;
		} else {
			collection.reveal = initialRevealConfig;
			revealChecked = true;
		}
	};

	const handleDateSelect = ({ detail }: { detail: { day: number | Date } }) => {
		collection.reveal.revealValue = format(detail.day, 'dd MMM yyyy HH:mm');
		dateStyles = { input: '' };
		showCalendar = false;
	};

	function checkValidity(e: FocusEvent) {
		const { value } = e.target as HTMLInputElement;
		if (value.match(datePattern)) {
			collection.reveal.revealValue = value;
			dateStyles = { input: '' };
		} else {
			dateStyles = failureStyles;
			collection.reveal.revealValue = null;
		}
	}

	onMount(() => {
		if (!collection.reveal?.revealValue?.match(datePattern)) {
			dateStyles = failureStyles;
		}
	});

	const theme = {
		calendar: {
			width: '280px',
			shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
		},
	};
</script>

<div class="additional-configuration">
	<h4>Additional collection configuration</h4>
	<p class="card-text">
		Define additional NFT Collection mechanics such as randomizing the Collection order or specify a
		reveal date for the NFTs.
	</p>
	<div class="options">
		<div class="option">
			<!-- TODO: When we reintroduce Auction, these should be disabled if auction set (and vice-versa, don't allow auction if these set.) -->
			<div class="checkbox-container">
				<Checkbox
					class="checkbox"
					type="checkbox"
					id="randomize"
					bind:checked={collection.randomize}
				/>
				<label for="randomize">Randomize NFT’s Collection</label>
			</div>
		</div>
		<div class="option">
			<div class="checkbox-container">
				<Checkbox
					class="checkbox"
					type="checkbox"
					id="reveal"
					checked={revealChecked}
					on:change={handleRevealData}
				/>
				<label for="reveal">Reveal NFTs on </label>
			</div>
			{#if revealChecked}
				<div class="dropdown">
					<!-- 	<HoverDropdown -->
					<!-- 		options={[ -->
					<!-- 			{ label: 'Date', value: RevealType.DATE }, -->
					<!-- 			{ label: 'Block', value: RevealType.BLOCK }, -->
					<!-- 		]} -->
					<!-- 		bind:value={collection.reveal.revealType} -->
					<!-- 	/> -->
				</div>
				{#if collection.reveal.revealType === RevealType.BLOCK}
					<div class="input">
						<Input
							id="block"
							name="block"
							placeholder="14886421"
							bind:value={collection.reveal.revealValue}
						/>
					</div>
				{:else}
					<div class="input">
						<Input
							id="block"
							name="block"
							placeholder="23 May 2023 00:00"
							bind:value={collection.reveal.revealValue}
							pattern={datePattern}
							on:blur={checkValidity}
							styles={dateStyles}
						/>

						<div class="calendar-icon" on:click={() => (showCalendar = true)} on:keydown>
							<Icon name="calendar" />
						</div>
						{#if showCalendar}
							<div
								class="calendar"
								use:clickOutsideDirective
								on:clickOutside={() => {
									showCalendar = false;
								}}
							>
								<InlineCalendar
									{theme}
									on:select={handleDateSelect}
									bind:selected
									start={new Date()}
									formatStr="dd MMM yyyy HH:mm"
									timepicker={true}
								/>
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
	{#if revealChecked}
		<div class="dropzone">
			<UploadDropzone
				label="Pre-reveal NFT Image"
				info="Tooltip text"
				accept={['.png', '.jpg', '.jpeg', '.gif', '.svg']}
				title="Upload Image"
				onDrop={handleImageSelect}
				preview={!!collection.reveal.preRevealImage}
				discard={handleImageDisard}
			>
				<img class="preview" src={collection.reveal.preRevealImage} alt="" />
			</UploadDropzone>
		</div>
	{/if}
</div>

<style lang="scss">
	.additional-configuration {
		border-top: 1px solid var(--stroke-tertiary);
		border-bottom: 1px solid var(--stroke-tertiary);
		padding: 16px 0;
		margin: 16px 0;

		h4 {
			margin-bottom: 16px;
			color: var(--text-header);
			font-weight: 400;
			font-size: 16px;
		}
	}
	.card-text {
		font-weight: 300;
		color: var(--text-secondary);
	}
	.options {
		display: flex;
		flex-direction: column;
		margin-bottom: 16px;
		.option {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			min-height: 32px;
			width: 100%;

			.checkbox-container {
				display: flex;
				align-items: center;
				font-weight: 300;
			}
			.dropdown {
				width: 100px;
				margin: 0 8px;
			}
			.input {
				flex-grow: 1;
				position: relative;

				.calendar-icon {
					position: absolute;
					right: 12px;
					top: 6px;
					font-size: 16px;
					color: var(--text-tertiary);
					cursor: pointer;
				}
				.calendar {
					position: absolute;
					z-index: 1002;
					width: 100%;
					display: flex;
					justify-content: flex-end;
					font-weight: 400;
				}
			}
		}
	}
	.preview {
		margin: 0 auto;
		max-height: 350px;
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 600px) {
		.options {
			.option {
				gap: 8px;

				.dropdown {
					margin: 0;
				}
				.input {
					width: 100%;
				}
			}
		}
	}
</style>
