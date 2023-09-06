<script lang="ts">
	import { utils, BigNumber } from 'ethers';
	import { getContext, onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import ETH from '$lib/components/Ethereum.svelte';
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import { formatWad } from '$utils/formatNumber';
	import { getCurrencyConverter, getWeiConverter } from '$data/currency';
	import { tokenSymbolText } from '$utils/tokenSymbolText';
	import { V2_CURRENCY_ETH, V2_CURRENCY_USD } from '$utils/v2/currency';
	import { useUniswapPriceQuery } from '$utils/ERC20UniswapPrice';
	import { useSushiswapPriceQuery } from '$utils/ERC20SushiswapPrice';
	import { weightedAmount } from '$utils/v2/math';
	import TokenAmmPriceRow from './TokenAMMPriceRow.svelte';
	import LongWord, { truncateLongWord } from './LongWord.svelte';
	import type { WeightFunction } from '$utils/math';
	import type { Price as UniPrice, Token as UniToken } from '@uniswap/sdk-core';
	import type { Token as SushiToken, Price as SushiPrice } from '@sushiswap/sdk';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	export let disabled = false;
	export let onClick: (weiAmount: BigNumber) => void;
	export let payButton: string = 'Pay';
	// TODO: double check the default values
	export let reservedRate: number = 0;
	export let token: string = 'tokens';
	export let weight: BigNumber = BigNumber.from('0xd3c21bcecceda1000000');
	export let weightingFn: WeightFunction = weightedAmount;
	export let amount: number = 0;
	export let disabledCurrency = false;

	let currency = BigNumber.from(V2_CURRENCY_ETH);
	let receiveText = 'Receive 0 tokens/1 ETH';
	let formattedETHAmount: string;
	let converter: {
		usdToWei: (value: string) => BigNumber;
	};

	const projectContext = getContext<Store<V2ProjectContextType>>('PROJECT');

	function onPay() {
		let weiAmount: BigNumber;
		if (currency.eq(V2_CURRENCY_ETH)) {
			weiAmount = utils.parseEther(amount.toString());
		} else {
			weiAmount = utils.parseEther(formattedETHAmount);
		}
		onClick(weiAmount);
	}

	async function getReceiveText(payInCurrency: BigNumber) {
		const formatReceivedTickets = (wei: BigNumber) => {
			const exchangeRate = weightingFn(weight, reservedRate, wei, 'payer');
			return formatWad(exchangeRate, { precision: 0 });
		};

		const weiPayAmt = await getWeiConverter({
			currency: payInCurrency?.toNumber() as any,
			amount: `${amount || 0}`,
		});

		const isZero = weiPayAmt.eq(0);

		if (isZero) {
			return '';
		}

		if (!isZero) {
			const receivedTickets = formatReceivedTickets(weiPayAmt);
			const tokenReceiveText = tokenSymbolText({
				tokenSymbol: token,
				capitalize: false,
				plural: receivedTickets !== '1',
			});

			return `Receive ${receivedTickets} ${String(truncateLongWord(tokenReceiveText))}`;
		}

		const receivedTickets = formatReceivedTickets(
			(payInCurrency.eq(V2_CURRENCY_ETH) ? utils.parseEther('1') : converter.usdToWei('1')) ??
				BigNumber.from(0),
		);

		const tokenReceiveText = tokenSymbolText({
			tokenSymbol: token,
			capitalize: false,
			plural: receivedTickets !== '1',
		});

		return `Receive ${receivedTickets} ${String(truncateLongWord(tokenReceiveText))}/1 ${
			payInCurrency.eq(V2_CURRENCY_ETH) ? 'ETH' : 'USD'
		}`;
	}

	let uniswapPriceData: {
		tokenSymbol: string;
		projectTokenPrice: UniPrice<UniToken, UniToken>;
		WETHPrice: UniPrice<UniToken, UniToken>;
		liquidity: string;
	};
	let sushiswapPriceData: {
		tokenSymbol: string;
		midPrice: SushiPrice<SushiToken, SushiToken>;
	};

	let loadingAMMPrice = false;

	onMount(async () => {
		if (payButton === '') {
			payButton = 'Pay';
		}
		converter = await getCurrencyConverter();

		if ($projectContext.tokenSymbol) {
			loadingAMMPrice = true;

			try {
				uniswapPriceData = await useUniswapPriceQuery({
					tokenSymbol: $projectContext.tokenSymbol,
					tokenAddress: $projectContext.tokenAddress,
				});
			} catch (error) {
				if (error instanceof Error) {
					console.log(`Error on use uniswap price query ${error.message}`);
				} else {
					console.log(error);
				}
			}

			try {
				sushiswapPriceData = await useSushiswapPriceQuery({
					tokenSymbol: $projectContext.tokenSymbol,
					tokenAddress: $projectContext.tokenAddress,
				});
			} catch (error) {
				if (error instanceof Error) {
					console.log(`Error on use sushiswap price query ${error.message}`);
				} else {
					console.log(error);
				}
			}
			loadingAMMPrice = false;
		}
	});

	$: if (converter) {
		getReceiveText(currency)
			.then((text) => {
				receiveText = text;
			})
			.catch((e) => console.log(e));
		const ETHAmount = converter?.usdToWei(amount?.toString());
		formattedETHAmount = formatWad(ETHAmount, {
			precision: 9,
		});
	}
</script>

<div class="wrapper">
	<div class="stacked expand">
		<CurrencyInput
			bind:currency
			bind:inputValue={amount}
			{disabled}
			{disabledCurrency}
			min={0}
			step={0.0001}
		/>
		<small>{receiveText}</small>
		{#if $projectContext.tokenSymbol}
			<div>
				<small>
					or <a href={null} on:click|self|preventDefault class="link hover-show-amms">
						buy <LongWord>{$projectContext.tokenSymbol}</LongWord> on exchange
						<div class="other-exchanges">
							{#if loadingAMMPrice}
								loading...
							{:else if $projectContext.tokenSymbol}
								<span class="modal-title">Current 3rd Party Exchange Rates</span>
								<div class="exhanges">
									<TokenAmmPriceRow
										exchangeName="Uniswap"
										tokenSymbol={$projectContext.tokenSymbol}
										exchangeLink={`https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=${String(
											$projectContext.tokenAddress,
										)}`}
										WETHPrice={uniswapPriceData?.WETHPrice.toFixed(0)}
									/>
									<TokenAmmPriceRow
										exchangeName="Sushiswap"
										tokenSymbol={$projectContext.tokenSymbol}
										exchangeLink={`https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=${String(
											$projectContext.tokenAddress,
										)}`}
										WETHPrice={sushiswapPriceData?.midPrice.toFixed(0)}
									/>
								</div>
							{/if}
						</div>
					</a>
				</small>
			</div>
		{/if}
	</div>
	<div class="stacked">
		<!-- TODO need input from pay button, pass in onClick -->
		<Button {disabled} size="md" on:click={onPay}>{payButton || 'Pay'}</Button>
		{#if currency.eq(V2_CURRENCY_USD)}
			<small>Paid as <ETH />{formattedETHAmount}</small>
		{/if}
	</div>
</div>

<style>
	.hover-show-amms {
		position: relative;
		padding-bottom: 1rem;
	}
	.other-exchanges {
		display: none;
	}
	.hover-show-amms:hover .other-exchanges,
	.other-exchanges:hover {
		display: flex;
		flex-direction: column;
		position: absolute;
		z-index: 10;
		top: 24px;
		background: var(--background-l0);
		color: var(--text-primary);
		padding: 0.6rem;
		font-size: 0.7rem;
		font-weight: 300;
		width: 260px;
		border: 1px solid var(--stroke-tertiary);
	}
	.modal-title {
		margin-bottom: 11px;
	}
	.wrapper {
		margin-top: 40px;
		display: flex;
	}

	.expand {
		flex: 1;
		margin-right: 10px;
	}

	.stacked {
		display: flex;
		flex-direction: column;
	}

	.stacked:last-of-type {
		text-align: center;
	}
</style>
