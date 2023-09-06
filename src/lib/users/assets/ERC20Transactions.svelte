<script lang="ts">
	import { onMount } from 'svelte';
	import {
		AssetTransfersCategory,
		type AssetTransfersResponse,
		type AssetTransfersResult,
	} from 'alchemy-sdk';
	import { constants } from 'ethers';
	import { alchemy } from '$stores/alchemy';
	import { connectedAccount } from '$stores/web3';
	import tokensByAddress from '$constants/tokensByAddress.json';
	import Address from '$lib/components/Address.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { formattedNum } from '$utils/formatNumber';

	interface Extension {
		token: any;
		type: string;
		address: string;
	}

	type Combined = AssetTransfersResult & Extension;

	let loading = false;
	let transactions: Combined[] = [];

	const category = [
		AssetTransfersCategory.EXTERNAL,
		// AssetTransfersCategory.INTERNAL,
		AssetTransfersCategory.ERC20,
		AssetTransfersCategory.ERC721,
		AssetTransfersCategory.ERC1155,
	];

	/**
     * TEMP: a transaction result looks like this
     * {
            "blockNum": "0xead027",
            "uniqueId": "0xd6317e1824ce214a2a0e35df9b8dc5364a9ee08ccb62bb4320d40fe00678f0bc:external",
            "hash": "0xd6317e1824ce214a2a0e35df9b8dc5364a9ee08ccb62bb4320d40fe00678f0bc",
            "from": "0x57a16a385e86cd215def121e6887d23be8080d37",
            "to": "0x4ddef8fc8eee89848b4a802cef9fc9e72b8674a4",
            "value": 0.001,
            "erc721TokenId": null,
            "erc1155Metadata": null,
            "tokenId": null,
            "asset": "ETH",
            "category": "external",
            "rawContract": {
                "value": "0x38d7ea4c68000",
                "address": null,
                "decimal": "0x12"
            }
        }
    */

	async function getTransfers() {
		loading = true;
		const responseFrom: AssetTransfersResponse = await $alchemy.core.getAssetTransfers({
			fromBlock: '0x0',
			fromAddress: $connectedAccount,
			category,
		});
		const responseTo: AssetTransfersResponse = await $alchemy.core.getAssetTransfers({
			fromBlock: '0x0',
			toAddress: $connectedAccount,
			category,
		});

		transactions = [...responseFrom.transfers, ...responseTo.transfers]
			.map((transaction) => {
				let type = transaction.from === $connectedAccount ? 'Sent' : 'Received';
				const address = transaction.from === $connectedAccount ? transaction.to : transaction.from;
				const token = tokensByAddress[transaction.rawContract.address];
				if (
					transaction.from === constants.AddressZero &&
					['erc721', 'erc1155'].includes(transaction.category)
				) {
					type = 'Minted';
				}

				return {
					...transaction,
					address,
					token,
					type,
				};
			})
			.sort((a, b) => parseInt(b.blockNum) - parseInt(a.blockNum));
		console.log(transactions);
		loading = false;
	}

	onMount(async () => {
		if (!connectedAccount) return;
		await getTransfers();
	});
</script>

<h1>Transaction</h1>
{#if loading}
	<Skeleton />
{/if}
{#if transactions.length}
	{#each transactions as transaction}
		<div class="transaction">
			<InfoSpaceBetween>
				<span slot="left" class="label">
					{transaction.type}
				</span>
				<span slot="right" class="label">
					Block {transaction.blockNum}
				</span>
			</InfoSpaceBetween>
			<InfoSpaceBetween>
				<span slot="left" class="value">
					{#if transaction.token}
						<img src={transaction.token.logoURI} alt={transaction.token.symbol} />
					{/if}
					{#if transaction.value}
						{formattedNum(transaction.value, { precision: 4 })}
					{/if}
					{transaction.asset || 'Unknown'}
				</span>
				<span slot="right" class="label">
					{#if transaction.from === $connectedAccount}
						to
					{:else}
						from
					{/if}
					<Address>
						{transaction.address}
					</Address>
				</span>
			</InfoSpaceBetween>
		</div>
	{/each}
{:else}
	<p>No transactions to show.</p>
{/if}

<style>
	h1 {
		border-bottom: 2px solid var(--stroke-tertiary);
		color: var(--text-header);
		margin-top: 2rem;
		line-height: 1;
		padding-bottom: 0.75rem;
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

	.value {
		color: var(--text-secondary);
		font-size: 12px;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		justify-items: center;
	}

	.value img {
		width: 15px;
		height: 15px;
		border-radius: 50%;
	}
</style>
