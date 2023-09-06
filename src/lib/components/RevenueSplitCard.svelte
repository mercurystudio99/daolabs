<script lang="ts">
	import { isAddress } from 'ethers/lib/utils';
	import { onMount } from 'svelte';
	import { BigNumber } from 'ethers';
	import { formattedNum, fromWad } from '$utils/formatNumber';
	import {
		pendingForAddress,
		pendingForProject,
	} from '$utils/web3/extensions/MixedPaymentSplitterWrapper';
	import { connectedAccount } from '$stores/web3';
	import Button from './Button.svelte';
	import CloseButton from './CloseButton.svelte';
	import EnsOrAddress from './EnsOrAddress.svelte';
	import Ethereum from './Ethereum.svelte';
	import Icon from './Icon';
	import Popover from './Popover.svelte';
	import Skeleton from './Skeleton.svelte';
	import type { RevenueSplit } from '$models/user/revenue-splits';

	export let split: RevenueSplit;
	export let selected: boolean = false;
	export let selectSplit: () => void = () => {};
	export let deleteSplit: () => Promise<void> = () => Promise.resolve();
	export let withdrawSplit: () => Promise<boolean> = () => Promise.resolve(false);
	export let deleteSplitAvailable: boolean = false;
	export let ethereumPrice: number = 1;

	const zeroBigNumber = BigNumber.from(0);

	let expanded = false;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let loadingAmount = false;
	let currency: string = 'ETH';
	let amount: BigNumber;

	const loadBalances = async () => {
		const { address, recipients } = split;

		if (!address || !recipients) return;

		for (let i = 0; i < recipients.length; i++) {
			const recipient = recipients[i];

			recipient.shareAmount = isAddress(recipient.address)
				? await pendingForAddress(address, recipient.address)
				: await pendingForProject(address, Number(recipient.address));
		}

		split.recipients = [...recipients];
	};

	const handleWithdrawSplit = async (event: Event) => {
		event.stopPropagation();
		if (withdrawSplit && (await withdrawSplit())) {
			await loadBalances();
		}
	};

	const changeCurrency = () => {
		currency = currency === 'ETH' ? 'USD' : 'ETH';
	};

	const getFormattedAmount = (num: number, currencyName: string) => {
		if (currencyName === 'ETH') {
			return formattedNum(num, {
				padEnd: true,
				empty: '0.00',
			});
		} else {
			return formattedNum(num * ethereumPrice, {
				padEnd: true,
				empty: '0.00',
				precision: 2,
			});
		}
	};

	onMount(async () => {
		loadingAmount = true;

		try {
			await loadBalances();
		} catch (error) {
			console.log('Failed to get split balance', error);
		} finally {
			loadingAmount = false;
		}
	});

	$: deleteSplitAvailable =
		deleteSplitAvailable && !split.address && (!split.createdBy || split.createdBy === 'user');
	$: amount =
		split.recipients?.reduce((acc, r) => acc.add(r.shareAmount ?? zeroBigNumber), zeroBigNumber) ??
		zeroBigNumber;
	$: withdrawSplitAvailable =
		split.address &&
		split.recipients?.some(
			(r) => isAddress(r.address) && r.address.toLowerCase() === $connectedAccount.toLowerCase(),
		);
</script>

<div class="split" class:selected on:click={selectSplit} on:keydown>
	<div class="row">
		<span class="expandable" on:click|stopPropagation={() => (expanded = !expanded)} on:keydown>
			<Icon name={expanded ? 'chevronDown' : 'chevronRight'} />
			{split.name}
		</span>
		<span class="right">
			<Skeleton loading={loadingAmount} width="40px" height="26px">
				<div>{getFormattedAmount(Number(fromWad(amount)), currency)}</div>
			</Skeleton>
			<div class="currency" on:keydown on:click|stopPropagation={changeCurrency}>
				{currency}
				<Icon name="caret" direction="e" />
			</div>
			{#if withdrawSplitAvailable}
				<Button size="md" type="secondary" on:click={handleWithdrawSplit}>Withdraw</Button>
			{/if}
		</span>
	</div>
	<div class="row">
		<span>
			<div class="address">
				{#if split.address}
					<EnsOrAddress address={split.address} />
				{:else}
					Not yet deployed
				{/if}
			</div>
			<div class="divider" />
			<small>{split.recipients?.length ?? 0} recipients</small>
			{#if split.network}
				<div class="divider" />
				<small><Icon name="ethereum" /> {split.network}</small>
			{/if}
		</span>
	</div>
	{#if expanded && split.recipients}
		{#each split.recipients as recipient}
			<div class="row recipients">
				<span class="recipient">
					{#if isAddress(recipient.address)}
						<EnsOrAddress address={recipient.address} />
					{:else}
						<Popover placement="top">
							<div slot="content" class="tooltip">
								Go to project
								<a href={`/projects/${String(recipient.address)}`} class="link">
									<Icon name="link" style="transition: unset" />
								</a>
							</div>
							{recipient.displayName}
						</Popover>
					{/if}
					<small>{recipient.percent}% of revenue</small>
				</span>
				<span class="right nowrap">
					<div>
						{#if currency === 'ETH'}
							<Ethereum />
						{:else}
							$
						{/if}
					</div>
					<Skeleton loading={loadingAmount} width="40px" height="26px">
						<div>{getFormattedAmount(Number(fromWad(recipient.shareAmount)), currency)}</div>
					</Skeleton>
				</span>
			</div>
		{/each}
	{/if}
	{#if deleteSplitAvailable}
		<div class="delete" on:click|stopPropagation={deleteSplit} on:keydown>
			<CloseButton size="12px" position="0" />
		</div>
	{/if}
</div>

<style lang="scss">
	.split {
		padding: 16px 32px;
		display: flex;
		flex-direction: column;
		border: 0.4px solid var(--stroke-tertiary);
		gap: 4px;
		position: relative;

		&:hover {
			border: 0.4px solid var(--stroke-secondary);

			.delete {
				display: block;
			}
		}
		.row {
			display: flex;
			justify-content: space-between;
			gap: 8px;

			span {
				display: flex;
				flex-wrap: wrap;
				gap: 8px;
				font-size: 16px;
				align-items: center;

				.currency {
					color: var(--text-action-primary);
					background: var(--background-action-secondary);
					font-size: 12px;
					font-weight: 300;
					white-space: nowrap;
					display: flex;
					align-items: center;
					padding: 4px 8px;
				}

				.address {
					font-size: 14px;
					color: var(--text-action-primary);
				}
				.divider {
					width: 4px;
					height: 4px;
					border-radius: 50%;
					background-color: var(--text-action-primary);
					margin: 0 4px;
				}

				small {
					font-size: 14px;
					color: var(--text-tertiary);
					display: flex;
					align-items: center;
					gap: 8px;
				}
			}

			.right {
				justify-content: flex-end;
			}
			.expandable {
				cursor: pointer;
				flex-wrap: nowrap;
			}

			.nowrap {
				flex-wrap: nowrap;
			}
		}
		.recipients {
			margin-top: 4px;

			.recipient {
				column-gap: 24px;
				row-gap: 8px;
			}
		}

		.delete {
			position: absolute;
			display: none;
			top: 8px;
			right: 8px;
			cursor: pointer;
		}
	}

	.selected {
		border: 0.4px solid var(--stroke-action-primary);

		&:hover {
			border: 0.4px solid var(--stroke-action-primary);
		}
	}
	.tooltip {
		font-weight: 300;
		font-size: 14px;
		word-wrap: break-word;
		color: var(--text-primary);
		text-align: start;
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		.split {
			padding: 8px 16px;

			.delete {
				right: 0px;
			}
		}

		.split > .row {
			flex-wrap: wrap;
			.right {
				width: 100%;
			}
		}

		.split > .row ~ .row {
			flex-wrap: nowrap;
			.right {
				width: auto;
			}
		}
	}
</style>
