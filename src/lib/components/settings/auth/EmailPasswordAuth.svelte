<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	import FormField from '$lib/components/FormField.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import { popupLogin } from '$utils/firebase';

	const METHOD = 'email_password';

	let email: string;
	let password: string;

	$: error = '';

	const formFiledEmail = {
		id: 'email-auth',
		label: 'Email address',
		placeholder: 'example@example.com',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
		props: {
			type: 'email',
		},
	};

	const formFiledPassword = {
		id: 'password',
		label: 'Password',
		placeholder: '',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
		props: {
			type: 'password',
		},
	};

	const signIn = async () => {
		try {
			const result = await popupLogin(METHOD, { email, password });
			console.log(result);
		} catch (e) {
			error = e.message;
		}
	};
</script>

{#if error}
	<div class="error">
		<InfoBox info={error} />
	</div>
{/if}
<FormField field={formFiledEmail} bind:value={email} />
<FormField field={formFiledPassword} bind:value={password} />
<div class="button-container">
	<Button on:click={signIn}>Sign-in</Button>
</div>

<style lang="scss" scoped>
	.button-container {
		display: flex;
		justify-content: flex-end;
	}
	.error {
		margin-top: 15px;
		color: red;
	}
</style>
