import { utils, constants } from 'ethers';
import type { PayoutMod } from '$models/mods';
import type { Split } from '$models/v2/splits';

export type ModalMode = 'Add' | 'Edit' | undefined;

// Validates an eth address from a modal where the address
// is being added to a set of addresses (such as payout or
// reserved token receivers)
// Ensures address is not null, 0, or the same as an already added address
export function validateEthAddress(
	address: string,
	mods: PayoutMod[] | Split[],
	modalMode: ModalMode,
	editingModIndex: number | undefined,
) {
	// If user edits an (already approved) address and doesn't change it, we accept
	if (modalMode === 'Edit' && address === mods[editingModIndex ?? 0]?.beneficiary)
		return Promise.resolve();
	if (!address || !utils.isAddress(address)) return Promise.reject('Address is required');
	if (address === constants.AddressZero) return Promise.reject('Cannot use zero address');
	if (mods.some((mod: PayoutMod | Split) => mod.beneficiary === address))
		return Promise.reject('A payout for this address already exists');
	return Promise.resolve();
}

// Ensures value is greater than 0 and less than 100
export function validatePercentage(percent: number | undefined) {
	if (percent === undefined || percent === 0) return Promise.reject('Required');
	if (percent > 100) return Promise.reject('Invalid');
	return Promise.resolve();
}
