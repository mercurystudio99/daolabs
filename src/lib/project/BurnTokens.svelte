<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { BigNumber, constants } from 'ethers';
	import { randomBytes } from 'ethers/lib/utils.js';
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import Input from '$lib/components/Input.svelte';
	import { formatRedemptionRate, MAX_REDEMPTION_RATE } from '$utils/v2/math';
	import { tokenSymbolText } from '$utils/tokenSymbolText';
	import Ethereum from '$lib/components/Ethereum.svelte';
	import { V2BallotState } from '$models/ballot';
	import { V2_CURRENCY_USD } from '$utils/v2/currency';
	import { connectedAccount } from '$stores/web3';
	import { formatPercent, formatWad, fromWad, parseWad } from '$utils/formatNumber';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { reservedTokenBalanceOf } from '$utils/web3/JBControllerWrapper';
	import { redeemTokensOf } from '$utils/web3/JBETHPaymentTerminal';
	import { getProjectPlatform } from '$lib/projects/data';
	import { projectPlatformWithVersion } from '$constants/platform';
	import { web3Transact } from '$lib/transaction';
	import type Store from '$utils/Store';
	import type { UserTokenBalanceContext, V2ProjectContextType } from '$models/project-type';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');
	const userTokenBalance = getContext<Store<UserTokenBalanceContext>>('USER_TOKEN_BALANCE');

	export let close: () => {};

	let amount: number;
	const title = `Burn ${String($project.tokenSymbol) || ''} tokens`;
	// TODO: contract read for current users project.tokenAddress
	// const userBalance = 0;
	let totalBalance: BigNumber;
	$: totalBalance = $userTokenBalance.totalBalance;
	$: userOwnershipPercentage = formatPercent(totalBalance, $project.totalTokenSupply) || '0';

	let rewardAmount = BigNumber.from(0);
	let maxClaimable = BigNumber.from(0);
	let minReturnedTokens = BigNumber.from(0);
	let undistributedReservedTokens = BigNumber.from(0);

	let ready = false;
	onMount(async () => {
		undistributedReservedTokens = await reservedTokenBalanceOf(
			projectPlatformWithVersion($project.platform, $project.version),
			$project.projectId,
			$project.fundingCycleMetadata?.reservedRate,
		);
		ready = true;
	});

	async function redeemTokensForEth() {
		const txnResponse = await web3Transact(
			'redeemTokensOf',
			redeemTokensOf,
			getProjectPlatform(project),
			$connectedAccount,
			$project.projectId,
			parseWad(amount),
			constants.AddressZero,
			minReturnedTokens,
			$connectedAccount,
			'', //TODO: memo field on V2RedeemModal
			randomBytes(1),
		);
		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'redeemTokensOf',
				close: () => {},
			}),
		);
		const txnResult = await txnResponse.wait();
		console.log(txnResult);
	}
	function setMax() {
		amount = Number(fromWad(totalBalance));
	}

	function ethReceivedFromTokens(tokenAmount: BigNumber) {
		const {
			fundingCycle,
			fundingCycleMetadata,
			primaryTerminalCurrentOverflow,
			totalTokenSupply,
			ballotState,
		} = $project;

		if (!fundingCycle) return;

		const realTotalTokenSupply = undistributedReservedTokens
			? totalTokenSupply?.add(undistributedReservedTokens)
			: totalTokenSupply;

		if (!fundingCycleMetadata || !realTotalTokenSupply?.gt(0) || !tokenAmount)
			return BigNumber.from(0);

		const redemptionRate =
			ballotState === V2BallotState.Active
				? fundingCycleMetadata.ballotRedemptionRate
				: fundingCycleMetadata.redemptionRate;

		const tokenAmountWad = parseWad(tokenAmount);

		// base = ox/s
		const base =
			realTotalTokenSupply && primaryTerminalCurrentOverflow
				? primaryTerminalCurrentOverflow.mul(tokenAmountWad).div(realTotalTokenSupply)
				: BigNumber.from(0);

		// numerator = r + (x(1 - r)/s)
		const numerator = redemptionRate.add(
			tokenAmountWad
				.mul(BigNumber.from(MAX_REDEMPTION_RATE).sub(redemptionRate))
				.div(realTotalTokenSupply),
		);

		// y = base * numerator ==> ox/s * ( r + (x(1 - r)/s) )
		return base.mul(numerator).div(MAX_REDEMPTION_RATE);
	}

	$: amount = Math.min(Number(fromWad(totalBalance)), Math.max(0, amount || 0));
	$: rewardAmount = ethReceivedFromTokens(BigNumber.from(parseWad(amount)));
	$: maxClaimable = ethReceivedFromTokens(totalBalance);
	$: minReturnedTokens = $project.distributionLimitCurrency?.eq(V2_CURRENCY_USD)
		? rewardAmount?.mul(1000).div(1005)
		: rewardAmount;
</script>

<!-- eslint-disable -->
<ActionModal {title}>
	<InfoSpaceBetween>
		<p slot="left">
			<Trans>Redemption rate</Trans>:
		</p>
		<p slot="right">
			{formatRedemptionRate($project.fundingCycleMetadata.redemptionRate)}%
		</p>
	</InfoSpaceBetween>
	<InfoSpaceBetween>
		<p slot="left">
			<Trans>
				{tokenSymbolText({ tokenSymbol: $project.tokenSymbol, capitalize: true })} balance
			</Trans>:
		</p>
		<div slot="right" style="display: flex; flex-direction: column; align-items: flex-end;">
			<div>
				{formatWad(totalBalance ?? 0, { precision: 0 })}
				{tokenSymbolText({ tokenSymbol: $project.tokenSymbol, capitalize: true }).toUpperCase()}
			</div>
			<div>
				<small><Trans>({userOwnershipPercentage}% of supply)</Trans></small>
			</div>
		</div>
	</InfoSpaceBetween>
	<InfoSpaceBetween>
		<p slot="left">
			<Trans>Currently worth</Trans>:
		</p>
		<p slot="right">
			<Ethereum />{formatWad(maxClaimable, { precision: 4 })}
		</p>
	</InfoSpaceBetween>
	<p>
		<strong>This project has no overflow</strong>, so you will not receive any ETH for burning
		tokens.
	</p>
	<Input type="number" placeholder="0" bind:value={amount}>
		<div slot="addon" role="button" on:click={setMax} on:keydown>MAX</div>
	</Input>
	<div slot="footer">
		<Button type="secondary" size="md" on:click={close}>Close</Button>
		<Button
			type="primary"
			size="md"
			on:click={redeemTokensForEth}
			disabled={!ready || !amount || Number(amount) === 0}>{title}</Button
		>
	</div>
	{#if $project.primaryTerminalCurrentOverflow?.gt(0)}
		<div style="font-weight: 500;margin-top: 20">
			{#if $project.distributionLimitCurrency.eq(V2_CURRENCY_USD)}
				<Trans>
					You will receive minimum {formatWad(
						$project.distributionLimitCurrency.eq(V2_CURRENCY_USD)
							? rewardAmount.mul(1000).div(1005)
							: rewardAmount,
						{ precision: 8 },
					) || '--'} ETH
				</Trans>
			{:else}
				<Trans>You will receive {formatWad(minReturnedTokens, { precision: 8 }) || '--'} ETH</Trans>
			{/if}
		</div>
	{/if}
</ActionModal>

<style>
	p {
		font-weight: 300;
	}
	/* TODO move this to reusable place */
	div[slot='addon'] {
		padding: 0 5px;
		cursor: pointer;
		color: var(--text-action-primary);
		text-align: center;
		background: var(--background-action-secondary);
		border-radius: var(--radius-sm);
	}
</style>
