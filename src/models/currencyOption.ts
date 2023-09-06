import type { V1CurrencyOption } from './v1/currencyOption';
import type { V2CurrencyOption } from './v2/currencyOption';

export type CurrencyOption = V1CurrencyOption | V2CurrencyOption;
