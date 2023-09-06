import { get } from 'svelte/store';
import { ensFromAddress } from '$utils/web3/address';
import { resolvedEns, setResolved } from '$stores/resolved-ens';

const THREE_DAYS = 3 * 86400_000;

export const getEnsAddress = async (
	_address: string,
	truncate: boolean = false,
	prependEnsWithAt: boolean = false,
): Promise<string> => {
	let addressName: string;
	const lowerAddress = (_address || '').toLowerCase();
	const resolved = get(resolvedEns)[lowerAddress];

	if (resolved && resolved.timestamp > Date.now() - THREE_DAYS) {
		addressName = resolved.ens;
	} else {
		addressName = await ensFromAddress(_address, truncate);
		setResolved(addressName, _address);
	}

	return addressName.endsWith('.eth') && prependEnsWithAt ? `@${addressName}` : addressName;
};
