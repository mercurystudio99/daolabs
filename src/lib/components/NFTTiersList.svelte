<script lang="ts">
	import CloseButton from '$lib/components/CloseButton.svelte';
	import Icon from '$lib/components/Icon';
	import { formatWad, fromWad } from '$utils/formatNumber';
	import AddMembershipTierModal from './AddMembershipTierModal.svelte';
	import { bind, openModal } from './Modal.svelte';
	import PopInfo from './PopInfo.svelte';
	import type { NFTTier } from 'src/app';

	export let nftTiers: NFTTier[];

	const followLink = (url: string) => {
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('target', '_blank');
		link.click();
	};

	const removeTier = (index: number) => {
		const [deletedTier] = nftTiers.splice(index, 1) || [];
		nftTiers = nftTiers;
		return deletedTier;
	};

	function editTier(tier: NFTTier, index: number) {
		if (tier) {
			const { price, ...rest } = tier;
			openModal(
				bind(AddMembershipTierModal, {
					tierForm: { ...rest, priceInput: fromWad(tier.price) },
					handleSave: (updatedTier: NFTTier) => {
						nftTiers = nftTiers.map((ctier, i) => (i === index ? updatedTier : ctier));
						nftTiers = nftTiers;
					},
				}),
			);
		}
	}
</script>

<slot name="header" />

{#if nftTiers && nftTiers?.length}
	<div class="box">
		<h3>
			<PopInfo message="membership tiers">Membership Tiers</PopInfo>
		</h3>
		{#each nftTiers as tier, index}
			<div class="nft-container" on:click|self={() => editTier(tier, index)} on:keydown>
				<div class="numbers" on:click={() => editTier(tier, index)} on:keydown>
					<span>
						>
						{formatWad(tier.price, {
							precision: 4,
						})} ETH
					</span>
					{#if Number(tier.maxSupply)}
						<span>
							>
							{tier.maxSupply} NFTs
						</span>
					{/if}
				</div>
				<div class="text" on:click={() => editTier(tier, index)} on:keydown>
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
				<img
					class="nft-preview"
					src={tier.file}
					alt=""
					on:click={() => editTier(tier, index)}
					on:keydown
				/>
				<CloseButton
					size="0.5rem"
					position="8px"
					on:click={() => removeTier(index)}
					color="--stroke-action-primary"
				/>
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;

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
