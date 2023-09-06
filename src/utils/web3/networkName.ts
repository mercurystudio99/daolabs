import { blocknativeNetworks } from '$constants/networks';
import { browser } from '$app/environment';

export function getNetworkAliasByChainId(chainId: string | number) {
	const network = blocknativeNetworks.find((n) => Number(n.id) === Number(chainId));
	return network ? network.alias : 'unknown';
}

export function setNetworkAliasInQueryParams(alias: string, useHistoryApi = true) {
	let changed = false;
	const newUrl = window.location.href.replace(/network=\w*/g, () => {
		changed = true;
		return alias ? `network=${alias}` : '';
	});
	const queryExists = !!newUrl.match(/\?/);
	if (useHistoryApi) {
		history.replaceState(
			null,
			'',
			`${
				changed
					? newUrl
					: queryExists
					? `${window.location.href}&${alias ? `network=${alias}` : ''}`
					: `${window.location.href}?${alias ? `network=${alias}` : ''}`
			}`,
		);
	} else {
		window.location.href = changed
			? newUrl
			: queryExists
			? `${window.location.href}&${alias ? `network=${alias}` : ''}`
			: `${window.location.href}?${alias ? `network=${alias}` : ''}`;
	}
}

export function getNetworkAliasInQueryParams() {
	return new URLSearchParams(location.search).get('network');
}

export function setCurrentNetworkAlias() {
	if (!browser) return;
	const netQueryParam = new URLSearchParams(location.search).get('network');
	if (blocknativeNetworks.find((net) => net.alias === netQueryParam)) {
		localStorage.setItem('network', netQueryParam);
		return;
	}
	localStorage.setItem('network', netQueryParam);
}
