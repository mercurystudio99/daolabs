<script lang="ts">
	import { onMount } from 'svelte';
	import { utils } from 'ethers';
	import tokensByAddress from '$constants/tokensByAddress.json';
	import { formattedNum } from '$utils/formatNumber';
	import Address from '$lib/components/Address.svelte';
	import Icon from '$lib/components/Icon';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import ScrollBox from '$lib/components/ScrollBox.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import TokenAmmPriceCompact from '$lib/components/TokenAMMPriceCompact.svelte';
	import { getEthBalance } from '$data/eth';
	import WalletHeader from './WalletHeader.svelte';
	import type { GeckoTokenMetadata, TokenPrice } from './types';
	import type { Balance } from '$services/users/getWalletTokens';

	export let address: string;
	export let totalNftValue: number;
	export let balances: Balance[] = [];

	let dataBalances: Balance[] = [];

	let loading = false;
	// eslint-disable-next-line no-undef
	const prices: Record<string, TokenPrice | false> = {};
	let totalEthBalance: number;
	const typicalAssets: Array<{ name: string; balance: number }> = [];
	let assetsLoading = false;

	onMount(async () => {
		if (!address) {
			totalEthBalance = 0;
			return;
		}

		loading = true;
		assetsLoading = true;
		const ethBalance = await getEthBalance(address);
		const ethItem: Balance = {
			contractAddress: '0x0000000000000000000000000000000000000000',
			symbol: 'ETH',
			name: 'Ethereum',
			sketchy: false,
			decimals: 18,
			tokenBalance: (ethBalance as unknown as number) / Math.pow(10, 18),
			balance: ethBalance,
		};

		const metadata: Balance[] = balances.map((balance) => {
			let sketchy = false;
			let logo = balance.logo;
			if (!balance.thumbnail && !balance.logo) {
				const tokenData = tokensByAddress[balance.contractAddress.toString()] as GeckoTokenMetadata;
				if (tokenData) {
					logo = tokenData.logoURI;
				} else {
					sketchy = true;
				}
			}
			return {
				...balance,
				tokenBalance: Number(utils.formatUnits(balance.balance, balance.decimals)),
				logo,
				sketchy,
			};
		});

		dataBalances = [ethItem, ...metadata]
			.filter((token) => Number(token.tokenBalance) > 0)
			.sort((a, b) => {
				// sort tokens without tokendata at the end
				if (a.sketchy) return 1;
				if (b.sketchy) return -1;
				return Number(b.tokenBalance) - Number(a.tokenBalance);
			});
		loading = false;
		totalEthBalance = 0;
		// Get AMM prices
		for (const token of dataBalances) {
			if (['ETH', 'WETH'].includes(token.symbol)) {
				prices[token.contractAddress] = {
					ethBalance: token.tokenBalance,
				};
				totalEthBalance += Number(token.tokenBalance);
			} else if (token.symbol) {
				const uniPrice = token.uniswapPrice;
				const sushiPrice = token.shushiswapPrice;
				let ethBalanceForToken = 0;
				if (Number(uniPrice) && Number(sushiPrice)) {
					ethBalanceForToken = token.tokenBalance / Math.max(Number(uniPrice), Number(sushiPrice));
				} else if (Number(uniPrice)) {
					ethBalanceForToken = token.tokenBalance / Number(uniPrice);
				} else if (Number(sushiPrice)) {
					ethBalanceForToken = token.tokenBalance / Number(sushiPrice);
				}

				totalEthBalance += Number(ethBalanceForToken || 0);
				prices[token.contractAddress] = {
					ethBalance: Math.abs(ethBalanceForToken),
					uni: Math.abs(+uniPrice).toString(),
					sushi: Math.abs(+sushiPrice).toString(),
				};
			} else {
				prices[token.contractAddress] = false;
			}
		}

		dataBalances = dataBalances.sort((a, b) => {
			let aEth = 0;
			let bEth = 0;
			if (prices[a.contractAddress]) {
				aEth = (prices[a.contractAddress] as TokenPrice).ethBalance;
			}
			if (prices[b.contractAddress]) {
				bEth = (prices[b.contractAddress] as TokenPrice).ethBalance;
			}
			if (!aEth) return 1;
			if (!bEth) return -1;
			return Number(bEth) - Number(aEth);
		});
		typicalAssets.push({
			name: 'Wallet',
			balance: Math.abs(Number(utils.formatEther(ethBalance))),
		});
		dataBalances.slice(0, 5).map((el) => {
			typicalAssets.push({
				name: el.name,
				balance: Math.abs((prices[el.contractAddress] as TokenPrice).ethBalance),
			});
		});
		assetsLoading = false;
	});
</script>

<WalletHeader
	{totalEthBalance}
	{totalNftValue}
	{loading}
	{address}
	{typicalAssets}
	{assetsLoading}
/>
{#if loading}
	<Skeleton style="margin-top: 10px" height="985px" />
{:else if dataBalances.length}
	<ScrollBox styles={{ paddingTop: '1rem' }}>
		{#each dataBalances as item}
			{@const price = prices[item.contractAddress]}
			<div class="token">
				{#if !item.symbol}
					<div class="token-icon" style="margin-left: 5px">
						<Icon name="questionCircle" />
					</div>
					<div class="token-info">
						<InfoSpaceBetween>
							<div class="token-name" slot="left">
								<Address>
									{item.contractAddress}
								</Address>
							</div>
							<div class="token-balance" slot="right">
								{formattedNum(item.tokenBalance, { precision: 4 })}
							</div>
						</InfoSpaceBetween>
						<span>Unknown token, assumed 18 decimals.</span>
					</div>
				{:else}
					<div
						class="token-icon"
						style={!item.thumbnail && !item.logo && item.symbol !== 'ETH' && 'margin-left: 5px'}
					>
						{#if item.symbol === 'ETH'}
							<Icon name="ethereum" style="width: 25px; height: 25px" />
						{:else if item.logo || item.thumbnail}
							<img src={item.logo || item.thumbnail} class="asset-logo" alt={item.symbol} />
						{:else}
							<Icon name="questionCircle" />
						{/if}
					</div>
					<div class="token-info">
						<InfoSpaceBetween>
							<div class="token-info" slot="left">
								<p>{item.name}</p>
							</div>
							<div class="token-balance" slot="right">
								{#if item.symbol !== 'ETH'}
									<p>{`${formattedNum(item.tokenBalance, { precision: 4 })} ${item.symbol}`}</p>
								{/if}
							</div>
						</InfoSpaceBetween>
						{#if item.symbol}
							{#if item.symbol && !prices[item.contractAddress]}
								<Skeleton height="15px" />
							{:else}
								<InfoSpaceBetween>
									<div class="token-price" slot="left">
										{#if price && price.uni}
											<TokenAmmPriceCompact
												exchangeName="Uniswap"
												showExchangeName={false}
												tokenSymbol={item.symbol}
												exchangeLink={item.contractAddress}
												WETHPrice={price.uni}
											/>
										{/if}
										{#if price && price.sushi}
											<TokenAmmPriceCompact
												exchangeName="Sushiswap"
												showExchangeName={false}
												tokenSymbol={item.symbol}
												exchangeLink={item.contractAddress}
												WETHPrice={price.sushi}
											/>
										{/if}
										{#if price && (price.sushi || price.uni)}
											<small>/ ETH</small>
										{/if}
									</div>
									<div class="token-eth-balance" slot="right">
										{#if ['WETH', 'ETH'].includes(item.symbol)}
											<p>{formattedNum(item.tokenBalance, { precision: 2 })} ETH</p>
										{:else}
											<p>{`${formattedNum(price ? price.ethBalance : 0, { precision: 2 })} ETH`}</p>
										{/if}
									</div>
								</InfoSpaceBetween>
							{/if}
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</ScrollBox>
{:else}
	<div class="no-tokens">
		<p>No tokens found.</p>
	</div>
{/if}

<style>
	p {
		line-height: 1;
	}

	.asset-logo {
		width: 25px;
		height: 25px;
	}

	.no-tokens {
		margin-top: 10px;
	}
	.token {
		display: flex;
		line-height: 1;
		padding: 8px 0;
		border-bottom: 1px solid var(--stroke-tertiary);
	}
	.token:first-of-type {
		margin-top: 10px;
	}

	.token-icon {
		margin-right: 1rem;
	}

	.token-icon,
	.token-eth-balance {
		display: flex;
		align-items: center;
	}

	.token-eth-balance {
		text-align: right;
	}

	.token-info {
		color: var(--text-secondary);
		font-size: 14px;
		width: 100%;
	}

	.token-info span {
		font-size: 8px;
		color: var(--text-tertiary);
	}

	.token-info p {
		line-height: 1;
		margin: 0;
	}

	.token-balance {
		min-width: 170px;
		text-align: right;
		font-size: 12px;
		color: var(--text-tertiary);
	}

	.token-price {
		display: flex;
		gap: 1em;
		font-size: 12px;
		align-items: center;
	}

	.token-price small {
		color: var(--text-tertiary);
	}
</style>
