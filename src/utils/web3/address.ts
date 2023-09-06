import { getTruncatedAddress } from '$lib/utils/getTruncatedAddress';
import { getBaseProvider } from '$stores/web3';
import { browser } from '$app/environment';

export async function ensFromAddress(address: string, truncate: boolean = false) {
	if (browser) {
		try {
			const provider = getBaseProvider('mainnet');
			if (!provider) {
				return truncate ? getTruncatedAddress(address) : address;
			}
			const ens = await provider.lookupAddress(address);
			return ens || (truncate ? getTruncatedAddress(address) : address);
		} catch (error) {
			return truncate ? getTruncatedAddress(address) : address;
		}
	}
}

export async function addressFromEns(ens: string): Promise<string> {
	const provider = getBaseProvider('mainnet');
	if (!provider) {
		return null;
	}
	try {
		const address = await provider.resolveName(ens);
		return address;
	} catch (error) {
		// Do nothing
	}
}
