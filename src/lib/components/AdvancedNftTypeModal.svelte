<script lang="ts">
	import { fly } from 'svelte/transition';
	import DescriptiveNumberedButton from '$lib/create/DescriptiveNumberedButton.svelte';
	import { NftType } from '$models/minter/nft-config';
	import { TokenStandard } from '$models/minter/token-standard';
	import { userdata } from '$utils/firebase';
	import { saveUserFirebase, type User } from '$utils/users/user';
	import { layouts } from '$constants/styles/layouts';
	import Checkbox from './Checkbox.svelte';
	import Icon from './Icon';

	export let close;
	export let openNftCreationModal: (type: NftType, standard: TokenStandard) => void;

	let mute = false;
	let type: NftType;
	let showStandardSelection = false;

	const openDrawer = async (standard: TokenStandard) => {
		if (mute) {
			const user: User = { ...$userdata, nftSettings: { nftType: type, tokenStandard: standard } };
			await saveUserFirebase($userdata.uid, user);
		}
		openNftCreationModal(type, standard);
		close();
	};

	const next = (value: NftType) => {
		// TODO: We are temporarily disabling ERC1155 support
		// if (type === value) {
		// 	type = undefined;
		// 	showStandardSelection = false;
		// } else {
		// 	type = value;
		// 	showStandardSelection = true;
		// }

		type = value;
		void openDrawer(TokenStandard.ERC721);
	};

	const back = () => {
		type = undefined;
		showStandardSelection = false;
	};

	const buttons = [
		{
			title: 'Image',
			description: 'Create an Image NFT.',
			disabled: false,
			onClick: () => next(NftType.IMAGE),
			type: NftType.IMAGE,
		},
		{
			title: 'Music',
			description: 'Create a Music or a Music album NFT.',
			disabled: false,
			onClick: () => next(NftType.MUSIC),
			type: NftType.MUSIC,
		},
		{
			title: 'Video',
			description: 'Create a Video NFT.',
			disabled: false,
			onClick: () => next(NftType.VIDEO),
			type: NftType.VIDEO,
		},
		{
			title: 'p5.js',
			description: 'Create a p5.js NFT.',
			disabled: false,
			onClick: () => next(NftType.P5JS),
			type: NftType.P5JS,
		},
		{
			title: 'PFP',
			description:
				'The NFT PFP Builder helps creators launch their projects from scratch with No Code. Our UI Builder automatically and randomly synthesizes image layers & uploads images and metadata on IPFS.',
			onClick: () => next(NftType.PFP),
			type: NftType.PFP,
		},
	];

	const standardButtons = [
		{
			title: 'ERC-721',
			description:
				'ERC-721 are common for each asset to be its own unique token. Adding a supply with the same asset is common for memberships.',
			disabled: false,
			onClick: () => openDrawer(TokenStandard.ERC721),
		},
		{
			title: 'ERC-1155',
			description:
				'ERC-1155 shares the same metadata across multiple tokens and is common for an asset series.',
			disabled: false,
			onClick: () => openDrawer(TokenStandard.ERC1155),
		},
	];

	const isMobile = window.innerWidth < layouts.screen.md;
</script>

<main class:expanded={!isMobile && showStandardSelection}>
	<h2>Start creating NFTs</h2>
	<!-- TODO: link to documentation -->
	<p>
		Congrats, you’ve just created NFT Collection. Now select the type of NFT you would like to
		create. Tutorials and documentation are available <a href="/user">here</a>.
	</p>
	<div class="buttons">
		{#if !isMobile || !showStandardSelection}
			<section>
				{#each buttons as button, number}
					<div class:shaded={showStandardSelection && type !== button.type}>
						<DescriptiveNumberedButton
							{...button}
							number={number + 1}
							visited={false}
							disabled={button.disabled}
						/>
					</div>
				{/each}
			</section>
		{/if}
		{#if showStandardSelection}
			<section in:fly>
				{#if isMobile}
					<div class="back-icon" on:click={back} on:keydown>
						<Icon name="collectionBack" viewBox="0 0 18 16" />
						<h3>{type}</h3>
					</div>
				{/if}
				{#each standardButtons as button, number}
					<DescriptiveNumberedButton
						{...button}
						number={number + 1}
						visited={false}
						disabled={button.disabled}
					/>
				{/each}
			</section>
		{/if}
	</div>
	<div class="checkbox">
		<Checkbox bind:checked={mute} />
		Do not ask me again.
	</div>
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		padding: 8px;
		max-width: 558px;
	}

	.expanded {
		max-width: 1116px;

		.buttons {
			section {
				flex-basis: 50%;
			}
		}
	}
	h2 {
		color: var(--text-header);
	}
	p {
		font-weight: 300;
	}

	.checkbox {
		display: flex;
		margin-top: 8px;
		color: var(--text-secondary);
		font-weight: 300;
	}

	.buttons {
		display: flex;
		gap: 16px;

		.shaded {
			background-color: var(--background-l1);
		}

		section {
			max-width: 542px;

			.back-icon {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				position: relative;
				top: 0;
				left: 0px;
				font-size: 18px;
				cursor: pointer;
				color: var(--text-action-primary);
				margin-bottom: 8px;

				h3 {
					margin-bottom: 0px;
				}
			}
		}
	}
</style>
