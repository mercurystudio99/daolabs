<script lang="ts">
	import { getContext } from 'svelte';
	import { getTotalSplitsPercentage } from '$utils/v2/distributions';
	import ActionModal from '$lib/components/ActionModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import SimpleSplits from '$lib/components/SimpleSplits.svelte';
	import { formattedNum, fromWad } from '$utils/formatNumber';
	import OwnerCrown from '$lib/components/OwnerCrown.svelte';
	import { openModal, bind } from '$lib/components/Modal.svelte';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { connectedAccount } from '$stores/web3';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import { distributeReservedTokensOf } from '$utils/web3/JBControllerWrapper';
	import { projectPlatformWithVersion } from '$constants/platform';
	import { web3Transact } from '$lib/transaction';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';

	export let close: () => {};
	export const isPreview = !!getContext('IS_PREVIEW');
	// TODO show the reserved amounts... could probably send
	// in the reserved amount to SimpleSplit as the distribution limit
	const project = getContext<Store<V2ProjectContextType>>('PROJECT');
	const totalSplitPercentageTokenSplits = getTotalSplitsPercentage(
		$project.reservedTokensSplits || [],
	);

	const title = `Distribute reserved ${String($project.tokenSymbol) || ''}`;

	async function distributeTokens() {
		const txnResponse = await web3Transact(
			'distributeReservedTokensOf',
			distributeReservedTokensOf,
			projectPlatformWithVersion($project.platform, $project.version),
			$project.projectId,
			'distribute tokens',
		);

		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'distributeReservedTokensOf',
				close: () => {},
			}),
		);
	}
</script>

<!-- eslint-disable -->

<ActionModal {title}>
	<InfoSpaceBetween>
		<p slot="left">Reserved {$project.tokenSymbol || ''}:</p>
		<p slot="right">
			{formattedNum(fromWad($project.reservedTokenBalance), { precision: 0 })}
			{$project.tokenSymbol || 'tokens'}
		</p>
	</InfoSpaceBetween>

	<h4>{$project.tokenSymbol || ''} recipients</h4>
	{#if $project.reservedTokensSplits}
		{#each $project.reservedTokensSplits as split}
			<SimpleSplits {split} crown={split.beneficiary === $project.projectOwnerAddress} />
		{/each}
	{/if}
	{#if $project.reservedTokensSplits.length && 100 - totalSplitPercentageTokenSplits > 0}
		<InfoSpaceBetween>
			<p slot="left">
				{#if $project.projectOwnerAddress === $connectedAccount}
					Project Owner (you)
				{:else}
					<EnsOrAddress address={$project.projectOwnerAddress} />
				{/if}
				<OwnerCrown />:
			</p>
			<p slot="right">{formattedNum(100 - totalSplitPercentageTokenSplits, { precision: 2 })}%</p>
		</InfoSpaceBetween>
	{/if}
	<div slot="footer">
		<Button type="secondary" size="md" on:click={close}>Close</Button>
		<Button type="primary" size="md" on:click={distributeTokens}
			>Distribute {$project.tokenSymbol?.toUpperCase() || 'tokens'}</Button
		>
	</div>
</ActionModal>

<style>
	h4 {
		color: var(--text-header);
	}
</style>
