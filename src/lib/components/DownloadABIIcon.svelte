<script lang="ts">
	import { createCustomNotification } from '$utils/notification';
	import { downloadFileFromString } from '$lib/utils/exportConfig';
	import Button from './Button.svelte';
	import Icon from './Icon';

	export let address: string;
	export let name: string;

	let loading = false;

	async function onFileClick() {
		loading = true;
		const { dismiss, update } = createCustomNotification({
			type: 'pending',
			message: 'Fetching ABI',
		});
		const response = await fetch(
			`https://api.etherscan.io/api?module=contract&action=getabi&address=${address}`,
		);
		const contractABI = (await response.json()).result as string;

		downloadFileFromString(contractABI, 'application/json', `${name}.json`);

		try {
			update({
				type: 'success',
				message: `Fetch ABI ${address}`,
			});
		} catch (error) {
			update({
				type: 'error',
				message: 'Failed to fetch ABI',
				autoDismiss: 3000,
			});
		}
		dismiss();
		loading = false;
	}
</script>

<Button type="link" on:click={onFileClick}><Icon {loading} name="jsonFile" /></Button>
