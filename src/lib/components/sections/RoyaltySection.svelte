<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import EditCollectionRoyaltiesModal from '$lib/components/minter/edit/EditCollectionRoyaltiesModal.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import { recipientsFromRevenueSplit } from '$models/minter/pricing';
	import { isRevenueSplitDeployed } from '$utils/deployRevenueSplitHelpers';
	import { isRevenueSplit, type RevenueSplit } from '$models/user/revenue-splits';
	import { formatDate } from '$utils/formatDate';
	import { getTruncatedAddress } from '$lib/utils/getTruncatedAddress';
	import { layouts } from '$constants/styles/layouts';
	import CloseButton from '../CloseButton.svelte';
	import PayoutReceivers from '../revenue-split/PayoutReceivers.svelte';
	import DeployRevenueSplit from '../revenue-split/DeployRevenueSplit.svelte';
	import EnsOrAddress from '../EnsOrAddress.svelte';
	import CollectionSection from './CollectionSection.svelte';
	import type { Royalty } from '$models/minter/collection-config';

	export let royalty: Royalty;
	export let updateRoyalty: (royalty: Royalty, forceUpdate: boolean) => void;
	export let deleteRoyalty: () => void;
	export let updateNestedModal: (nestedModal) => void = null;
	export let unsaved: boolean;
	export let readonly = false;

	const openRoyaltiesModal = () => {
		let nestedModal = bind(EditCollectionRoyaltiesModal, {
			saveData: (r: Royalty) => updateRoyalty(r, false),
			royalty: royalty,
			close: () => {},
		});
		if (updateNestedModal) {
			updateNestedModal(nestedModal);
		} else {
			openModal(nestedModal);
		}
	};

	const handleSplitDeployment = (e: CustomEvent<{ deployed: RevenueSplit }>) => {
		royalty.creator_address = e.detail.deployed;
		updateRoyalty(royalty, true);
	};

	$: buttonText = royalty ? 'Edit' : 'Add';
	$: royaltySplitDeployed = readonly || isRevenueSplitDeployed(royalty?.creator_address);

	let innerWidth: number = 1000;
	$: truncate = innerWidth < layouts.screen.sm;
</script>

<svelte:window bind:innerWidth />

<CollectionSection title="Royalties">
	{#if royalty}
		<div class="royalties-list">
			<div class="royalty">
				{#if !royaltySplitDeployed}
					<CloseButton size="0.5rem" position="0.2rem" on:click={deleteRoyalty} />
				{/if}
				<div class="row">
					<div class="royalty-input">
						<Input
							value={royalty.royalty}
							style="text-align: center; color: var(--text-secondary);"
							disabled
							{readonly}
						>
							<span slot="addon">%</span>
						</Input>
					</div>
					<div class="address-input">
						{#if isRevenueSplit(royalty.creator_address)}
							<PayoutReceivers
								label=""
								recipients={recipientsFromRevenueSplit(royalty.creator_address)}
								review={true}
							/>
						{:else}
							<Input
								type="address"
								style="color: var(--text-secondary);"
								value={truncate
									? getTruncatedAddress(royalty.creator_address)
									: royalty.creator_address}
								{readonly}
							/>
						{/if}
					</div>
				</div>
				{#if isRevenueSplit(royalty.creator_address) && royalty.creator_address.address}
					<div class="row right">
						<span
							>Deployed {royalty.creator_address.deployedAt
								? formatDate(royalty.creator_address.deployedAt)
								: ''} to
						</span>
						<EnsOrAddress address={royalty.creator_address.address} />
					</div>
				{/if}
			</div>
		</div>
	{/if}
	{#if !royaltySplitDeployed}
		<Button
			buttonProps={{ type: 'button' }}
			type="tertiary"
			size="md"
			on:click={openRoyaltiesModal}
		>
			{buttonText}
		</Button>
	{/if}
	{#if !unsaved && isRevenueSplit(royalty?.creator_address) && !royalty.creator_address.address}
		<DeployRevenueSplit
			title="Deploy royalty split"
			split={royalty.creator_address}
			on:deploy={handleSplitDeployment}
		/>
	{/if}
</CollectionSection>

<style lang="scss">
	.royalties-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 0px;

		.royalty {
			position: relative;
			display: flex;
			flex-direction: column;
			gap: 8px;
			.row {
				display: flex;
				flex-direction: row;
				gap: 8px;

				.address-input {
					flex-grow: 1;
				}

				.royalty-input {
					max-width: 80px;
				}
			}

			.right {
				justify-content: flex-end;
			}
		}
	}
</style>
