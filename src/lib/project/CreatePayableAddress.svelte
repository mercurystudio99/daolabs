<script lang="ts">
	import { BigNumber, constants } from 'ethers';
	import { isAddress } from 'ethers/lib/utils';
	import { connectedAccount } from '$stores/web3';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import Input from '$lib/components/Input.svelte';
	import { bind, openModal, type ModalType } from '$lib/components/Modal.svelte';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import CollapsibleSection from '$lib/create/CollapsibleSection.svelte';
	import { deployProjectPayer } from '$utils/web3/JBETHERC20ProjectPayerDeployer';
	import { modal as globalModalStore } from '$stores';
	import { web3Transact } from '$lib/transaction';
	import NewPaymentAddressModal from './NewPaymentAddressModal.svelte';
	import type { ContractPlatform } from '$constants/platform';
	import type Store from '$utils/Store';

	export let projectId: number | BigNumber;
	export let platform: ContractPlatform;
	export let modal: Store<ModalType> = globalModalStore;

	export let close: () => void;
	export let onSuccess: (address: string) => void = () => {};

	let isDeploying = false;
	let tokenMintingEnabled = false;
	let customTokenChecked = false;

	let customMemo = '';
	let customTokenBeneficiary = '';

	const DEFAULT_MEMO = '';
	const DEFAULT_METADATA = [0x1];

	// TODO: check for payable address prior and display it with button to edit

	async function deploy() {
		isDeploying = true;

		try {
			const txnResponse = await web3Transact(
				'deployProjectPayer',
				deployProjectPayer,
				platform,
				projectId,
				customTokenChecked && tokenMintingEnabled && customTokenBeneficiary
					? isAddress(customTokenBeneficiary)
						? customTokenBeneficiary
						: constants.AddressZero
					: constants.AddressZero, // defaultBeneficiary is none because we want tokens to go to msg.sender
				false, // preferClaimed, // _defaultPreferClaimedTokens,
				customMemo || DEFAULT_MEMO, // _defaultMemo,
				DEFAULT_METADATA, // _defaultMetadata,
				!tokenMintingEnabled, // !tokenMintingEnabled, // defaultPreferAddToBalance,
				$connectedAccount, // , _owner
			);

			openModal(
				bind(PendingTransaction, {
					txnResponse,
					functionName: 'deployProjectPayer',
					close: () => {},
				}),
				undefined,
				modal,
			);

			return await txnResponse.wait();
		} catch (error) {
			console.error(error.message);
			isDeploying = false;
			return false;
		}
	}

	async function deployAndShowNewAddress() {
		const response = await deploy();
		// The below is a hack to show the new address modal as the Pending Transaction modal
		// closes the modal after the new modal is shown. This will be solved when updating
		// how we handle modals - i.e. one store with a list of modals.
		const unsubscribe = modal.subscribe((value) => {
			if (!value && response && response?.logs) {
				unsubscribe();
				const newPaymentAddress = response.logs[0]?.address as Address;
				if (newPaymentAddress) {
					openModal(
						bind(NewPaymentAddressModal, {
							newPaymentAddress,
							close: () => {},
						}),
						undefined,
						modal,
					);
					onSuccess(newPaymentAddress);
				}
			}
		});
	}
</script>

<div class="content">
	<h2>Create payable address</h2>
	<p><Trans>Create an Ethereum address that can be used to pay your project directly.</Trans></p>
	<p>
		<Trans
			>Tokens minted from payments to this address will belong to the payer by default. However, if
			someone pays the project through a custodial service platform such as Coinbase,</Trans
		><b><Trans>tokens can't be issued to their personal wallets and will be lost.</Trans></b>
	</p>

	<CollapsibleSection expanded={false}>
		<h4 slot="header">Advanced options (optional)</h4>

		<div class="collapse">
			<label for="memo"
				>Custom memo
				<Popover
					placement="right"
					message="The onchain memo for each transaction made through the address. It will appear in the project's payment feed when someone pays this address."
				>
					<Icon name="questionCircle" />
				</Popover>
			</label>
			<Input id="memo" placeholder="Payment made through payable address" bind:value={customMemo} />

			<div class="toggleOption">
				<label for="customMemo">
					Token minting enabled
					<Popover
						placement="right"
						message="Determines whether tokens will be minted from payments to this address."
					>
						<Icon name="questionCircle" />
					</Popover>
				</label>
				<Toggle id="customMemo" bind:checked={tokenMintingEnabled} />
			</div>
			{#if tokenMintingEnabled}
				<div class="toggleOption">
					<label for="customMemo">
						Custom token beneficiary
						<Popover
							placement="right"
							message="By default, newly minted tokens will go to the wallet who sends funds to the address. You can enable this to set the token beneficiary to a custom address."
						>
							<Icon name="questionCircle" />
						</Popover>
					</label>
					<Toggle id="customToken" bind:checked={customTokenChecked} />
				</div>
			{/if}
			{#if customTokenChecked && tokenMintingEnabled}
				<Input
					bind:value={customTokenBeneficiary}
					placeholder="treasury.movedao.eth / 0x0000000000000000000000000000000000000000"
					type="address"
				/>
			{/if}
		</div>
	</CollapsibleSection>
</div>

<div class="buttons">
	<Button type="secondary" size="md" on:click={close}>Close</Button>
	<Button
		type="primary"
		size="md"
		disabled={isDeploying}
		on:click={deployAndShowNewAddress}
		loading={isDeploying}
		>Deploy project payer contract
	</Button>
</div>

<style>
	p {
		font-weight: 300;
	}

	h2,
	h4 {
		color: var(--text-header);
	}

	h4 {
		margin: 0;
		margin-left: 10px;
	}

	label {
		align-items: baseline;
		display: flex;
		font-weight: 300;
		gap: 5px;
		margin-bottom: 5px;
	}

	.content {
		max-width: 480px;
	}

	.collapse {
		margin: 10px 32px;
	}

	.buttons {
		margin-top: 20px;
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.toggleOption {
		display: flex;
		gap: 20px;
		margin-top: 20px;
	}
</style>
