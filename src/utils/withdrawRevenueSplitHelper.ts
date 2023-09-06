import { isAddress } from 'ethers/lib/utils';
import { createCustomNotification } from './notification';
import {
	distributeToAddress,
	distributeToProject,
} from './web3/extensions/MixedPaymentSplitterWrapper';
import { formatWad } from './formatNumber';
import type { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import type { RevenueRecipient, RevenueSplit } from '$models/user/revenue-splits';
import type { UpdateNotification } from '@web3-onboard/core';

const handleContractReceipt =
	(recipient: RevenueRecipient, update: UpdateNotification) => (receipt: ContractReceipt) => {
		const event = receipt.events?.filter(
			(e) => e.event === 'PaymentReleased' || e.event === 'ProjectPaymentReleased',
		)[0];

		if (!event) {
			update({
				type: 'error',
				message: 'Could not determine transaction result',
				autoDismiss: 2000,
			});
			return false;
		}

		const { amount } = event.args as unknown as { amount: BigNumber };
		update({
			type: 'success',
			message: `${formatWad(amount)} ETH transferred to ${recipient.displayName}`,
			autoDismiss: 2000,
		});

		return true;
	};

const handleContractError =
	(update: UpdateNotification, dismiss: () => void, nonce?: number) => (error) => {
		console.error('Transaction failed', error);
		if (error instanceof Error) {
			update({
				type: 'error',
				message: nonce ? `Failed to sign transaction (#${nonce})` : 'Failed to sign transaction',
				autoDismiss: 2000,
			});
		} else {
			dismiss();
		}
		return false;
	};

async function withdrawRevenueSplit(split: RevenueSplit): Promise<boolean> {
	if (!split || !split.address || (split.recipients?.length ?? 0) === 0) return false;

	const waitTransactions: Promise<boolean>[] = [];
	for (let i = 0; i < split.recipients.length; i++) {
		const recipient = split.recipients[i];
		let contract: ContractTransaction;
		const { update, dismiss } = createCustomNotification({
			type: 'pending',
			message: 'Waiting transaction confirmation',
		});
		try {
			if (isAddress(recipient.address)) {
				contract = await distributeToAddress(split.address, recipient.address);
			} else {
				contract = await distributeToProject(split.address, Number(recipient.address));
			}

			update({
				type: 'pending',
				message: `Waiting transaction (#${contract.nonce}) completion`,
			});

			waitTransactions.push(
				contract
					.wait()
					.then(handleContractReceipt(recipient, update))
					.catch(handleContractError(update, dismiss, contract.nonce)),
			);
		} catch (error) {
			handleContractError(update, dismiss)(error);
		}
	}

	const results = await Promise.all(waitTransactions);
	return results.reduce((acc, r) => acc || r, false);
}

export { withdrawRevenueSplit };
