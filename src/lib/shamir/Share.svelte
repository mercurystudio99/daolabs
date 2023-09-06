<script lang="ts">
	import { Buffer } from 'buffer';
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Qr from '$lib/qrcode/Qr.svelte';

	import { generate } from './util/passPhrase';
	import { split } from './util/split';

	const dispatch = createEventDispatcher();

	$: phase = 1;

	let pharse = generate(16);
	let shares: any;

	const formFiledSecret = {
		id: 'secret',
		label: 'Secret key',
		placeholder: '',
		type: 'textarea',
		props: {
			rows: 4,
		},
	};

	const regenerate = () => {
		pharse = generate(16);
	};

	const print = () => {
		const qrCodes = document.getElementById('qr-codes').innerHTML;
		const printPage = globalThis.open('', '', 'height=500, width=1000');
		printPage.document.write('<html>');
		printPage.document.write('<body>');
		printPage.document.write(qrCodes);
		printPage.document.write('</body></html>');
		printPage.document.close();
		printPage.print();
	};

	const saveFn = () => {
		dispatch('save', {});
	};

	const splitFn = () => {
		const secret = Buffer.from(pharse);
		shares = split(secret, { shares: 5, threshold: 3 }).map((buffer) => buffer.toString('hex'));
		phase = 2;
	};
</script>

{#if phase === 1}
	<FormField field={formFiledSecret} bind:value={pharse} />
	<Button type="secondary" on:click={regenerate}>Regenerate</Button>
	<Button on:click={splitFn}>Split</Button>
{:else}
	<div id="qr-codes" class="qr-codes">
		{#each shares as share}
			<Qr codeValue={share} />
		{/each}
	</div>
	<Button type="secondary" on:click={print}>Print Us</Button>
	<Button on:click={saveFn}>Save</Button>
{/if}

<style lang="scss" scoped>
	.qr-codes {
		margin-top: 20px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
</style>
