<script lang="ts">
	/**
	 * This is the modal that helps create a ERC-20 token.
	 */

	import { getContext } from 'svelte';
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { issueTokenFor } from '$utils/web3/JBControllerWrapper';
	import { issueFor } from '$utils/web3/JBTokenStoreWrapper';
	import { projectPlatformWithVersion } from '$constants/platform';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';

	export let close: () => void;
	export const onSuccess: () => void = () => null;

	let loading = false;

	const projectContext: Store<V2ProjectContextType> = getContext('PROJECT');

	let name = '';
	let symbol = '';

	async function issueToken() {
		if (!$projectContext) return console.error('project context not set');
		loading = true;
		console.log();
		try {
			const pv = 3;
			const txnResponse =
				$projectContext.version === '3'
					? await issueFor(
							projectPlatformWithVersion($projectContext.platform, $projectContext.version),
							$projectContext.projectId,
							name,
							symbol,
					  )
					: await issueTokenFor(
							projectPlatformWithVersion($projectContext.platform, $projectContext.version),
							$projectContext.projectId,
							name,
							symbol,
					  );
			openModal(
				bind(PendingTransaction, {
					txnResponse,
					functionName: pv === 3 ? 'issueFor' : 'issueTokenFor',
					close: () => {},
				}),
			);
			const txn = await txnResponse.wait();
			console.log(txn.transactionHash);
			close?.();
		} catch (error) {
			loading = false;
			console.error(error);
		}
		loading = false;
	}
</script>

<form on:submit|preventDefault={issueToken}>
	<ActionModal title="Issue an ERC-20 token">
		<p>
			Issue an ERC-20 to be used as this project's token. Once issued, anyone can claim their
			existing token balance in the new token.
		</p>
		<Input type="text" placeholder="Project token" label="Token name" required bind:value={name} />
		<Input type="text" placeholder="PRJ" label="Token symbol" required bind:value={symbol} />
		<div slot="footer">
			<Button on:click={close} type="secondary" size="md" buttonProps={{ type: 'button' }}
				>Close</Button
			>
			<Button size="md" {loading}>Issue token</Button>
		</div>
	</ActionModal>
</form>

<style>
	p {
		font-weight: 300;
	}
</style>
