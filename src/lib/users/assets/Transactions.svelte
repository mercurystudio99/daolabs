<script lang="ts">
	import { onMount } from 'svelte';
	import { constants } from 'ethers';
	import tokensByAddress from '$constants/tokensByAddress.json';
	import { dateToDateInput } from '$utils/formatDate';
	import { formattedNum } from '$utils/formatNumber';
	import EtherscanLink from '$lib/components/EtherscanLink.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Img from '$lib/components/Img.svelte';
	import ScrollBox from '$lib/components/ScrollBox.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import Icon from '$lib/components/Icon';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { getAssetTransfers } from './services';
	import type { GeckoTokenMetadata } from './types';
	import type {
		AssetTransfersWithMetadataResponse,
		AssetTransfersWithMetadataResult,
	} from 'alchemy-sdk';

	export let address: string;

	let loading = false;
	let transactions: Combined[] = [];
	let filteredTxs: Combined[] = [];
	let pageKey: { from: string; to: string } = { from: '', to: '' };
	let scrollTarget: HTMLElement;

	let maxHeight = 750;

	interface Extension {
		address: string;
		addressText: string;
		date: Date;
		token: GeckoTokenMetadata;
		type: string;
	}

	type Combined = AssetTransfersWithMetadataResult & Extension;

	const options = [
		{ label: 'All Events', value: 'all' },
		{ label: 'Normal Transactions', value: 'external' },
		{ label: 'Internal Transactions', value: 'internal' },
		{ label: 'ERC20 - Token Transfer Events', value: 'erc20' },
		{ label: 'ERC721 - Token Transfer Events', value: 'erc721' },
		{ label: 'ERC1155 - Token Transfer Events', value: 'erc1155' },
	];

	function prepareTransfers(transfers: AssetTransfersWithMetadataResult[]) {
		return transfers
			.map((transaction) => {
				const sentFromMe = transaction.from.toLowerCase() === address.toLowerCase();
				let type = sentFromMe ? 'Sent' : 'Received';
				let addressText = sentFromMe ? 'to' : 'from';
				let showAddress = sentFromMe ? transaction.to : transaction.from;
				const tokenMetadataKey = transaction.rawContract.address;
				const token = tokensByAddress[tokenMetadataKey] as GeckoTokenMetadata;
				if (
					transaction.from === constants.AddressZero &&
					['erc721', 'erc1155'].includes(transaction.category)
				) {
					type = 'Minted';
					addressText = 'nft contract';
					showAddress = transaction.rawContract.address;
				}
				const date = new Date(transaction.metadata?.blockTimestamp);
				return {
					...transaction,
					address: showAddress,
					addressText,
					date,
					token,
					type,
				};
			})
			.sort((a, b) => {
				return parseInt(b.blockNum) - parseInt(a.blockNum);
			});
	}

	function getHeightOfLeftColumn() {
		// I am so ashamed of this method, but flex will not cooperate and I've wasted
		// too much time on this.
		const element = document.querySelector('.leftColumn');
		if (element) {
			let height = Array.from(element.children).reduce(
				(accumulator, child) => accumulator + child.getBoundingClientRect().height,
				0,
			);
			height -= 30; // - for the padding of the header
			return height;
		}
		return 600;
	}

	async function getTransfers(isInitial = false) {
		loading = true;

		let responseFrom: AssetTransfersWithMetadataResponse = { transfers: [], pageKey: '' };
		let responseTo: AssetTransfersWithMetadataResponse = { transfers: [], pageKey: '' };

		if (isInitial) {
			responseFrom = await getAssetTransfers(null, address);
			responseTo = await getAssetTransfers(address, null);
		} else {
			if (pageKey.from) {
				responseFrom = await getAssetTransfers(null, address, pageKey.from);
			}
			if (pageKey.to) {
				responseTo = await getAssetTransfers(address, null, pageKey.to);
			}
		}

		pageKey = {
			from: responseFrom.pageKey,
			to: responseTo.pageKey,
		};

		transactions = prepareTransfers([
			...transactions,
			...responseFrom.transfers,
			...responseTo.transfers,
		]);
		filteredTxs = transactions;
		loading = false;
		maxHeight = getHeightOfLeftColumn();
	}

	onMount(async () => {
		if (!address) return;
		await getTransfers(true);
	});

	let value: string;
	const handleChange = (e: CustomEvent) => {
		filteredTxs = transactions.filter((transaction) =>
			e.detail.value === 'all' ? true : transaction.category === e.detail.value,
		);
	};

	function combineToCSV(el: Combined) {
		return `${el.blockNum},${el.category},${el.metadata?.blockTimestamp},${el.type},${el.from},${
			el.to
		},${el.value || 0},${el.asset || 'Unknown'}`;
	}

	const handleDownloadClick = () => {
		let list = 'Block number,Transfer type,Date,Type,From,To,Value,Symbol\n';
		list += filteredTxs.map(combineToCSV).join('\n');
		const csvContent = `data:text/csv;charset=utf-8,${list}`;
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `txlist-${address}-${value}.csv`);
		document.body.appendChild(link);
		link.click();
	};

	$: maxHeight = getHeightOfLeftColumn();
</script>

<header>
	<h1>Transactions</h1>
	<div class="header-right">
		<div class="downloadtx" on:click={handleDownloadClick} on:keydown>
			<Icon name="download" />
		</div>
		<div class="dropdown">
			<Dropdown {options} bind:value on:select={handleChange} />
		</div>
	</div>
</header>
{#if !filteredTxs.length && loading}
	<Skeleton style="margin-top: 10px" height={`${maxHeight}px`} />
{:else if filteredTxs.length}
	<ScrollBox
		bind:ref={scrollTarget}
		hasMore={Boolean(pageKey.from || pageKey.to)}
		{loading}
		loadMore={() => getTransfers()}
		styles={{ paddingTop: '1rem' }}
		maxHeight={`${maxHeight}px` || '100%'}
		threshold={300}
	>
		{#each filteredTxs as transaction}
			<div class="transaction">
				<InfoSpaceBetween>
					<span slot="left" class="label">
						{transaction.type}
					</span>
					<span slot="right" class="label">
						{dateToDateInput(transaction.date)}
					</span>
				</InfoSpaceBetween>
				<InfoSpaceBetween>
					<span slot="left" class="value">
						{#if transaction.token}
							<Img
								src={transaction.token.logoURI}
								alt={transaction.token.symbol}
								styles={{ width: '15px', height: '15px', borderRadius: '50%' }}
								placeholder="https://via.placeholder.com/15?text=..."
							/>
						{/if}
						{#if transaction.value}
							{formattedNum(transaction.value, { precision: 4 })}
						{/if}
						{transaction.asset || 'Unknown'}
					</span>
					<span slot="right" class="label">
						{transaction.addressText}
						<EtherscanLink value={transaction.address} type="address" truncated />
					</span>
				</InfoSpaceBetween>
			</div>
		{/each}
	</ScrollBox>
{:else}
	<p class="no-transactions">No transactions to show.</p>
{/if}

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 2px solid var(--stroke-tertiary);
		margin-top: 1rem;
		padding-bottom: 0.75rem;
	}
	.header-right {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.downloadtx {
		color: var(--text-action-primary);
		cursor: pointer;
	}
	.dropdown {
		min-width: 265px;
		font-size: 12px;
	}

	h1 {
		color: var(--text-header);
	}

	.transaction {
		border-bottom: 1px solid var(--stroke-tertiary);
		padding: 8px 0;
	}

	.label {
		color: var(--text-tertiary);
		font-size: 9px;
		display: flex;
		gap: 0.5rem;
	}

	.no-transactions {
		margin-top: 10px;
	}

	.value {
		color: var(--text-secondary);
		font-size: 12px;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		justify-items: center;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
