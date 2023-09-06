<!-- TODO: delete this file -->
<script lang="ts">
	import { deepCopy } from 'ethers/lib/utils.js';
	import { getContext } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import Icon from '$lib/components/Icon';
	import Input from '$lib/components/Input.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { ThresholdType, type NftReward } from '$models/nft-reward';
	import { ipfsCidUrl } from '$utils/ipfs';
	import type { DropzoneOutput, FileWithPath } from '$models/dropzone';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';
	import type { Dirty } from 'src/app';
	/*
	TODO: Tooltip text
	*/
	export let close: () => void;
	export let handleSave: () => void = null;

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');
	const dirty: Dirty = getContext('SHOW_DIRTY');
	const initialState: NftReward = {
		thresholdType: undefined,
		threshold: undefined,
		file: '',
		name: '',
		link: '',
		description: '',
		supply: undefined,
	};
	let tiers: NftReward[] = deepCopy($project.nftRewards);
	let tierForm: NftReward;
	let mediaType: 'Image' | 'Video';

	$: {
		dirty?.check(initialState, tierForm || initialState);
	}
	const save = () => {
		$project.nftRewards = tiers;
		close();
	};

	const addNewTier = () => {
		tierForm = { ...initialState };
	};

	const handleFileSelect = (file: DropzoneOutput, acceptedFiles: FileWithPath[]) => {
		const format: string = acceptedFiles[0].name.split('.').pop().toUpperCase();
		switch (format) {
			case 'JPG':
			case 'JPEG':
			case 'PNG':
			case 'JIF':
				mediaType = 'Image';
				break;
			case 'MP4':
			case 'WEBM':
				mediaType = 'Video';
				break;
		}
		tierForm.file = ipfsCidUrl(file.pinInfo.IpfsHash);
	};
	const handleFileDiscard = () => {
		tierForm.file = '';
	};

	const saveTier = () => {
		if (
			tierForm.file &&
			(tierForm.threshold ||
				(tierForm.thresholdType === ThresholdType.SUPPORTERS && tierForm.supply)) &&
			tierForm.name
		) {
			tiers = [...tiers, tierForm];
			tierForm = undefined;
		}
	};

	const followLink = (url: string) => {
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('target', '_blank');
		link.click();
	};

	const removeTier = (index: number) => {
		tiers.splice(index, 1);
		tiers = tiers;
	};
</script>

<slot name="header" />

<HeavyBorderBox padding="16px 32px" margin="32px">
	<div class="box">
		<h2>Add NFT reward</h2>
		<p>
			Encourage treasury contributions by offering a reward NFT to early supporters or people who
			contribute above a certain threshold.
		</p>
		{#each tiers as tier, index}
			<div class="nft-container">
				<div class="numbers">
					{#if tier.thresholdType === ThresholdType.AMOUNT}
						<span>
							> {tier.threshold} ETH
						</span>
						{#if tier.supply}
							<span>
								&#931 {tier.supply} NFTs
							</span>
						{/if}
					{:else}
						<span>
							&#931 {tier.supply} NFTs
						</span>
					{/if}
				</div>
				<div class="text">
					<span>
						{tier.name}
						{#if tier.link}
							<div class="link-icon" on:click={() => followLink(tier.link)} on:keydown>
								<Icon name="link" />
							</div>
						{/if}
					</span>
					<span class="description">
						{tier.description}
					</span>
				</div>
				<img class="nft-preview" src={tier.file} alt="" />
				<CloseButton
					size="6px"
					position="8px"
					on:click={() => removeTier(index)}
					color="--stroke-action-primary"
				/>
			</div>
		{/each}
		{#if tierForm}
			<h4>
				<PopInfo message="Tooltip text">Tier criteria</PopInfo>
			</h4>
			{#if tierForm.thresholdType === ThresholdType.AMOUNT}
				<div class="input-container">
					Reward people who contributed at least
					<div class="input">
						<Input bind:value={tierForm.threshold} placeholder="0.5" type="number" />
					</div>
					<span>ETH</span>
				</div>
				<div class="input-container">
					Total supply at this tier
					<div class="input">
						<Input bind:value={tierForm.supply} placeholder="100" type="number" />
					</div>
					<span>NFTs</span>
				</div>
			{:else if tierForm.thresholdType === ThresholdType.SUPPORTERS}
				<div class="supporters-container">
					Reward first
					<div class="input">
						<Input bind:value={tierForm.supply} placeholder="100" type="number" />
					</div>
					<span> people who contributed </span>
				</div>
			{:else}
				<Dropdown
					bind:value={tierForm.thresholdType}
					options={[
						{ label: 'Early supporters', value: ThresholdType.SUPPORTERS },
						{ label: 'People who contributed certain amount', value: ThresholdType.AMOUNT },
					]}
					placeholder="Early supporters"
					initial="null"
				/>
			{/if}
			<h4>
				<PopInfo message="Tooltip text">NFT</PopInfo>
			</h4>
			<UploadDropzone
				accept={['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.webm']}
				title="Upload an image or video"
				onDrop={handleFileSelect}
				preview={!!tierForm.file}
				discard={handleFileDiscard}
			>
				{#if mediaType === 'Image'}
					<img class="preview" src={tierForm.file} alt="" />
				{:else if mediaType === 'Video'}
					<!-- svelte-ignore a11y-media-has-caption -->
					<video src={tierForm.file} />
				{/if}
			</UploadDropzone>
			<h4>
				<PopInfo message="Tooltip text">Name</PopInfo>
			</h4>
			<Input bind:value={tierForm.name} placeholder="Nft name" />
			<h4>
				<PopInfo message="Tooltip text">External link</PopInfo>
			</h4>
			<Input bind:value={tierForm.link} placeholder="https://app.bannyverse.xyz" />
			<h4>
				<PopInfo message="Tooltip text">Description</PopInfo>
			</h4>
			<Textarea
				id={'teirform-description'}
				bind:value={tierForm.description}
				placeholder="Description"
			/>
			<div class="add-button">
				<Button size="md" on:click={saveTier}>Add NFT reward</Button>
			</div>
		{:else}
			<Button size="md" type="tertiary" on:click={addNewTier}>Add tier</Button>
		{/if}
	</div>
</HeavyBorderBox>

{#if !handleSave}
	<Button size="md" on:click={save}>Save extensions configuration</Button>
{/if}

<style lang="scss">
	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;

		h2 {
			color: var(--text-header);
			margin: 0;
		}

		p {
			color: var(--text-secondary);
			font-weight: 300;
			margin: 0;
		}

		h4 {
			color: var(--text-header);
			margin: 0;
		}

		.input-container {
			display: flex;
			font-weight: 300;
			align-items: center;
			color: var(--text-secondary);

			.input {
				flex-shrink: 2;
				min-width: 70px;
				max-width: 100px;
				height: 32px;
				margin-left: auto;
				margin-right: 4px;
				color: var(--text-primary);
			}

			span {
				min-width: 34px;
				text-align: end;
			}
		}

		.supporters-container {
			display: flex;
			font-weight: 300;
			align-items: center;
			justify-content: space-between;
			color: var(--text-secondary);

			.input {
				min-width: 70px;
				height: 32px;
				margin-left: auto;
				margin-right: auto;
				color: var(--text-primary);
			}

			span {
				text-align: end;
			}
		}

		.preview {
			width: 100%;
		}

		.add-button {
			margin-left: auto;
		}

		.nft-container {
			position: relative;
			padding: 8px 16px;
			display: flex;
			gap: 16px;
			font-weight: 300;
			background: var(--background-l0);
			border: 0.4px solid var(--stroke-secondary);

			.numbers {
				color: var(--text-action-primary);
				display: flex;
				flex-direction: column;
				gap: 4px;

				span {
					display: flex;
					gap: 16px;
					white-space: nowrap;
				}
			}
			.text {
				display: flex;
				flex-direction: column;
				gap: 4px;
				color: var(--text-secondary);

				span {
					display: flex;
					align-items: center;
				}

				.link-icon {
					display: flex;
					margin-left: 8px;
					cursor: pointer;
				}

				.description {
					font-size: 10px;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 3;
					line-clamp: 3;
					-webkit-box-orient: vertical;
					word-break: break-all;
				}
			}
			.nft-preview {
				min-width: 80px;
				height: 80px;
				margin-left: auto;
				margin-top: auto;
				margin-bottom: auto;
			}
		}
	}
</style>
