<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import { addressFromEns } from '$utils/web3/address';
	import { generateId } from '$lib/utils/generateId';
	import { connectedAccount } from '$stores/web3';
	import FormInput from './minter/form/FormInput.svelte';
	import Form from './minter/form/Form.svelte';
	import Button from './Button.svelte';
	import AddressOrProjectPayoutInput, {
		getPayoutAddress,
	} from './AddressOrProjectPayoutInput.svelte';
	import PopInfo from './PopInfo.svelte';
	import Range from './Range.svelte';
	import SeemlessInput from './minter/seemless-input/SeemlessInput.svelte';
	import type { RevenueRecipient, RevenueSplit } from '$models/user/revenue-splits';
	import type { ProjectPlatform } from '$constants/platform';

	export let close;
	export let userSplit: RevenueSplit;
	export let currentIndex: number = undefined;
	export let edit: boolean = false;
	export let saveSplit: (split: RevenueSplit) => void;

	let splitName = userSplit ? userSplit.name : '';
	let projectValue = '';
	let projectPlatform: ProjectPlatform = undefined;
	let editIndex: number;
	let loadAddress: boolean = false;

	const submit = (values: RevenueRecipient) => {
		if (edit) {
			userSplit.recipients[editIndex] = values;
			saveSplit(userSplit);
			close();
			return;
		}
		// values.displayName = values.address;
		// values.address = getPayoutAddress(values.address, projectValue);
		if (userSplit) {
			userSplit.recipients.push({ ...values, percent: Number(values.percent) });
		} else {
			userSplit = {
				id: generateId(),
				creator: $connectedAccount,
				createdBy: 'user',
				name: splitName,
				recipients: [values],
			};
		}
		saveSplit(userSplit);
		close();
	};

	const recipientValidation: yup.SchemaOf<RevenueRecipient> = yup.object({
		address: yup
			.string()
			.required('Required')
			.test({
				message: 'This recipient already exists',
				test: (_address) => {
					const exists = userSplit?.recipients.some((recipient, index) => {
						return index !== editIndex && recipient.address === _address;
					});
					return !exists;
				},
			}),
		percent: yup
			.number()
			.min(0.000001, 'Must be more than 0')
			.max(100, 'Must be less than 100')
			.required('Required'),
		displayName: yup.string(),
	});

	const initialRecipientFormState = { address: '', percent: 0 };
	const recipientFormState = createForm<RevenueRecipient>({
		initialValues: initialRecipientFormState,
		onSubmit: submit,
		validationSchema: recipientValidation,
	});
	const { handleSubmit, errors, form } = recipientFormState;

	const calculateTotal = (recipients: RevenueRecipient[]) =>
		recipients.reduce((acc, recipient) => {
			acc += Number(recipient.percent);
			return acc;
		}, 0);

	let total = userSplit ? calculateTotal(userSplit.recipients) : 0;
	let rangeValue = [100 - total];

	const submitOverride = async (e: Event) => {
		$form.percent = rangeValue[0];
		$form.displayName = $form.address;
		loadAddress = true;
		$form.address = await getPayoutAddress($form.address, projectValue, projectPlatform);
		if ($form.displayName.endsWith('.eth')) {
			$form.address = await addressFromEns($form.displayName);
		}
		loadAddress = false;
		handleSubmit(e);
	};

	$: addButtonDisabled = !($form.address && splitName);
	$: recipientChanged = JSON.stringify(initialRecipientFormState) !== JSON.stringify($form);
	$: splitChanged = splitName !== (userSplit ? userSplit.name : '');
	$: {
		if (currentIndex !== undefined) {
			$form.percent = userSplit.recipients[currentIndex].percent;
			$form.displayName = userSplit.recipients[currentIndex].displayName;
			$form.address = userSplit.recipients[currentIndex].address;
			total -= $form.percent;
			rangeValue = [$form.percent];
			editIndex = currentIndex;
			currentIndex = undefined;
		}
	}
</script>

<main>
	<h2>Revenue split</h2>
	{#if userSplit}
		<div class="name-input">
			<SeemlessInput bind:value={splitName} />
		</div>
	{:else}
		<FormInput
			id="name"
			label="Revenue split name"
			required={true}
			info="Tooltip text"
			placeholder="Project"
			bind:value={splitName}
		/>
	{/if}
	<Form onSubmit={submitOverride}>
		<AddressOrProjectPayoutInput
			label="Wallet address or ENS"
			error={$errors.address}
			bind:value={$form.address}
			bind:projectValue
			bind:projectPlatform
		/>
		<label for="percent">
			<PopInfo message="Percentage this payee will receive of all funds raised.">
				Percent allocation
			</PopInfo>
		</label>
		<Range id="percent" bind:values={rangeValue} max={100 - total} />
		<p>The percent this address receives of the total revenue.</p>
	</Form>
	<Button
		size="md"
		type={splitChanged || recipientChanged ? 'primary' : 'secondary'}
		fullWidth
		buttonProps={{ type: 'button' }}
		disabled={addButtonDisabled}
		loading={loadAddress}
		on:click={submitOverride}
	>
		{#if !edit}
			Add
		{:else}
			Confirm
		{/if}
	</Button>
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		width: calc(100vw - 96px);
		max-width: 560px;

		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
			width: 100%;
		}
		p {
			color: var(--text-secondary);
			margin-bottom: 16px;
			font-weight: 300;
		}
		label {
			color: var(--text-header);
			margin-bottom: 8px;
		}
		.name-input {
			margin-bottom: 16px;
		}
	}
</style>
