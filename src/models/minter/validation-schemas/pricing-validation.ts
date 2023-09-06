import { isAddress } from 'web3-utils';
import * as yup from 'yup';
import {
	isPayoutReceiver,
	type CollectionPricing,
	type PayoutReceiver,
} from '../collection-config';
import type { RevenueSplit } from '$models/user/revenue-splits';

export const collectionPricingValidation: yup.SchemaOf<CollectionPricing> = yup.object({
	price: yup.number().min(0.000000001, 'Must not be 0').required('Required'),
	currency: yup.mixed(),
	payoutReceivers: yup.lazy((value: PayoutReceiver | RevenueSplit) =>
		!value
			? yup.object().nullable(true).required('Must have at least 1 payout receiver')
			: isPayoutReceiver(value)
			? yup.object({
					address: yup.string().required('A valid address is required'),
					percent: yup.number().oneOf([100], 'Percent must be equal to 100'),
					lockedUntil: yup.number(),
			  })
			: yup.object({
					recipients: yup
						.array(
							yup.object({
								address: yup.string().required('A valid address is required'),
								percent: yup.number(),
							}),
						)
						.test({
							message: 'Total percent should be equal to 100%',
							test: (_recipients) => {
								const total = _recipients.reduce((acc, r) => {
									acc += r.percent;
									return acc;
								}, 0);
								return total === 100;
							},
						}),
			  }),
	),
	redemptionRate: yup.number(),
});

export const getRecipientsValidation = (recipients: { address: string }[], editIndex: number) => {
	return yup.object({
		address: yup
			.string()
			.required('Required')
			.test({
				message: 'Invalid address',
				test: (_address) => {
					return isAddress(_address);
				},
			})
			.test({
				message: 'This recipient already exists',
				test: (_address) => {
					const exists = recipients.some((recipient, index) => {
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
		name: yup.string().optional(),
	});
};
