import * as functions from 'firebase-functions';
import { fetch } from 'undici';
import { Request, Response } from 'express';
import Moralis from 'moralis';

import { EvmChain } from 'moralis/common-evm-utils';
import tokenService from '../../services/token.service';
import userService from '../../services/user.service';

interface IUniswapToken {
	id: string;
	name: string;
	whitelistPools: {
		token0Price: string;
		token1: {
			symbol: string;
		};
	}[];
}

async function getUniswapPrice(idIn: string[]) {
	const gql = JSON.stringify({
		query: `query GetTokens {tokens(where: {id_in: ${JSON.stringify(
			idIn,
		)}}) {id name whitelistPools {token0Price token1Price token1 {symbol}}}}`,
		variables: {},
	});
	const response = await fetch(`https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3`, {
		method: 'POST',
		body: gql,
		headers: {
			'Content-Type': 'application/json',
		},
		redirect: 'follow',
	});

	const json: { data: { tokens: IUniswapToken[] } } = (await response.json()) as {
		data: { tokens: IUniswapToken[] };
	};
	return json.data.tokens.map((t) => {
		return {
			...t,
			whitelistPools: t.whitelistPools.filter((w) => w.token1.symbol === 'WETH'),
		};
	});
}

export async function getShushiSwapBalance(tonken0Ids: string[], token1: string) {
	const gql = JSON.stringify({
		query: `query MyQuery {pairs(where: {token0_in: ${JSON.stringify(
			tonken0Ids,
		)}, token1_contains_nocase: "${String(token1)}"}) { token0Price token0 { id } }}`,
		variables: {},
	});
	const res = await fetch('https://api.thegraph.com/subgraphs/name/sushiswap/exchange', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: gql,
		redirect: 'follow',
	});

	const json = (await res.json()) as {
		data: { pairs: { token0Price: string; token0: { id: string } }[] };
	};
	if (json.data.pairs.length === 0) {
		return {};
	}
	return json.data.pairs.reduce((a, v) => ({ ...a, [v.token0.id]: v.token0Price }), {});
}

export async function getWalletTokenBalances(request: Request, response: Response) {
	const { address } = request.params || {};
	const chain = (request.query.chain as string) || '0x1';

	const { updateTime, data } = await userService.getTokens(address);

	const now = new Date().getTime();
	const dayInMs = 864000;

	if (now - updateTime < dayInMs && data) {
		response.json(data);
		return;
	}

	const moralisResponse = (
		await Moralis.EvmApi.token.getWalletTokenBalances({
			address,
			chain,
		})
	).toJSON();

	const tokenIds = moralisResponse.map((res) => res.token_address);

	const uniPrice = await getUniswapPrice(tokenIds);
	const shushiPrice = await getShushiSwapBalance(
		tokenIds.map((t) => t.toLowerCase()),
		'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	);

	functions.logger.info('moralisResponse', moralisResponse);

	const modifyTokens = moralisResponse.map((token) => {
		const uPrice = uniPrice.find((p) => p.id === token.token_address && p.name !== 'Wrapped Ether');
		if (!token.logo) {
			const CoinGeckoToken = tokenService.getTokenBySymbol(token.symbol);
			if (CoinGeckoToken) {
				token.logo = CoinGeckoToken.logoURI;
			}
		}
		return {
			...token,
			tokenBalance: token.balance,
			uniswapPrice:
				uPrice && uPrice.whitelistPools.length > 0
					? Number(uPrice.whitelistPools[0].token0Price).toFixed(2)
					: 0,
			shushiswapPrice: shushiPrice[token.token_address.toLowerCase()]
				? Number(shushiPrice[token.token_address.toLowerCase()]).toFixed(2)
				: 0,
		};
	});
	userService.saveTokens(address, modifyTokens).catch(console.error);
	response.json(modifyTokens);
}

export async function getWalletTokenTransfers(request: Request, response: Response) {
	const { address } = request.params || {};
	const chain = (request.query.chain as string) || EvmChain.ETHEREUM;
	const cursor = (request.query.cursor as string) || undefined;
	const limit = Number(request.query.limit || 20);

	try {
		const moralisResponse = await Moralis.EvmApi.token.getWalletTokenTransfers({
			address,
			limit,
			chain,
			cursor,
		});

		if (moralisResponse) {
			response.json(moralisResponse);
			return;
		}
	} catch (e) {
		response.status(500).json({
			message: 'Fetching the token transfers has encountered an error',
			error: e as unknown,
		});
	}
}
