import Store from '$utils/Store';

type ResolvedNames = Record<string, { ens: string; timestamp: number }>;

const getPersistedEns = () => {
	const jsonString = localStorage.getItem('resolved-ens') || '{}';
	const addresses = (JSON.parse(jsonString) || {}) as ResolvedNames;
	const resolved: ResolvedNames = {};
	for (const address in addresses) {
		const loweredAddress = address.toLowerCase();
		resolved[loweredAddress] = {
			ens: addresses[loweredAddress].ens,
			timestamp: addresses[loweredAddress].timestamp,
		};
	}

	return resolved;
};

export const resolvedEns = new Store<ResolvedNames>();

export const loadResolvedEns = () => {
	if (resolvedEns.get()) return;
	resolvedEns.set(getPersistedEns());
};

export const setResolved = (ens: string, address: string) => {
	if (ens && ens.toLowerCase().endsWith('.eth')) {
		resolvedEns.update((current) => {
			current[address.toLowerCase()] = { ens, timestamp: Date.now() };
			localStorage.setItem('resolved-ens', JSON.stringify(current));
			return current;
		});
	}

	return true;
};
