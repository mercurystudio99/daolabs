import * as yup from 'yup';
import type { RevenueRecipient, RevenueSplit } from '$models/user/revenue-splits';

export const revenueRecipientValidation: yup.SchemaOf<RevenueRecipient> = yup.object({
	address: yup
		.string()
		.matches(/^0x[a-fA-F0-9]{40}$|^\d+$/g, 'Must be a valid address or project identifier')
		.required(),
	percent: yup
		.number()
		.min(0.000001, 'Must be more than 0')
		.max(100, 'Must be less than 100')
		.required(),
});

export const addressValidationSchema = yup
	.string()
	.matches(/^0x[a-fA-F0-9]{40}$/g, 'Must be a valid address')
	.required();

export const limitedRevenueSplitValidation: yup.SchemaOf<RevenueSplit> = yup.object({
	recipients: yup.array(revenueRecipientValidation).test({
		message: 'Total percent should be equal to 100%',
		test: (_recipients) => {
			const total = _recipients.reduce((acc, r) => {
				acc += r.percent;
				return acc;
			}, 0);
			return total === 100;
		},
	}),
});

export const revenueSplitValidation: yup.SchemaOf<RevenueSplit> = yup.object({
	id: yup.string().required(),
	recipients: yup.array(revenueRecipientValidation).test({
		message: 'Total percent should be equal to 100%',
		test: (_recipients) => {
			const total = _recipients.reduce((acc, r) => {
				acc += r.percent;
				return acc;
			}, 0);
			return total === 100;
		},
	}),
	creator: yup.string(),
	/*
		.matches(/^0x[a-fA-F0-9]{40}$/g, 'Must be a valid address')
		.required(),*/
	createdBy: yup.string(),
});
