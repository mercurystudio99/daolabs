<script lang="ts">
	import { getContext } from 'svelte';
	import { constants } from 'ethers';
	import ActionModal from '$lib/components/ActionModal.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import Button from '$lib/components/Button.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { parseWad } from '$utils/formatNumber';
	import { openModal, bind } from '$lib/components/Modal.svelte';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { mintTokensOf } from '$utils/web3/JBControllerWrapper';
	import { projectPlatformWithVersion } from '$constants/platform';
	import { web3Transact } from '$lib/transaction';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	export let close: () => void;
	export let hasIssuedTokens: boolean;
	let minting = false;
	const values = {
		receiver: '',
		amount: '',
		memo: '',
		mintERC20: false,
	};

	const project: Store<V2ProjectContextType> = getContext('PROJECT');
	const reloadProject: Function = getContext('RELOAD_PROJECT');

	const erc20Issued = $project.tokenSymbol && hasIssuedTokens;

	// Whether to use the current funding cycle's reserved rate in the mint calculation.
	const reservedRate = true;

	const fields = {
		receiver: {
			label: 'Token receiver',
			placeholder: constants.AddressZero,
			type: 'address',
			props: {
				required: true,
			},
		},
		amount: {
			label: 'Token amount',
			description: 'The amount of tokens to mint to the receiver.',
		},
		memo: {
			label: 'Memo',
			placeholder: 'Memo included on-chain (optional)',
		},
	};

	async function mint() {
		minting = true;
		const formattedValues = {
			value: parseWad(values.amount),
			beneficiary: values.receiver,
			memo: values.memo ?? '',
			preferClaimed: values.mintERC20,
		};

		const txnResponse = await web3Transact(
			'mintTokensOf',
			mintTokensOf,
			projectPlatformWithVersion($project.platform, $project.version),
			$project.projectId,
			formattedValues.value,
			formattedValues.beneficiary,
			formattedValues.memo,
			formattedValues.preferClaimed,
			reservedRate,
		);

		openModal(
			bind(PendingTransaction, { txnResponse, functionName: 'mintTokensOf', close: () => {} }),
		);

		const txnResult = await txnResponse.wait();
		console.log(txnResult);
		minting = false;
		reloadProject?.();
	}
</script>

<ActionModal title="Mint tokens">
	<p>
		Note: Tokens can be minted manually when allowed in the current funding cycle. This can be
		changed by the project owner for upcoming cycles.
	</p>

	{#each Object.keys(fields) as field}
		<FormField field={{ ...fields[field], id: field }} bind:value={values[field]} />
	{/each}

	<div class="toggle">
		<label for="mint-as-erc20">Mint as ERC-20</label>
		<Toggle id="mint-as-erc20" bind:checked={values.mintERC20} disabled={!erc20Issued} />
		{#if erc20Issued}
			<p>
				<Trans>
					Enabling this will mint {$project.tokenSymbol} ERC-20 tokens. Otherwise, unclaimed {$project.tokenSymbol}
					tokens will be minted, which can be claimed later as ERC-20 by the receiver.
				</Trans>
			</p>
		{:else}
			<p>
				<Trans>
					ERC-20 tokens can only be minted once an ERC-20 token has been issued for this project.
				</Trans>
			</p>
		{/if}
	</div>

	<div slot="footer">
		<Button type="secondary" size="md" on:click={close}>Close</Button>
		<Button type="primary" size="md" on:click={mint} loading={minting}>Mint tokens</Button>
	</div>
</ActionModal>

<style>
	p {
		font-weight: 300;
	}

	.toggle {
		margin-top: 20px;
	}

	.toggle label {
		display: block;
		padding-bottom: 10px;
	}
</style>
