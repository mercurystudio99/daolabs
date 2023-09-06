<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import { constants } from 'ethers';
	import Button from '$lib/components/Button.svelte';
	import ContractInfo from '$lib/components/ContractInfo.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import Form from '$lib/components/minter/form/Form.svelte';
	import PricingWarningModal from '$lib/components/pricing/PricingWarningModal.svelte';
	import FormErrorModal from '$lib/components/minter/modal/FormErrorModal.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { getErrorList } from '$lib/utils/getErrorList';
	import {
		initialCollectionPricing,
		type CollectionPricing,
		type AdvancedCollection,
	} from '$models/minter/collection-config';
	import { TokenStandard } from '$models/minter/token-standard';
	import { deepCopy } from '$utils/object';
	import PricingModal from '$lib/components/pricing/PricingModal.svelte';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import PricingReviewAuction from '$lib/components/pricing/components/PricingReviewAuction.svelte';
	import PricingRevenue from '$lib/components/pricing/components/PricingRevenue.svelte';
	import PricingTotalRevenue from '$lib/components/pricing/components/PricingTotalRevenue.svelte';
	// import PricingServiceFee from '$lib/components/pricing/components/PricingServiceFee.svelte';
	import DeployRevenueSplit from '$lib/components/revenue-split/DeployRevenueSplit.svelte';
	import { getSumNftTotalSupply } from '$utils/collectionHelpers';
	import PayoutReceivers from '$lib/components/revenue-split/PayoutReceivers.svelte';
	import { recipientsFromPayoutReceiverOrRevenueSplit } from '$models/minter/pricing';
	import { isRevenueSplit, type RevenueSplit } from '$models/user/revenue-splits';

	export let collection: AdvancedCollection;
	export let saveCollection: (form: AdvancedCollection) => Promise<void>;
	export let readonly = false;

	function openPricingModal() {
		openModal(bind(PricingModal, { collection, saveCollection, close: () => {} }), {
			fullscreen: true,
			fullscreenDefault: true,
		});
	}

	let initialState: CollectionPricing = collection.pricing || initialCollectionPricing;

	const submitPricing = async (values: CollectionPricing) => {
		collection.pricing = deepCopy(values);
		await saveCollection(collection);
		initialState = collection.pricing;
		close();
	};

	const formState = createForm<CollectionPricing>({
		initialValues: initialState,
		onSubmit: submitPricing,
	});
	const { handleSubmit, errors, form } = formState;

	let rangeValue = [100];
	const submitOverride = (e: Event) => {
		$form.price = $form.price || 0;
		$form.redemptionRate = rangeValue[0];
		handleSubmit(e);
	};
	const unsubscribe = errors.subscribe((value) => {
		const err = getErrorList(value);
		if (err.length > 0) {
			openModal(bind(FormErrorModal, { errorList: err }));
		}
	});

	onMount(() => {
		rangeValue[0] = $form.redemptionRate;
	});

	onDestroy(() => {
		unsubscribe();
	});

	const openPricing = () => {
		openModal(bind(PricingWarningModal, { collection, saveCollection, close: () => {} }));
	};

	const handleSplitDeployment = (event: CustomEvent<{ deployed: RevenueSplit }>) => {
		$form.payoutReceivers = event.detail.deployed;
		handleSubmit(event);
	};

	const royalty = collection.royalty?.royalty ?? 0;
	const collectionSupply = getSumNftTotalSupply(collection);
	// TODO: What's the deal with the fee, are we taking one from the creator?
	const serviceFeeValue = 0;
	$: royaltyValue = ($form.price * royalty) / 100;
</script>

{#if collection.contracts?.pricing?.address}
	<ContractInfo
		contract={{
			name: 'Pricing Contract',
			address: constants.AddressZero,
			creator: constants.AddressZero,
			standard: TokenStandard.ERC721,
		}}
	/>
{/if}
<HeavyBorderBox>
	<div class="box">
		{#if collection.pricing == null}
			<h4>Configure Pricing setup</h4>
			<p>You have not defined any price for this collection yet</p>

			<Button size="md" on:click={openPricing}>Configure</Button>
		{:else}
			<h3>
				<PopInfo message="Tooltip text">Price</PopInfo>
			</h3>
			<Form onSubmit={submitOverride}>
				<!-- Method -->
				<div class="methods">
					<label for="">
						<PopInfo message="Tooltip text">Method</PopInfo>
					</label>
					<div class="methods-item">
						<Checkbox disabled={true} checked={$form.method === 'fixed'} /> Fixed price
					</div>
					<p><i> Auction option coming soon.</i></p>
					<!-- <div class="methods-item">
						<Checkbox
							disabled={true}
							checked={$form.method === 'highest' || $form.method === 'declining'}
						/>
						Timed auction
					</div> -->
				</div>
				<!-- /Method -->

				{#if $form.method === 'fixed'}
					<!-- Price -->
					<div class="price-block">
						<label for="price">
							<PopInfo message="Tooltip text">Price per NFT</PopInfo>
						</label>

						<div class="price-box">
							<span>Price: </span>
							<span> {$form.price} ETH / 1 NFT</span>
						</div>
					</div>
					<!-- /Price -->

					<!-- NFT revenue -->
					<PricingRevenue price={$form.price} currency={$form.currency} {royaltyValue} />
					<!-- /NFT revenue -->

					<!-- Service Fee -->
					<!-- <PricingServiceFee
						currency={$form.currency}
						bind:service={$form.service}
						serviceFee={serviceFeeValue}
						review={true}
					/> -->
					<!-- /Service Fee -->

					<!-- Total project revenue -->
					<PricingTotalRevenue
						price={$form.price}
						currency={$form.currency}
						{royaltyValue}
						{serviceFeeValue}
						{rangeValue}
						{collectionSupply}
					/>
					<!-- /Total project revenue -->
				{:else if $form.method === 'highest' || $form.method === 'declining'}
					<PricingReviewAuction
						method={$form.method}
						startingDate={$form.startingDate}
						startingTime={$form.startingTime}
						endingTime={$form.endingTime}
						endingDate={$form.endingDate}
						price={$form.price}
						reserve={$form.reservePrice}
					/>
				{/if}

				<PayoutReceivers
					label="Revenue payout receiver"
					mandatory
					recipients={recipientsFromPayoutReceiverOrRevenueSplit($form.payoutReceivers)}
					review={true}
				/>
				{#if !readonly}
					<div class="footer">
						<Button
							size="md"
							buttonProps={{ type: 'button' }}
							type="tertiary"
							on:click={openPricingModal}>Edit</Button
						>
					</div>
				{/if}
			</Form>
			{#if $form.payoutReceivers && isRevenueSplit($form.payoutReceivers) && !$form.payoutReceivers.address}
				<DeployRevenueSplit
					title="Deploy"
					split={$form.payoutReceivers}
					on:deploy={handleSplitDeployment}
				/>
			{/if}
		{/if}
	</div>
</HeavyBorderBox>

<style lang="scss">
	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;
		position: relative;

		// Methods
		.methods {
			display: flex;
			flex-direction: column;
			margin-bottom: 16px;
			label {
				color: var(--text-header);
			}
			&-item {
				display: flex;
				align-items: center;
				margin-top: 10px;
			}

			p {
				margin-top: 8px;
				color: var(--text-tertiary);
				margin-bottom: 0;
			}
		}
		h4 {
			font-size: 16px;
			font-weight: 400;
			color: var(--text-header);
			margin-bottom: 0;
		}

		h3 {
			color: var(--text-header);
			margin-bottom: 0px;
		}
		:global(.dcg-container) {
			background: var(--background-l2) !important;
		}
		.price-block {
			display: flex;
			flex-direction: column;
			margin-bottom: 16px;

			label {
				color: var(--text-header);
				margin-bottom: 8px;
				display: flex;
			}
			.price-box {
				padding: 8px;
				border: 0.4px solid var(--stroke-tertiary);
				display: flex;
				justify-content: space-between;
				font-weight: 300;
			}
		}

		h4 {
			color: var(--text-header);
			margin-bottom: 16px;
			display: flex;
		}

		.footer {
			display: flex;
			flex-direction: column;
			margin-top: 16px;
		}
	}
</style>
