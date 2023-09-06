<script lang="ts">
	import { onDestroy } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import { isAddress } from 'ethers/lib/utils';
	import { addressFromEns } from '$utils/web3/address';
	import { getRecipientsValidation } from '$models/minter/validation-schemas/pricing-validation';
	import { calculateTotalPercent, type Recipient } from '$models/payout-recipients';
	import CreatePayableAddress from '$lib/project/CreatePayableAddress.svelte';
	import { getContractPlatform } from '$lib/projects/data';
	import Store from '$utils/Store';
	import { ZeroAddress } from '$constants';
	import AddressOrProjectPayoutInput, {
		getPayoutAddress,
	} from './AddressOrProjectPayoutInput.svelte';
	import Modal, { bind, openModal, type ModalType } from './Modal.svelte';
	import Button from './Button.svelte';
	import PopInfo from './PopInfo.svelte';
	import Range from './Range.svelte';
	import Form from './minter/form/Form.svelte';
	import SelectPayableAddressModal from './SelectPayableAddressModal.svelte';
	import FormError from './minter/form/FormError.svelte';
	import type { ProjectPlatform } from '$constants/platform';

	export let close;
	export let saveReceiver: (receiver: Recipient) => void;
	export let recipients: Recipient[];
	export let editIndex: number = -1;

	const limit = 100 - calculateTotalPercent(recipients) + (recipients[editIndex]?.percent ?? 0);
	const initialRecipientFormState = recipients[editIndex] ?? {
		address: '',
		name: '',
		percent: null,
	};

	let loadingPayoutAddress: boolean = false;
	let rangeValue = [recipients[editIndex]?.percent ?? limit];
	let projectValue = '';
	let projectPlatform: ProjectPlatform = undefined;
	let selectedAddress: string;

	const modal = new Store<ModalType>(undefined);

	const submit = (values: Recipient) => {
		saveReceiver(values);
		close();
	};

	const formState = createForm<Recipient>({
		initialValues: initialRecipientFormState,
		onSubmit: submit,
		validationSchema: getRecipientsValidation(recipients, editIndex),
	});
	const { handleSubmit, errors, form } = formState;

	const showOptionsModal = (projectId: string, projectName: string, platform: ProjectPlatform) => {
		openModal(
			bind(SelectPayableAddressModal, {
				id: +projectId,
				name: projectName,
				projectPlatform: platform,
				useAddress: (address: string) => {
					selectedAddress = address;
				},
				close: () => {},
			}),
			undefined,
			modal,
		);
	};

	const submitOverride = async (e: Event) => {
		$form.percent = rangeValue[0];
		$form.name = $form.address;
		loadingPayoutAddress = true;
		const address: string = await getPayoutAddress($form.address, projectValue, projectPlatform);

		if (address) {
			if (address === projectValue) {
				loadingPayoutAddress = false;
				showOptionsModal(projectValue, $form.address, projectPlatform);
				return;
			} else {
				$form.address = address;
			}
		}

		if ($form.name.endsWith('.eth')) {
			$form.address = await addressFromEns($form.name);
		}
		loadingPayoutAddress = false;
		handleSubmit(e);
	};

	const modalUnsub = modal.subscribe((value) => {
		if (!value && isAddress(selectedAddress)) {
			if (selectedAddress === ZeroAddress) {
				openModal(
					bind(CreatePayableAddress, {
						projectId: +projectValue,
						platform: getContractPlatform(projectPlatform),
						modal,
						onSuccess: (address) => {
							selectedAddress = address;
						},
						close: () => {},
					}),
					undefined,
					modal,
				);
				selectedAddress = '';
			} else {
				$form.address = selectedAddress;
				submitOverride(new SubmitEvent('submit')).catch((err) => console.log(err));
			}
		}
	});

	onDestroy(() => {
		modalUnsub();
	});
</script>

<h3>Add payout receiver</h3>
<section>
	<Form onSubmit={submitOverride}>
		<AddressOrProjectPayoutInput
			label="Beneficiary"
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
		<Range id="percent" bind:values={rangeValue} max={limit} />
		<FormError error={$errors.percent} />
		<p>The percent this address receives of the total revenue.</p>

		<Button
			fullWidth
			size="md"
			type={$form.address ? 'primary' : 'tertiary'}
			loading={loadingPayoutAddress}
		>
			{editIndex > -1 ? 'Save' : 'Add payout receiver'}
		</Button>
	</Form>
</section>

<Modal show={$modal} {modal} />

<style lang="scss">
	h3 {
		color: var(--text-header);
		font-size: 21px;
		margin-bottom: 16px;
	}

	section {
		color: var(--text-primary);
		max-width: 542px;
		display: flex;
		flex-direction: column;

		p {
			color: var(--text-secondary);
			margin-bottom: 16px;
			font-weight: 300;
		}
		label {
			color: var(--text-header);
			margin-bottom: 8px;
		}
	}
</style>
