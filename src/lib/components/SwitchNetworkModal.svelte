<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { readNetwork, web3Provider } from '$stores/web3';
	import { NetworkName } from '$models/network-name';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import SwitchNetworkContent from './SwitchNetworkContent.svelte';

	let showModal = false;

	const networkName = get(readNetwork).alias;
	const supportedNetworks: NetworkName[] = [NetworkName.mainnet, NetworkName.goerli];

	const supportedNetworkOptions = supportedNetworks
		.filter((n) => readNetwork.get().alias !== n)
		.map((_n) => {
			const subDomain = _n === NetworkName.mainnet ? '' : `${_n}.`;
			return {
				label: `${subDomain}move.xyz`,
				href: `https://${subDomain}move.xyz`,
			};
		});

	function checkNetwork() {
		showModal = $web3Provider?.network?.name !== networkName;
	}

	onMount(() => {
		if (!$web3Provider?.network) {
			// TODO: this is fishy as fuck, "but it works".
			// waits momentarily for the provider to be set
			// by the web3 init... do this properly when time allows
			setTimeout(() => {
				checkNetwork();
			}, 300);
		}
	});

	web3Provider.subscribe((current) => {
		if (current?.network) {
			checkNetwork();
		}
	});
</script>

<Modal
	closeButton={false}
	show={showModal &&
		bind(SwitchNetworkContent, { networkName, networkOptions: supportedNetworkOptions })}
/>
