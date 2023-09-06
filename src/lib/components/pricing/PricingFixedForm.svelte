<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { createForm } from 'svelte-forms-lib';

	import {
		initialCollectionPricing,
		type CollectionPricing,
	} from '$models/minter/collection-config';

	import { collectionPricingValidation } from '$models/minter/validation-schemas/pricing-validation';

	import { getErrorList } from '$lib/utils/getErrorList';
	import { deepCopy } from '$utils/object';
	import Button from '$lib/components/Button.svelte';
	import Expandable from '$lib/components/Expandable.svelte';
	import Form from '$lib/components/minter/form/Form.svelte';
	import FormErrorModal from '$lib/components/minter/modal/FormErrorModal.svelte';
	import AdvancedCollectionPreview from '$lib/components/minter/preview/AdvancedCollectionPreview.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import FormDropdown from '$lib/components/minter/form/FormDropdown.svelte';
	import Input from '$lib/components/Input.svelte';
	import Toggle from '$lib/components/Toggle.svelte';

	import {
		payoutReceiverFromRecipient,
		recipientsFromPayoutReceiverOrRevenueSplit,
		handleRecipients,
	} from '$models/minter/pricing';
	import { getSumNftTotalSupply } from '$utils/collectionHelpers';
	import { handleRevenueSplitChange } from '$utils/users/revenueSplitsHelpers';
	import { isRevenueSplitDeployed } from '$utils/deployRevenueSplitHelpers';
	import PayoutReceivers from '../revenue-split/PayoutReceivers.svelte';
	import PricingInput from './components/PricingInput.svelte';
	import PricingRevenue from './components/PricingRevenue.svelte';
	import PricingTotalRevenue from './components/PricingTotalRevenue.svelte';
	import PricingServiceFee from './components/PricingServiceFee.svelte';
	import type { Recipient } from '$models/payout-recipients';
	import type { AdvancedCollection } from '$models/minter/collection-config';

	// Export variables
	export let close;
	export let collection: AdvancedCollection;
	export let saveCollection: (form: AdvancedCollection) => Promise<void>;
	export let method: 'fixed' | 'highest' | 'declining';

	// Local variables and constants
	let rangeValue = [0];
	let errorList;
	let formModal;
	const royalty = collection.royalty?.royalty ?? 0;
	let collectionSupply;
	let loadingSubmit = false;

	const methods = [
		{
			label: 'Fixed price',
			value: 'fixed',
		},
	];
	// TODO: Take this from the cloud function or keep as constant
	const serviceFeeValue = 0.02;

	// Initialization
	const submitPricing = async (values: CollectionPricing) => {
		loadingSubmit = true;
		try {
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
		} catch (error) {
			console.log(error instanceof Error ? `Pricing save failed with: ${error.message}` : error);
		} finally {
			loadingSubmit = false;
			close();
		}
	};

	const { handleSubmit, errors, form, handleChange, updateField, updateValidateField } =
		createForm<CollectionPricing>({
			initialValues: collection.pricing || { ...initialCollectionPricing, method },
			onSubmit: submitPricing,
			validationSchema: collectionPricingValidation,
		});

	const unsubscribe = errors.subscribe((value) => {
		const err = getErrorList(value, { payoutReceivers: 'payoutReceivers' });
		const payoutIndex = err.findIndex((e) => e.field === 'payoutReceivers');
		if (payoutIndex !== -1) {
			err.splice(payoutIndex, 1);
		}

		if (err.length > 0) {
			errorList = err;
		}
	});

	// Functions

	// TODO: common component for the form to work with/without modal
	function submitOverride(e: Event) {
		$form.price = $form.price || 0;
		$form.redemptionRate = rangeValue[0];
		handleSubmit(e);
	}

	const handleReceiversChange = (e: CustomEvent<Recipient[]>) => {
		updateValidateField(
			'payoutReceivers',
			handleRecipients($form.payoutReceivers, e.detail, payoutReceiverFromRecipient),
		);
	};

	const dropdownChange = () => {
		method = $form.method;
	};

	// Hooks
	onMount(() => {
		collectionSupply = getSumNftTotalSupply(collection);
		updateField('method', method);
	});

	onDestroy(() => {
		unsubscribe();
	});

	// Reactive statement
	$: royaltyValue = ($form.price * royalty) / 100;
	$: payoutReceiversSplitDeployed = isRevenueSplitDeployed($form.payoutReceivers);
	// TODO: Need to move price's error showing from modal to underline of PricingInput component
	$: saveDisabled = (errorList && errorList.length > 0) || !!$errors.payoutReceivers;
</script>

<h1>Fixed price</h1>
<main>
	<div class="form">
		<Form onSubmit={submitOverride}>
			<FormDropdown
				id="method"
				label="Method"
				info="Tooltip text"
				options={methods}
				error={$errors.method}
				changeFn={dropdownChange}
				bind:value={$form.method}
			/>

			<!-- Price input -->
			<PricingInput bind:price={$form.price} bind:currency={$form.currency} {handleChange} />
			<!-- /Price input -->

			<!-- Curve -->
			<!-- NOTE: this graph doesn't make any sense, commenting out for now until we know what to do with this graph -->
			<!-- <PricingCurve bind:rangeValue price={$form.price} currency={$form.currency} /> -->
			<!-- /Curve -->

			<!-- NFT Revenue -->
			<PricingRevenue price={$form.price} currency={$form.currency} {royaltyValue} />
			<!-- /NFT Revenue -->

			<!-- Service Fee -->
			<PricingServiceFee
				currency={$form.currency}
				bind:service={$form.service}
				serviceFee={serviceFeeValue}
			/>
			<!-- /Service Fee -->

			<!-- Total Revenue  -->
			<PricingTotalRevenue
				price={$form.price}
				currency={$form.currency}
				{royaltyValue}
				{serviceFeeValue}
				{rangeValue}
				{collectionSupply}
			/>
			<!-- /Total Revenue -->

			<PayoutReceivers
				label="Revenue payout receiver"
				recipients={recipientsFromPayoutReceiverOrRevenueSplit($form.payoutReceivers)}
				mandatory
				review={payoutReceiversSplitDeployed}
				error={$errors.payoutReceivers}
				on:change={handleReceiversChange}
			/>

			<div class="more-options">
				<Expandable titleColor="var(--text-header)">
					<div slot="title" class="expandable-title">
						<PopInfo message="Tooltip text">More options</PopInfo>
					</div>
					<div class="buyer-toggle">
						<Toggle bind:checked={$form.includeBuyer} /> Reserve for specific buyer
					</div>
					<p class="description-buyer">This item can be purchased as soon as it's listed.</p>
					{#if $form.includeBuyer}
						<Input bind:value={$form.buyer} placeholder="0x00000000000000000000000000000000000" />
					{/if}
				</Expandable>
			</div>

			<div class="footer">
				<Button size="md" buttonProps={{ type: 'button' }} type="secondary" on:click={close}>
					Cancel
				</Button>
				<Button size="md" type="primary" disabled={saveDisabled} loading={loadingSubmit}
					>Finish</Button
				>
			</div>
		</Form>
	</div>
	<AdvancedCollectionPreview {collection} collectionPricing={$form} />
</main>

<Modal
	on:close={() => {
		errorList = undefined;
	}}
	show={errorList &&
		bind(FormErrorModal, {
			errorList,
		})}
/>

<Modal
	on:close={() => {
		formModal = undefined;
	}}
	show={formModal}
/>

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

	.form {
		display: flex;
		flex-direction: column;
		flex-basis: 50%;
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
	}
</style>
