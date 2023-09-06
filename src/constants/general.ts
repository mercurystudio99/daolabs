/**
 * This is a temporary file to collect the constants created for this svelte version,
 * and will be refactored once a natural structure has emerged.
 */

import { V2_CURRENCY_ETH, V2_CURRENCY_USD } from '$utils/v2/currency';

// TODO: remove CurrencyName from $constants/general, use $constants/currency
// currently used in CurrencyInput, needs to be refactored away from there
export const CurrencyName = {
	[V2_CURRENCY_ETH]: 'ETH',
	[V2_CURRENCY_USD]: 'USD',
};

export enum DistributionLimitType {
	None = 0,
	Specific = 1,
	Infinite = 2,
}

export const ZeroAddress = '0x0000000000000000000000000000000000000000';
