<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import { connectedAccount } from '$stores/web3';
	import type { User } from '$utils/users/user';

	export let user: User;
	export let saveProfile;

	let text = '';
	let editMode = false;

	/*
		TODO: Consider adding a dropdown of the common legal templates users may want to use.		
	*/

	const edit = () => {
		text = user.legalContent;
		editMode = true;
	};
	const reset = () => {
		user.legalContent = '';
		text = '';
	};
	const save = async () => {
		if (user.legalContent === text) {
			editMode = false;
			return;
		}
		user.legalContent = text;
		await saveProfile(user);
	};
</script>

<HeavyBorderBox>
	<div class="box">
		<h4>Profile Terms</h4>
		<p>
			This space is available for you to include any custom legal terms you would like associated
			with your Collections, Treasuries or generally your Profile. We have created a free legal
			resources template website at
			<a href="https://docs.move.xyz/legal/intro/README.md" target="_blank" rel="noreferrer"
				>Legal</a
			>. Feel free create any customized template, export the markdown and copy and paste below.
		</p>
		<br />
		{#if user.legalContent && !editMode}
			<div class="saved-content">
				<div class="wrap">
					<span>{user.legalContent}</span>
				</div>
				<Button size="md" type="tertiary" on:click={reset}>Reset</Button>
				<Button size="md" type="primary" on:click={edit}>Edit</Button>
			</div>
		{:else}
			<Textarea id="customTerms" bind:value={text} rows={5} />
			<Button size="md" type={text ? 'primary' : 'secondary'} on:click={save} disabled={!text}>
				{!$connectedAccount ? 'Connect wallet' : 'Save'}
			</Button>
		{/if}
	</div>
</HeavyBorderBox>

<style lang="scss">
	.box {
		display: flex;
		flex-direction: column;
		gap: 8px;

		p {
			font-weight: 400;
			color: var(--text-secondary);
			margin-bottom: 0;
		}

		h4 {
			font-size: 16px;
			font-weight: 400;
			color: var(--text-header);
			margin-bottom: 0;
		}
		.saved-content {
			margin-top: 8px;
			display: flex;
			flex-direction: column;
			gap: 18px;

			.wrap {
				padding: 8px 16px;
				border: 0.4px solid var(--stroke-tertiary);

				span {
					font-weight: 400;
					color: var(--text-secondary);
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 3;
					line-clamp: 3;
					-webkit-box-orient: vertical;
					word-break: break-word;
				}
			}
		}
	}
</style>
