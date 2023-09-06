<script lang="ts">
	import { getContext } from 'svelte';
	import { constants } from 'ethers';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import Trans from '$lib/components/Trans.svelte';
	import { openModal, bind } from '$lib/components/Modal.svelte';
	import { tokenSymbolText } from '$utils/tokenSymbolText';
	import { connectedAccount, readNetwork } from '$stores/web3';
	import RedeemTokens from './RedeemTokens.svelte';
	import MintTokens from './MintTokens.svelte';
	import ClaimTokens from './ClaimTokens.svelte';
	import BurnTokens from './BurnTokens.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	export let close: () => void;

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');

	const isOwner =
		$connectedAccount &&
		$project.projectOwnerAddress &&
		$connectedAccount.toLowerCase() === $project.projectOwnerAddress.toLowerCase();

	const tokenMintingEnabled = $project.fundingCycleMetadata.allowMinting;

	$: hasOverflow = Boolean($project.primaryTerminalCurrentOverflow?.gt(0));

	$: redeemDisabled = !hasOverflow;

	let tokensLabel: string;
	$: tokensLabel = tokenSymbolText({
		tokenSymbol: $project.tokenSymbol,
		capitalize: false,
		plural: true,
	});

	let currentNetworkLabel: string;
	$: currentNetworkLabel = $readNetwork.label;

	$: hasIssuedTokens = $project.tokenAddress && $project.tokenAddress !== constants.AddressZero;

	// TODO check when these buttons are disabled, and what disabled text to show
	$: buttons = [
		{
			label: `Redeem ${tokensLabel} for ${currentNetworkLabel}`,
			body: `Redeem your ${tokensLabel} for a portion of the project's overflow. Any ${tokensLabel} you redeem will be burned.`,
			onClick: () => {
				openModal(bind(RedeemTokens));
			},
			disabled: redeemDisabled,
		},
		redeemDisabled
			? {
					label: `Burn ${tokensLabel}`,
					body: `Burn your ${tokensLabel}. You won't receive ${currentNetworkLabel} in return because this project has no overflow.`,
					onClick: () => {
						openModal(bind(BurnTokens));
					},
					disabled: false,
			  }
			: null,
		hasIssuedTokens
			? {
					label: `Claim ${tokensLabel} as ERC-20`,
					body: `Move your ${tokensLabel} from the Juicebox contract to your wallet.`,
					onClick: () => {
						openModal(bind(ClaimTokens));
					},
					disabled: false,
			  }
			: null,
		isOwner && tokenMintingEnabled
			? {
					label: `Mint ${tokensLabel}`,
					body: `Mint new ${tokensLabel} into an account. Only a project's owner, a designated operator, or one of its terminal's delegates can mint its tokens.`,
					onClick: () => {
						openModal(bind(MintTokens, { hasIssuedTokens }));
					},
					disabled: false,
			  }
			: null,
	].filter(Boolean);
</script>

<main>
	<h3>Manage {$project.tokenSymbol || 'tokens'}</h3>
	{#each buttons as button}
		<button on:click={button.onClick} disabled={button.disabled}>
			<div>
				<h4><Trans>{button.label}</Trans></h4>
				<p>{button.body}</p>
			</div>
			<div class="icon">
				<Icon name="caret" />
			</div>
		</button>
	{/each}
</main>
<div class="buttons">
	<Button type="secondary" size="md" on:click={close}>Cancel</Button>
</div>

<style>
	h3 {
		color: var(--text-header);
		margin-bottom: 40px;
	}

	h4,
	.icon {
		color: var(--text-action-primary);
	}

	h4,
	p {
		text-align: left;
	}

	main {
		max-width: 480px;
	}
	/* TODO used in ProjectConfig, needs to be drawer type button */
	button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border: 1px solid var(--stroke-action-primary);
		padding: 12px 12px;
		width: 100%;
		background: transparent;
		margin: 16px 0px;
		cursor: pointer;
	}

	button p {
		font-size: 0.75rem;
		font-weight: 300;
		margin: 5px 0px;
	}

	button:disabled,
	button:disabled h4,
	button:disabled .icon {
		color: var(--text-disabled);
	}
	button:disabled {
		border: 1px solid var(--stroke-disabled);
		cursor: not-allowed;
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
	}

	.icon {
		margin-left: 10px;
	}
</style>
