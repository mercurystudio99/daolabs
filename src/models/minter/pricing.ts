import {
	initialRevenueSplit,
	isRevenueSplit,
	type RevenueRecipient,
	type RevenueSplit,
} from '$models/user/revenue-splits';
import type { PayoutReceiver } from './collection-config';
import type { Recipient } from '$models/payout-recipients';

export const recipientsFromRevenueSplit = (split: RevenueSplit): Recipient[] => {
	return (
		split?.recipients?.map((r) => {
			return {
				address: r.address,
				percent: r.percent,
				name: r.displayName,
			};
		}) ?? []
	);
};

const recipientsFromPayoutReceiver = (payoutReceiver: PayoutReceiver): Recipient => {
	return {
		address: payoutReceiver.address,
		percent: payoutReceiver.percent,
		name: payoutReceiver.label,
	};
};

const recipientFromAddress = (address: string): Recipient => ({
	address,
	percent: 100,
});

const getRecipients = <T>(obj: T | RevenueSplit, factory: (arg: T) => Recipient): Recipient[] => {
	if (!obj) return [];

	return isRevenueSplit(obj) ? recipientsFromRevenueSplit(obj) : [factory(obj)];
};

export const recipientsFromPayoutReceiverOrRevenueSplit = (
	payoutReceiver: PayoutReceiver | RevenueSplit,
): Recipient[] => getRecipients(payoutReceiver, recipientsFromPayoutReceiver);

export const recipientsFromAddressOrRevenueSplit = (receiver: string | RevenueSplit): Recipient[] =>
	getRecipients(receiver, recipientFromAddress);

const revenueRecipientFromRecipient = (recipient: Recipient): RevenueRecipient => {
	return {
		address: recipient.address,
		percent: recipient.percent,
		displayName: recipient.name,
	};
};

const revenueSplitFromRecipients = (
	splitName: string,
	...recipients: Recipient[]
): RevenueSplit => {
	return {
		...initialRevenueSplit,
		name: splitName,
		recipients: recipients?.map(revenueRecipientFromRecipient),
	};
};

export const payoutReceiverFromRecipient = (recipient: Recipient): PayoutReceiver => {
	return recipient
		? {
				address: recipient.address,
				percent: recipient.percent,
				label: recipient.name,
				lockedUntil: 0,
		  }
		: undefined;
};

export const addressFromRecipient = (recipiet: Recipient): string => recipiet?.address ?? '';

export const handleRecipients = <T>(
	current: T | RevenueSplit,
	recipients: Recipient[],
	factory: (r: Recipient) => T,
): T | RevenueSplit => {
	let updated: T | RevenueSplit;

	if (recipients.length === 0) {
		updated = factory(undefined);
	} else if (
		recipients.length === 1 &&
		(recipients[0].percent === 100 || isRevenueSplit(current))
	) {
		updated = factory(recipients[0]);
	} else {
		updated = revenueSplitFromRecipients('split', ...recipients);
	}

	if (isRevenueSplit(current) && isRevenueSplit(updated)) {
		return { ...current, recipients: updated.recipients };
	} else {
		return updated;
	}
};
