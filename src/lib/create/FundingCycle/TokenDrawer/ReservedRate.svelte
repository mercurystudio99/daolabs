<script lang="ts">
	import { formattedNum } from '$utils/formatNumber';
	import Button from '$lib/components/Button.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import Range from '$lib/components/Range.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import DisplaySplit from '$lib/components/Split.svelte';
	import { bind } from '$lib/components/Modal.svelte';
	import { getTotalSplitsPercentage } from '$utils/v2/distributions';

	import PopInfo from '$lib/components/PopInfo.svelte';
	import AddTokenReceiverModal from './AddTokenReceiverModal.svelte';
	import type { Split } from '$models/v2/splits';
	import type { BigNumberish } from 'ethers';

	export let reservedRate: number = 0;
	export let checked: boolean = reservedRate > 0;
	export let issuanceRate: number = 0;
	export let openModal: (arg1: any) => void;
	export let splits: Split[] = [];
	let totalSplitsPercentage = getTotalSplitsPercentage(splits);

	let rangeValue: number[] = [reservedRate];
	// let splits = reservedTokensSplits.get();

	// TODO: these split functions are copied from FundingDrawer.svelte, think of nice abstraction
	function addSplit(split: Split) {
		splits = [...splits, split];
	}

	function editSplit(split: Split) {
		splits = splits.map((m) => {
			// TODO maybe make a derived hash of the split
			if (
				split.beneficiary === m.beneficiary ||
				(Number(split.projectId) !== 0 && Number(split.projectId) === Number(m.projectId))
			) {
				return { ...m, ...split };
			}
			return m;
		});
	}

	function removeSplit(split: Split) {
		splits = splits.filter(
			(s) =>
				!(s.beneficiary === split.beneficiary && Number(s.projectId) === Number(split.projectId)),
		);
	}

	// Reserved tokens received by project per ETH
	let initialReservedTokensPerEth: BigNumberish;
	// Tokens received by contributor's per ETH
	let initialIssuanceRate: BigNumberish;
	$: {
		totalSplitsPercentage = getTotalSplitsPercentage(splits || []);
		reservedRate = rangeValue[0];
		initialReservedTokensPerEth = issuanceRate * ((reservedRate ?? 0) / 100);
		initialIssuanceRate = issuanceRate - initialReservedTokensPerEth;
	}
</script>

<header>
	<Toggle id="reserved" bind:checked>
		<h3 class="toggle-title">
			Reserved tokens
			{#if !reservedRate}
				<span>(0%)</span>
			{/if}
		</h3>
	</Toggle>
</header>
{#if checked}
	<Range bind:values={rangeValue} />
{/if}
<br />
<p>Reserve a percentage of freshly minted tokens for your project to use.</p>
<div class="info">
	<div class="info-item">
		<span
			>Contributor rate<PopInfo
				message="Tokens <b>contributors will receive</b> when they contribute 1 ETH."
				placement="top"
			/>:</span
		>
		<span>{formattedNum(initialIssuanceRate)} tokens / 1 ETH</span>
	</div>
	<div class="info-item">
		<span
			>Reserved rate<PopInfo
				message="Tokens <b>reserved for the project</b> when 1 ETH is contributed."
				placement="top"
			/>:</span
		>
		<span>{formattedNum(initialReservedTokensPerEth)} tokens / 1 ETH</span>
	</div>
</div>
{#if reservedRate > 0}
	<h4>Reserved token allocation (optional)</h4>
	{#each splits as split, editingIndex (split.beneficiary)}
		<DisplaySplit
			{split}
			onRemove={removeSplit}
			onClick={(s) => {
				openModal(
					bind(AddTokenReceiverModal, {
						close() {},
						reservedRate,
						editingIndex,
						onFinish: editSplit,
						split: s,
						splits,
					}),
				);
			}}
		/>
	{/each}
	<InfoSpaceBetween>
		<p slot="left">
			Total: {totalSplitsPercentage.toFixed(2)}%
		</p>
		<p slot="right">
			{(100 - totalSplitsPercentage).toFixed(2)}% to project owner
		</p>
	</InfoSpaceBetween>
	<Button
		type="tertiary"
		size="md"
		on:click={() =>
			openModal(
				bind(AddTokenReceiverModal, { close() {}, reservedRate, onFinish: addSplit, splits }),
			)}
	>
		Add token receiver</Button
	>
	<p>
		Allocate a portion of your project's reserved tokens to other Ethereum wallets or Juicebox
		projects.
	</p>
{/if}

<style lang="scss">
	.info {
		background-color: var(--background-l1);
		padding: 20px 20px;
		font-weight: 300;
		display: flex;
		align-items: flex-start;
		flex-direction: column;
		margin-bottom: 10px;
		.info-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			span {
				display: flex;
				align-items: center;
			}
		}
	}
	p {
		color: var(--text-secondary);
	}
</style>
