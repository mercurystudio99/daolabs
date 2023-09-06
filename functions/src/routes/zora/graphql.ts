/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, validate } from 'class-validator';
import { fetch } from 'undici';

import {
	GetTokens,
	GetToken,
	GetOwnerListByAggregateStat,
	GetOwnersCountByAggregateStat,
} from './queries';
import type { Response, Request } from 'express';

type QueryMethods = 'ownersCountAggregateStat' | 'ownersListByAggregateStat' | 'tokens' | 'token';

class ZoraGraphqlRequest {
	constructor(body: ZoraGraphqlRequest) {
		this.ownerAddresses = body.ownerAddresses || [];
		this.sortKey = body.sortKey || 'MINTED';
		this.sortDirection = body.sortDirection || 'ASC';
		this.after = body.after;
		this.limit = body.limit || 100;
		this.queryMethod = body.queryMethod;
		this.tokenAddresses = body.tokenAddresses || [];
		this.tokenAddress = body.tokenAddress;
		this.tokenId = body.tokenId || '';
		this.chain = body.chain || 'MAINNET';
	}

	@IsIn(['ownersCountAggregateStat', 'ownersListByAggregateStat', 'tokens', 'token'])
	@IsString()
	@IsNotEmpty()
	queryMethod: QueryMethods;

	@IsOptional()
	ownerAddresses?: string[];

	@IsIn(['MINTED'])
	@IsString()
	@IsOptional()
	sortKey: 'MINTED';

	@IsIn(['ASC', 'DESC'])
	@IsString()
	@IsOptional()
	sortDirection: 'ASC' | 'DESC';

	@IsOptional()
	@IsString()
	after?: string;

	@IsNumber()
	@IsOptional()
	limit: number;

	@IsOptional()
	tokenId?: number | string;

	@IsOptional()
	tokenAddresses?: string[];

	@IsOptional()
	@IsString()
	tokenAddress?: string;

	@IsOptional()
	@IsIn(['MAINNET', 'GOERLI'])
	@IsString()
	chain?: 'MAINNET' | 'GOERLI';

	getVariables(fields: string[]) {
		const variables = {};
		for (const field of fields) {
			variables[field] = this[field];
		}
		return variables;
	}
}

function getQuery(body: ZoraGraphqlRequest) {
	switch (body.queryMethod) {
		case 'ownersCountAggregateStat':
			return {
				query: GetOwnersCountByAggregateStat,
				variables: body.getVariables(['tokenAddress', 'chain']),
			};
		case 'ownersListByAggregateStat':
			return {
				query: GetOwnerListByAggregateStat,
				variables: body.getVariables(['tokenAddress', 'chain', 'limit', 'after']),
			};
		case 'tokens':
			return {
				query: GetTokens,
				variables: body.getVariables([
					'ownerAddresses',
					'tokenAddresses',
					'sortKey',
					'sortDirection',
					'after',
					'limit',
					'chain',
				]),
			};
		case 'token':
			return {
				query: GetToken,
				variables: body.getVariables(['tokenAddress', 'tokenId', 'chain']),
			};
	}
}

export async function zoraGraphql(request: Request, response: Response) {
	if (typeof request.body === 'string') {
		request.body = JSON.parse(request.body) as ZoraGraphqlRequest;
	}
	const body: ZoraGraphqlRequest = new ZoraGraphqlRequest(request.body as ZoraGraphqlRequest);
	const errors = await validate(body, { whitelist: true });
	if (errors.length > 0) {
		response.statusCode = 400;
		response.json({
			message: 'Validation failed',
			errors: errors.map((e) => ({
				[e.property]: e.constraints,
			})),
		});
		return;
	}

	const query = getQuery(body);

	fetch(`https://api.zora.co/graphql`, {
		method: 'POST',
		body: JSON.stringify(query),
		headers: {
			'Content-Type': 'application/json',
		},
		redirect: 'follow',
	})
		.then((res) => {
			res
				.json()
				.then((q) => {
					response.set('Cache-control', `public, max-age=${60 * 5}`);
					response.json(q);
				})
				.catch(console.error);
		})
		.catch(console.error);
}
