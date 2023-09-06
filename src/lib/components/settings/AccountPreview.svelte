<script lang="ts">
	import { Buffer } from 'buffer';
	import { createEventDispatcher } from 'svelte';

	import { connectedAccount, web3Provider } from '$stores/web3';
	import Button from '../Button.svelte';

	export let user: any;

	const dispatch = createEventDispatcher();

	const signMessage = () => {
		const EIP712Domain = [
			{ name: 'name', type: 'string' },
			{ name: 'version', type: 'string' },
		];
		const domain = {
			name: 'Verifier',
			version: '1',
		};
		const Permit = [{ name: 'username', type: 'string' }];
		const message = { username: user.username };

		const data = JSON.stringify({
			types: { EIP712Domain, Permit },
			domain,
			primaryType: 'Permit',
			message,
		});
		const bufferMessage = Buffer.from(data).toString('hex');
		$web3Provider.send('personal_sign', [`0x${bufferMessage}`, $connectedAccount]).then((sig) => {
			dispatch('signature', {
				sig,
			});
		});
	};
</script>

<div class="preview">
	{#if user}
		<div class="preview-image">
			<img src={user.profile_image_url} alt={user.name} />
		</div>
		<div class="preview-description">
			<strong>@{user.username}</strong>
			<small>{user.name}</small>
			<div class="button-box">
				<Button on:click={signMessage} size="md">Sign</Button>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.preview {
		display: flex;
		flex-direction: row;
		margin-top: 10px;
		.preview-image {
			margin-right: 20px;
			img {
				width: 100px;
				height: 100px;
				border-radius: 5px;
			}
		}
		.preview-description {
			display: flex;
			flex-direction: column;
			.button-box {
				margin-top: 10px;
			}
		}
	}
</style>
