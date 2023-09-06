<script lang="ts">
	import { createForm, Form } from 'svelte-forms-lib';
	import { royaltyValidationSchema } from '$models/minter/validation-schemas/collection-validation';
	import Button from '$lib/components/Button.svelte';
	import {
		addressFromRecipient,
		handleRecipients,
		recipientsFromAddressOrRevenueSplit,
	} from '$models/minter/pricing';
	import PayoutReceivers from '$lib/components/revenue-split/PayoutReceivers.svelte';
	import FormInput from '../form/FormInput.svelte';
	import type { Recipient } from '$models/payout-recipients';
	import type { Royalty } from '$models/minter/collection-config';

	export let close;
	export let saveData: (royalty: Royalty) => void;
	export let royalty: Royalty;

	let buttonDisabled = true;

	const submit = (values: Royalty) => {
		saveData(values);
		close();
	};

	const formState = createForm<Royalty>({
		initialValues: royalty || { creator_address: '', royalty: null },
		onSubmit: submit,
		validationSchema: royaltyValidationSchema,
	});

	const { handleSubmit, errors, form, handleChange, updateValidateField, isValid } = formState;

	const handleRecipientsChange = (e: CustomEvent<Recipient[]>) => {
		updateValidateField(
			'creator_address',
			handleRecipients($form.creator_address, e.detail, addressFromRecipient),
		);
	};

	$: hasValues = Object.values($form).every((fieldValue) => fieldValue);
	$: buttonDisabled = !hasValues || !$isValid;
</script>

<section>
	<h2>Royalties</h2>
	<Form context={formState}>
		<PayoutReceivers
			label="Recipients"
			info="The Ethereum address of a recipient wallet or a split. This can be the creator's wallet."
			recipients={recipientsFromAddressOrRevenueSplit($form.creator_address)}
			error={$errors.creator_address}
			on:change={handleRecipientsChange}
		/>
		<br style="height: 0.5rem;" />
		<FormInput
			id="royalty"
			label="Royalty percentage"
			type="number"
			info="Collect a percentage fee on resales of your NFT. Values over 10% may cause errors on OpenSea."
			description="Collect a percentage fee on resales of your NFT."
			placeholder="5"
			error={$errors.royalty}
			bind:value={$form.royalty}
			on:change={handleChange}
			on:input={handleChange}
		/>
	</Form>
	<br />
	<div class="buttons">
		<Button
			size="md"
			disabled={buttonDisabled}
			type={buttonDisabled ? 'tertiary' : 'primary'}
			on:click={handleSubmit}>Done</Button
		>
	</div>
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		max-width: 542px;
		overflow-x: hidden;

		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
		}
		.buttons {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}
	}
</style>
