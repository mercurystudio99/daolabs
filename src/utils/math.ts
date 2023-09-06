import { BigNumber, constants } from 'ethers';

import { fromWad, percentToPerbicent } from './formatNumber';

export type WeightFunction = (
	weight: BigNumber | undefined,
	reservedRate: number | undefined,
	wadAmount: BigNumber | undefined,
	outputType: 'payer' | 'reserved',
) => string;

/**
 * Return a given [amountWad] weighted by a given [weight] and [reservedRatePerbicent].
 *
 * Typically only used by Juicebox V1 projects.
 *
 * @param weight - scalar value for weighting. Typically funding cycle weight.
 * @param reservedRatePerbicent - reserve rate, as a perbicent (x/200)
 * @param amountWad - amount to weight, as a wad.
 * @param outputType
 */
export const weightedRate: WeightFunction = (
	weight: BigNumber | undefined,
	reservedRatePerbicent: number | undefined,
	wadAmount: BigNumber | undefined,
	outputType: 'payer' | 'reserved',
) => {
	if (!weight || !wadAmount) return '0';

	if (reservedRatePerbicent === undefined) return '0';

	return fromWad(
		weight
			.mul(wadAmount)
			.mul(
				outputType === 'reserved'
					? reservedRatePerbicent
					: percentToPerbicent(100).sub(reservedRatePerbicent),
			)
			.div(percentToPerbicent(100)),
	);
};

// Determines if a string value contains only digits
export const stringIsDigit = (value: string) => /^\d+$/.test(value);

export const feeForAmount = (
	amount: BigNumber | undefined,
	feePerbicent: BigNumber | undefined,
) => {
	if (!feePerbicent || !amount) return;
	return amount.sub(amount.mul(200).div(feePerbicent.add(200)));
};

export const amountSubFee = (amount?: BigNumber, feePerbicent?: BigNumber) => {
	if (!feePerbicent || !amount) return;
	return amount.sub(feeForAmount(amount, feePerbicent) ?? 0);
};

/**
 * new amount = old amount / (1 - fee)
 */
export const amountAddFee = (amount?: string, feePerbicent?: BigNumber) => {
	if (!feePerbicent || !amount) return;

	const inverseFeePerbicent = percentToPerbicent(100).sub(feePerbicent);
	const amountPerbicent = BigNumber.from(amount).mul(percentToPerbicent(100));
	// new amount is in regular decimal units
	const newAmount = amountPerbicent.div(inverseFeePerbicent);

	return newAmount.toString();
};

export const TEN_THOUSAND = 10000;
export const ONE_BILLION = 1000000000;

export const MaxUint232 = constants.MaxUint256.add(1)
	.div(2 ** 24)
	.sub(1);
export const MaxUint88 = 2 ** 88 - 1;
export const MaxUint48 = 2 ** 48 - 1;
