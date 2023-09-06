<script lang="ts">
	import { deepCopy } from 'ethers/lib/utils';
	import {
		addressFromRecipient,
		handleRecipients,
		recipientsFromAddressOrRevenueSplit,
	} from '$models/minter/pricing';
	import { isRevenueSplit, type RevenueSplit } from '$models/user/revenue-splits';
	import {
		addressValidationSchema,
		limitedRevenueSplitValidation,
	} from '$models/minter/validation-schemas/revenue-split-validation';
	import { isRevenueSplitDeployed } from '$utils/deployRevenueSplitHelpers';
	import DeployRevenueSplit from '../revenue-split/DeployRevenueSplit.svelte';
	import PayoutReceivers from '../revenue-split/PayoutReceivers.svelte';
	import CollectionSection from './CollectionSection.svelte';
	import type { Recipient } from '$models/payout-recipients';

	export let payoutAddress: string | RevenueSplit;
	export let readonly: boolean = false;
	export let unsaved: boolean = false;
	export let error: string = '';

	const initialState = deepCopy(payoutAddress);

	const validatePayoutReceiver = () => {
		if (!payoutAddress) {
			error = '';
			return;
		}

		if (isRevenueSplit(payoutAddress)) {
			limitedRevenueSplitValidation
				.validate(payoutAddress)
				.then(() => (error = ''))
				.catch((err: { errors: string[] }) => (error = err.errors[0]));
		} else {
			addressValidationSchema
				.validate(payoutAddress)
				.then(() => (error = ''))
				.catch((err: { errors: string[] }) => (error = err.errors[0]));
		}
	};

	const handlerRecipientsChange = (e: CustomEvent<Recipient[]>) => {
		payoutAddress = handleRecipients(payoutAddress, e.detail, addressFromRecipient);
		validatePayoutReceiver();

		unsaved = JSON.stringify(initialState) !== JSON.stringify(payoutAddress);
	};

	const handleSplitDeployment = (e: CustomEvent<{ deployed: RevenueSplit }>): void => {
		payoutAddress = e.detail.deployed;
	};
</script>

<CollectionSection
	title="Payout receiver"
	required
	info="Ethereum address or Juicebox project to receive your collection's earnings."
>
	<PayoutReceivers
		label=""
		recipients={recipientsFromAddressOrRevenueSplit(payoutAddress)}
		review={readonly || isRevenueSplitDeployed(payoutAddress)}
		{error}
		on:change={handlerRecipientsChange}
	/>
	{#if !unsaved && isRevenueSplit(payoutAddress) && !payoutAddress.address}
		<DeployRevenueSplit
			title="Deploy payout split"
			split={payoutAddress}
			on:deploy={handleSplitDeployment}
		/>
	{/if}
</CollectionSection>
