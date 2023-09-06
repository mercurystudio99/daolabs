<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { BigNumber } from 'ethers';
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { formattedNum, fromWad, parseWad } from '$utils/formatNumber';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import { tokenSymbolText } from '$utils/tokenSymbolText';
	import { connectedAccount } from '$stores/web3';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { claimFor, unclaimedBalanceOf } from '$utils/web3/JBTokenStoreWrapper';
	import { getProjectPlatform } from '$lib/projects/data';
	import { web3Transact } from '$lib/transaction';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');
	const reloadProject: Function = getContext('RELOAD_PROJECT');

	export let close: () => void;

	let tokenSymbol: string;

	$: tokenSymbol = tokenSymbolText({
		tokenSymbol: $project.tokenSymbol,
		capitalize: false,
		plural: true,
	});
	$: title = `Claim ${tokenSymbol} as ERC-20 tokens`;

	let input = 0;
	let unclaimedTokens: BigNumber = BigNumber.from('10000000000000000000');

	onMount(async () => {
		// TODO: contract read
		// Pre set the amount to the max amount of tokens the user has
		unclaimedTokens = await unclaimedBalanceOf(
			getProjectPlatform(project),
			$project.projectId,
			$connectedAccount,
		);
	});

	async function claimTokens() {
		const claimAmount = BigNumber.from(parseWad(input));
		if (claimAmount.lte(unclaimedTokens)) {
			const txnResponse = await web3Transact(
				'claimFor',
				claimFor,
				getProjectPlatform(project),
				$connectedAccount,
				$project.projectId,
				claimAmount,
			);

			openModal(
				bind(PendingTransaction, {
					txnResponse,
					functionName: 'claimFor',
					close: () => {},
				}),
			);
			const txnResult = await txnResponse.wait();
			console.log(txnResult);
			reloadProject?.();
		}
	}

	function setMax() {
		input = Number(fromWad(unclaimedTokens));
	}
</script>

<!-- NOTE using form for the built in validation -->
<form on:submit|preventDefault={claimTokens}>
	<ActionModal {title}>
		<p>
			<Trans>
				Claiming {tokenSymbol} tokens will convert your {tokenSymbol} balance to ERC-20 tokens and mint
				them to your wallet.
			</Trans>
		</p>
		<h4><Trans>If you're unsure if you need to claim, you probably don't.</Trans></h4>
		<p>
			<Trans
				>You can redeem your {tokenSymbol} tokens for overflow without claiming them. You can transfer
				your unclaimed {tokenSymbol} tokens to another address from the Tools menu, which can be accessed
				from the wrench icon in the upper right hand corner of this project.</Trans
			>
		</p>
		<h4><Trans>Amount of ERC-20 tokens to claim</Trans></h4>

		<aside>
			<p class="secondary">
				<Trans>Your unclaimed {$project.tokenSymbol || ''} tokens</Trans>:
				<span> {formattedNum(fromWad(unclaimedTokens), { precision: 4 })}</span>
			</p>
			<p class="secondary">
				<Trans>{$project.tokenSymbol || ''} ERC-20 address</Trans>:
				<span>
					<EnsOrAddress address={$project.tokenAddress} />
				</span>
			</p>
		</aside>

		<Input type="number" bind:value={input} max={Number(fromWad(unclaimedTokens))} required>
			<div slot="addon" role="button" on:click={setMax} on:keydown>MAX</div>
		</Input>
		<div slot="footer">
			<!-- Extra type so form understand this isn't a submit -->
			<Button type="secondary" buttonProps={{ type: 'button' }} size="md" on:click={close}>
				Close
			</Button>
			<Button
				type="primary"
				size="md"
				disabled={BigNumber.from(parseWad(input || '0')).gt(unclaimedTokens)}
				>Claim {tokenSymbol}</Button
			>
		</div>
	</ActionModal>
</form>

<style>
	p {
		font-weight: 300;
	}

	/* TODO this is now reused across three components, find abstraction */
	div[slot='addon'] {
		padding: 0px 5px;
		cursor: pointer;
		color: var(--text-action-primary);
		text-align: center;
		background: var(--background-action-secondary);
		border-radius: var(--radius-sm);
	}

	span {
		color: var(--text-primary);
	}
</style>
