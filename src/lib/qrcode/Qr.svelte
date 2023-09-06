<script lang="ts">
	import QRCode from 'qrcode';

	export let codeValue: string;
	const qrcode = QRCode.toString(codeValue, {});
</script>

<div class="qrcode">
	{#await qrcode}
		<p>...waiting</p>
	{:then string}
		{@html string}
	{/await}
</div>

<style lang="scss" scoped>
	.qrcode {
		width: 250px;
	}
</style>
