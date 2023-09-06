<script lang="ts">
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import QRCode from '$lib/components/QRCode.svelte';

	export let close: () => void;
	export let newPaymentAddress: Address;
</script>

<ActionModal title="Your new payment address:">
	<QRCode value={newPaymentAddress} />
	<p>
		Deployed payment addresses can be found in the Tools drawer (<Icon name="tool" />) on the
		project page.
	</p>
	<div slot="footer">
		<Button size="md" on:click={close}>Close</Button>
	</div>
</ActionModal>
