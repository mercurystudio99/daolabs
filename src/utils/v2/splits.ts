import { BigNumber, constants } from 'ethers';
import { percentToPermyriad, permyriadToPercent } from '$utils/formatNumber';
import { formatSplitPercent, splitPercentFrom } from './math';
import type { PayoutMod } from '$models/mods';
import type { Split } from '$models/v2/splits';

export const toSplit = (mod: PayoutMod): Split => ({
	// mod.percent is a parts-per-ten thousand (permyriad),
	// split.percent is a parts-per-billion
	percent: splitPercentFrom(parseFloat(permyriadToPercent(mod.percent))).toNumber(),
	lockedUntil: mod.lockedUntil,
	beneficiary: mod.beneficiary,
	projectId: mod.projectId?.toHexString(),
	allocator: mod.allocator,
	preferClaimed: mod.preferUnstaked,
});

export const toMod = (split: Split): PayoutMod => ({
	// mod.percent is a parts-per-ten thousand (permyriad),
	// split.percent is a parts-per-billion
	percent: percentToPermyriad(formatSplitPercent(BigNumber.from(split.percent))).toNumber(),
	lockedUntil: split.lockedUntil,
	beneficiary: split.beneficiary,
	projectId: split.projectId ? BigNumber.from(split.projectId) : undefined,
	allocator: split.allocator,
	preferUnstaked: split.preferClaimed,
});

export const sanitizeSplit = (split: Split): Split => ({
	lockedUntil: split.lockedUntil ?? 0,
	projectId: split.projectId ?? BigNumber.from(0).toHexString(),
	beneficiary: split.beneficiary ?? constants.AddressZero,
	allocator: constants.AddressZero,
	preferClaimed: false,
	percent: split.percent,
});
