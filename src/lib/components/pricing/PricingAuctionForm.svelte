<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import { add } from 'date-fns';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import FormDropdown from '$lib/components/minter/form/FormDropdown.svelte';
	import {
		initialCollectionPricing,
		type CollectionPricing,
	} from '$models/minter/collection-config';
	import { collectionPricingValidation } from '$models/minter/validation-schemas/pricing-validation';
	import Button from '$lib/components/Button.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Expandable from '$lib/components/Expandable.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import AdvancedCollectionPreview from '$lib/components/minter/preview/AdvancedCollectionPreview.svelte';
	import { deepCopy } from '$utils/object';
	import Form from '$lib/components/minter/form/Form.svelte';
	import {
		payoutReceiverFromRecipient,
		recipientsFromPayoutReceiverOrRevenueSplit,
		handleRecipients,
	} from '$models/minter/pricing';
	import { handleRevenueSplitChange } from '$utils/users/revenueSplitsHelpers';
	import PayoutReceivers from '../revenue-split/PayoutReceivers.svelte';
	import PricingInput from './components/PricingInput.svelte';
	import PricingDateTime from './components/PricingDateTime.svelte';
	import PricingFees from './components/PricingFees.svelte';
	import PricingReviewAuction from './components/PricingReviewAuction.svelte';
	import type { Recipient } from '$models/payout-recipients';
	import type { AdvancedCollection } from '$models/minter/collection-config';

	// Export variables
	export let close: () => void;
	export let collection: AdvancedCollection;
	export let saveCollection: (form: AdvancedCollection) => Promise<void>;
	export let method: 'fixed' | 'highest' | 'declining';

	// Local variables and constants
	let showedReview = false;
	let services = [
		{
			label: 'Juicebox',
			value: 'juicebox',
		},
		{
			label: 'Choose a Juicebox project',
			value: 'jb',
		},
	];

	const methods = [
		{
			label: 'Sell with declining price',
			value: 'declining',
		},
		{
			label: 'Sell to highest bidder',
			value: 'highest',
		},
		{
			label: 'Fixed price',
			value: 'fixed',
		},
	];

	const durations = [
		{
			label: '1 day',
			value: '1d',
		},
		{
			label: '3 day',
			value: '3d',
		},
		{
			label: '7 day',
			value: '7d',
		},
		{
			label: '1 month',
			value: '1m',
		},
		{
			label: '3 months',
			value: '3m',
		},
		{
			label: '6 months',
			value: '6m',
		},
		{
			label: 'custom',
			value: null,
		},
	];

	// Initialization
	const { handleSubmit, errors, form, handleChange, updateValidateField } =
		createForm<CollectionPricing>({
			initialValues: collection.pricing || { ...initialCollectionPricing, method },
			onSubmit: () => {},
			validationSchema: collectionPricingValidation,
		});

	// Functions
	function submitPricing(values: CollectionPricing) {
		return async () => {
			const savedRevenueSplit = await handleRevenueSplitChange(
				collection?.pricing?.payoutReceivers,
				values.payoutReceivers,
				collection.name,
				'collectionPricing',
			);
			if (savedRevenueSplit) {
				values.payoutReceivers = savedRevenueSplit;
			}
			collection.pricing = deepCopy(values);
			await saveCollection(collection);
			close();
		};
	}

	const handleReceiversChange = (e: CustomEvent<Recipient[]>) => {
		updateValidateField(
			'payoutReceivers',
			handleRecipients($form.payoutReceivers, e.detail, payoutReceiverFromRecipient),
		);
	};

	function showReview() {
		showedReview = !showedReview;
	}

	function clearDuration() {
		$form.duration = null;
	}

	function updateEndDateByDuration() {
		if ($form.duration && $form.startingDate) {
			let period: Duration;
			switch ($form.duration) {
				case '1d':
					period = { days: 1 };
					break;
				case '3d':
					period = { days: 3 };
					break;
				case '7d':
					period = { days: 7 };
					break;
				case '1m':
					period = { months: 1 };
					break;
				case '3m':
					period = { months: 3 };
					break;
				case '6m': {
					period = { months: 6 };
					break;
				}
			}

			const startingDate: string = $form.startingDate;
			$form.endingDate = String(add(new Date(startingDate), period).getTime());
		} else if ($form.startingDate > $form.endingDate) {
			const startingDate: string = $form.startingDate;
			$form.endingDate = String(add(new Date(startingDate), { days: 1 }).getTime());
		}
	}
</script>

<h1>Timed auction</h1>
<main>
	<div class="main-box">
		{#if showedReview}
			<div class="review-box">
				<PricingReviewAuction
					method={$form.method}
					startingDate={$form.startingDate}
					startingTime={$form.startingTime}
					endingTime={$form.endingTime}
					endingDate={$form.endingDate}
					price={$form.price}
					reserve={$form.reservePrice}
				/>

				<PayoutReceivers
					label="Revenue payout receiver"
					recipients={recipientsFromPayoutReceiverOrRevenueSplit($form.payoutReceivers)}
					review={true}
					mandatory
				/>

				<div class="footer">
					<Button size="md" buttonProps={{ type: 'button' }} type="secondary" on:click={close}>
						Cancel
					</Button>
					<Button
						size="md"
						type="secondary"
						disabled={$form.reservePrice > $form.price}
						on:click={showReview}>Edit</Button
					>
					<!-- eslint-disable -->
					<Button
						size="md"
						type="primary"
						disabled={$form.reservePrice > $form.price}
						on:click={submitPricing($form)}
					>
						Finish
					</Button>
				</div>
			</div>
		{:else}
			<div class="form">
				{#if $form.method == 'highest'}
					<InfoBox
						info={`
						<p>Sell to the highest bidder</p>
						<p>Also known as an English auction, OpenSea will automatically complete this transaction if a Sell to highest bidder auction finishes above 1 ETH, with OpenSea paying the gas fee in the process.</p>
						<p>If the auction finishes below 1 ETH, it's up to the seller to accept the highest offer. The seller is under no obligation to complete the transaction.</p>
						<p>Making a bid on this kind of action is like making an offer on a fixed-price listing. The seller can choose to accept it at any time, but the buyer will need WETH to create a bid.</p>
						<p>You may cancel an auction at any time, but doing so will require paying a gas fee.</p>
					`}
					/>
				{:else if $form.method == 'declining'}
					<InfoBox
						info={`
				<p>Sell with declining price</p>
				<p>Also known as a Dutch auction, these are similar to fixed-price listings except that the price falls over time. You can buy at any time in the listed currency or make an offer.</p>`}
					/>
				{:else}
					<InfoBox
						info={`
				<p>Where are the two types of auctions available:</p>
				<ul>
					<li>Sell to the highest bidder: the highest bid wins at the end</li>
					<li>Sell with a declining price: the price falls until someone purchases the item</li>
				</ul>`}
					/>
				{/if}

				<Form onSubmit={handleSubmit}>
					<FormDropdown
						id="method"
						label="Method"
						info="Tooltip text"
						description="Sell to the highest bidder or sell with a declining price, which allows the listing to reduce in price until a buyer is found"
						options={methods}
						error={$errors.method}
						on:change={() => {}}
						bind:value={$form.method}
					/>

					<!-- Price input -->
					<PricingInput bind:price={$form.price} bind:currency={$form.currency} {handleChange} />
					<!-- /Price input -->

					<div class="line" />

					<FormDropdown
						id="duration"
						label="Duration"
						info="Time period chosen by the author for an auction"
						options={durations}
						error={$errors.duration}
						required={true}
						changeFn={updateEndDateByDuration}
						bind:value={$form.duration}
					/>

					<!-- Date Time -->
					<PricingDateTime
						bind:startingDate={$form.startingDate}
						bind:startingTime={$form.startingTime}
						bind:endingDate={$form.endingDate}
						bind:endingTime={$form.endingTime}
						updateEndDate={clearDuration}
						updateStartDate={updateEndDateByDuration}
						required={true}
					/>
					<!-- /Date Time -->

					<div class="line" />

					<div class="more-options">
						<Expandable titleColor="var(--text-header)">
							<div slot="title" class="expandable-title">
								<PopInfo message="Tooltip text">More options</PopInfo>
							</div>
							<div class="buyer-toggle">
								<Toggle bind:checked={$form.includeReserve} /> Include reserve price
							</div>
							{#if $form.includeReserve}
								<PricingInput
									bind:price={$form.reservePrice}
									bind:currency={$form.currency}
									title="Reserve price"
									showError={$form.reservePrice > $form.price}
									errorMessage="Reserve price must be greater than starting price"
									{handleChange}
								/>
							{/if}
						</Expandable>
					</div>

					<div class="line" />

					<PayoutReceivers
						label="Revenue payout receiver"
						mandatory
						recipients={recipientsFromPayoutReceiverOrRevenueSplit($form.payoutReceivers)}
						error={$errors.payoutReceivers}
						on:change={handleReceiversChange}
					/>

					<PricingFees bind:service={$form.service} bind:services />

					<div class="line" />

					<div class="footer">
						<Button size="md" buttonProps={{ type: 'button' }} type="secondary" on:click={close}>
							Cancel
						</Button>
						<Button
							size="md"
							type="secondary"
							disabled={$form.reservePrice > $form.price ||
								$form.startingDate == null ||
								$form.endingDate == null}
							on:click={showReview}>Next</Button
						>
					</div>
				</Form>
			</div>
		{/if}
	</div>
	<AdvancedCollectionPreview {collection} collectionPricing={$form} />
</main>

<style lang="scss">
	h1 {
		color: var(--text-header);
		font-size: 28px;
		margin-bottom: 0px;
		margin-left: 8px;
	}

	main {
		display: flex;
		padding: 8px;
		gap: 24px;
		width: calc(100vw - 96px);
	}

	.more-options {
		margin-top: 16px;
	}
	.line {
		border-bottom: 1px solid var(--stroke-tertiary);
		margin-bottom: 16px;
	}

	.buyer-toggle {
		display: flex;
		font-weight: 300;
		margin-bottom: 16px;
	}
	.main-box {
		display: flex;
		flex-direction: column;
		flex-basis: 50%;
	}
	.review-box {
		display: flex;
		flex-direction: column;
	}
	.form {
		display: flex;
		flex-direction: column;
	}
	.expandable-title {
		color: var(--text-header);
		margin-bottom: 8px;
	}

	.more-options {
		margin-top: 16px;
	}

	.footer {
		margin-top: 32px;
		display: flex;
		justify-content: flex-end;
		gap: 16px;
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		main {
			flex-direction: column;
			width: 100%;
		}

		.main-box {
			flex-direction: column;
		}
	}
</style>
