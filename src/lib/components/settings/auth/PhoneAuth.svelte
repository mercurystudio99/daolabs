<script lang="ts">
	import { popupLogin } from '$utils/firebase';
	import FormField from '../../FormField.svelte';
	import Button from '../../Button.svelte';

	const METHOD = 'phone_auth';

	let phone: string;
	let show: boolean;

	let resultFn: any;
	let code: string;

	const formFiledPhone = {
		id: 'phone',
		label: 'Phone number',
		placeholder: '',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
		useMask: true,
		maskOptions: {
			mask: '+{0} 000-000-0000',
			lazy: false,
		},
	};

	const formFiledCode = {
		id: 'code',
		label: 'Code',
		placeholder: '',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
	};

	const signIn = async () => {
		const captchaContainer = document.getElementById(METHOD);
		try {
			const result = await popupLogin(METHOD, { captchaContainer, phone });
			show = true;
			resultFn = result;
		} catch (e) {
			console.error(e);
		}
	};

	const confirm = async () => {
		try {
			await resultFn.confirm(code);
		} catch (e) {
			console.error(e);
		}
	};
</script>

{#if !show}
	<FormField field={formFiledPhone} bind:value={phone} />
	<div class="button-container">
		<Button on:click={signIn}>Sign-in</Button>
	</div>
{:else}
	<FormField field={formFiledCode} bind:value={code} />
	<div class="button-container">
		<Button on:click={confirm}>Confirm Code</Button>
	</div>
{/if}
<div id="phone_auth" />

<style lang="scss" scoped>
	.button-container {
		display: flex;
		justify-content: flex-end;
	}
</style>
