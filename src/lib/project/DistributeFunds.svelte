<script lang="ts">
	import { getContext } from 'svelte';
	import { BigNumber } from 'ethers';
	import { DistributionLimitType } from '$constants';
	import {
		amountFromPercentBN,
		getDistributionLimitType,
		getTotalSplitsPercentage,
	} from '$utils/v2/distributions';
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Money from '$lib/components/Money.svelte';
	import SimpleSplits from '$lib/components/SimpleSplits.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import Input from '$lib/components/Input.svelte';
	import OwnerCrown from '$lib/components/OwnerCrown.svelte';
	import { V2_CURRENCY_USD } from '$utils/v2/currency';
	import { getCurrencyConverter } from '$data/currency';
	import { formatWad, parseWad } from '$utils/formatNumber';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { connectedAccount } from '$stores/web3';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import { distributePayoutsOf } from '$utils/web3/JBETHPaymentTerminal';
	import { getProjectPlatform } from '$lib/projects/data';
	import { web3Transact } from '$lib/transaction';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	export let close: () => {};
	let amount: number = 0;

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');

	const totalSplitPercentagePayoutSplits = getTotalSplitsPercentage($project.payoutSplits || []);
	const distributionLimitType = getDistributionLimitType($project.distributionLimit);

	export let totalFunds: BigNumber; // as formatted value

	let fee: BigNumber;
	let totalAfterFee: BigNumber | string;

	$: fee = amountFromPercentBN({ percent: 2.5, amount: totalFunds });
	$: console.log({ totalFunds, fee });
	$: totalAfterFee = totalFunds.sub(fee);

	function getOwnerAmountPayoutSplits(summedSplitsPercent: number) {
		const remainingPercent = 100 - summedSplitsPercent;
		return $project.distributionLimit
			.mul(+remainingPercent.toFixed(2) > 0 ? 1 : +remainingPercent.toFixed(2))
			.div(100);
	}

	function setMax() {
		amount = Number(formatWad(totalAfterFee));
	}

	async function distributeFunds() {
		if (!$project.distributionLimitCurrency?.toNumber() || !amount) return;
		const converter = await getCurrencyConverter();

		const unusedFunds =
			$project.distributionLimit?.sub($project.usedDistributionLimit ?? 0) ?? BigNumber.from(0);
		const distributable: BigNumber | string = $project.balanceInDistributionLimitCurrency?.gt(
			unusedFunds,
		)
			? unusedFunds
			: $project.balanceInDistributionLimitCurrency;

		if (!$project.distributionLimitCurrency || !distributable) return;

		const minAmount = (
			BigNumber.from($project.distributionLimitCurrency).eq(V2_CURRENCY_USD)
				? converter.usdToWei(distributable.toString())
				: parseWad(distributable)
		)?.sub(1e12); // Arbitrary value subtracted
		if (!minAmount) return;

		const minReturnedTokens = 0; // TODO will need a field for this in WithdrawModal for v2

		const txnResponse = await web3Transact(
			'distributePayoutsOf',
			distributePayoutsOf,
			getProjectPlatform(project),
			$project.projectId,
			parseWad(amount),
			minReturnedTokens,
		);

		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'distributePayoutsOf',
				close: () => {},
			}),
		);
	}
</script>

<ActionModal title="Distribute funds">
	<div class="breakdown">
		<InfoSpaceBetween>
			<p slot="left">Total funds:</p>
			<p slot="right">
				<Money
					currency={$project.distributionLimitCurrency ?? BigNumber.from(0)}
					amount={totalFunds}
					formatWad={true}
				/>
			</p>
		</InfoSpaceBetween>
		<InfoSpaceBetween>
			<p slot="left">JBX Fee (2.5%):</p>
			<p slot="right">
				-<Money
					currency={$project.distributionLimitCurrency ?? BigNumber.from(0)}
					amount={fee}
					formatWad={true}
				/>
			</p>
		</InfoSpaceBetween>
		<hr />
		<InfoSpaceBetween>
			<p slot="left"><b>Available after fee:</b></p>
			<p slot="right">
				<b>
					<Money
						currency={$project.distributionLimitCurrency ?? BigNumber.from(0)}
						amount={totalAfterFee}
						formatWad={true}
					/>
				</b>
			</p>
		</InfoSpaceBetween>
	</div>

	<Input type="number" bind:value={amount}>
		<div slot="addon" role="button" on:click={setMax} on:keydown>MAX</div>
	</Input>

	<h4><Trans>Payout recipients</Trans></h4>
	{#each $project.payoutSplits as split}
		<SimpleSplits {split} />
	{/each}
	<InfoSpaceBetween>
		<p slot="left">
			{#if $project.projectOwnerAddress === $connectedAccount}
				(you)
			{:else}
				<EnsOrAddress address={$project.projectOwnerAddress} />
			{/if}
			<OwnerCrown />:
		</p>
		<p slot="right">
			{100 - totalSplitPercentagePayoutSplits}%
			{#if distributionLimitType === DistributionLimitType.Specific}
				(<Money
					currency={$project.distributionLimitCurrency ?? BigNumber.from(0)}
					amount={getOwnerAmountPayoutSplits(totalSplitPercentagePayoutSplits)}
					precision={2}
				/>)
			{/if}
		</p>
	</InfoSpaceBetween>
	<p class="info"><Icon name="infoCircle" /> Recipients will receive payouts in ETH.</p>
	<div slot="footer">
		<Button type="secondary" size="md" on:click={close}>Close</Button>
		<Button type="primary" size="md" on:click={distributeFunds}>Distribute funds</Button>
	</div>
</ActionModal>

<style>
	h4 {
		margin-top: 40px;
		color: var(--text-header);
	}

	p.info {
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	div[slot='addon'] {
		cursor: pointer;
		color: var(--text-action-primary);
		text-align: center;
		background: var(--background-action-secondary);
		border-radius: var(--radius-sm);
		padding: 0px 6px;
	}

	.breakdown {
		margin-bottom: 2rem;
	}
	.breakdown p {
		margin: 0;
		font-weight: 300;
	}

	.breakdown hr {
		border-top: 1px solid var(--stroke-secondary);
	}
</style>
