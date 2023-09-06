<script lang="ts">
	import Combine from '$lib/shamir/Combine.svelte';
	import Share from '$lib/shamir/Share.svelte';
	import { userdata, type AuthMethod, popupLogin } from '$utils/firebase';
	import Button from '../Button.svelte';

	import Dropdown from '../Dropdown.svelte';
	import HeavyBorderBox from '../HeavyBorderBox.svelte';
	import EmailPasswordAuth from './auth/EmailPasswordAuth.svelte';
	import PhoneAuth from './auth/PhoneAuth.svelte';

	let singMethod: AuthMethod;

	const options = [
		{
			value: 'phone_auth',
			label: 'Phone Auth',
		},
		{
			value: 'google_auth',
			label: 'Google',
		},
		{
			value: 'email_password',
			label: 'Email-password',
		},
		{
			value: 'facebook_auth',
			label: 'Facebook',
		},
		{
			value: 'github_auth',
			label: 'Github',
		},
	];

	const save = () => {
		//saveRecoveryInfo($userdata);
	};
	const signIn = async () => {
		await popupLogin(singMethod);
	};
</script>

<HeavyBorderBox>
	<span class="card-title">Additional Identify Services</span>
	<p>
		Enabling alternative sign-on solutions with a valid credit-card will automatically create a <a
			href="#2">custodial crypto account</a
		>. You may export your private keys at any time. JuiceBox Payments uses
		<a href="#1">multi-party computation</a>.
	</p>
	{#if !$userdata}
		<span class="card-title">Sign-in Service</span>
		<div class="auth-container">
			<Dropdown style="width: 200px" {options} bind:value={singMethod} />
			{#if singMethod === 'phone_auth'}
				<PhoneAuth />
			{:else if singMethod === 'email_password'}
				<EmailPasswordAuth />
			{/if}
		</div>
		{#if singMethod !== 'phone_auth' && singMethod !== 'email_password'}
			<div class="button-container">
				<Button on:click={signIn}>Sign-in</Button>
			</div>
		{/if}
	{:else if !$userdata.recovery}
		<Share on:save={save} />
	{:else}
		<Combine />
	{/if}
</HeavyBorderBox>

<style lang="scss" scoped>
	.card-title {
		color: var(--text-header);
		font-weight: 400;
		margin: 0;
		margin-bottom: 10px;
		font-size: 16px;
		display: block;
	}
	.button-container {
		display: flex;
		justify-content: flex-end;
	}
</style>
