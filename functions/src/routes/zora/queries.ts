export const GetTokens = `
	query GetTokens(
		$ownerAddresses: [String!]
		$tokenAddresses: [String!]
		$sortKey: TokenSortKey!
		$sortDirection: SortDirection!
		$after: String
		$limit: Int!
		$chain: Chain!
	) {
		tokens(
			where: { ownerAddresses: $ownerAddresses, collectionAddresses: $tokenAddresses }
			sort: { sortKey: $sortKey, sortDirection: $sortDirection }
			pagination: { after: $after, limit: $limit }
			networks: [{ network: ETHEREUM, chain: $chain }]
		) {
			nodes {
				token {
					tokenId
					collectionAddress
					collectionName
					name
					image {
						url
					}
					tokenContract {
						name
						collectionAddress
					}
					attributes {
						traitType
						value
					}
				}
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;

export const GetToken = `
	query GetToken($tokenAddress: String!, $tokenId: String!, $chain: Chain!) {
		token(
			token: { address: $tokenAddress, tokenId: $tokenId }
			network: { network: ETHEREUM, chain: $chain }
		) {
			sales {
				transactionInfo {
					transactionHash
					blockTimestamp
				}
				price {
					nativePrice {
						currency {
							name
						}
					}
					chainTokenPrice {
						decimal
					}
				}
			}
			events {
				transactionInfo {
					transactionHash
					blockTimestamp
				}
				eventType
				properties {
					... on TransferEvent {
						fromAddress
						toAddress
					}
					... on Sale {
						price {
							chainTokenPrice {
								decimal
							}
							nativePrice {
								currency {
									name
								}
							}
						}
					}
					... on MintEvent {
						collectionAddress
						price {
							chainTokenPrice {
								decimal
							}
							nativePrice {
								currency {
									name
								}
							}
						}
					}
				}
			}
			token {
				name
				description
				tokenId
				collectionAddress
				tokenUrl
				tokenStandard
				owner
				content {
					url
					mimeType
				}
				image {
					url
				}
				attributes {
					traitType
					value
					displayType
				}
			}
		}
	}
`;

export const GetOwnersCountByAggregateStat = `
	query GetAggregateStat($tokenAddress: [String!], $chain: Chain!) {
		aggregateStat {
			ownerCount(
				networks: [{ network: ETHEREUM, chain: $chain }]
 				where: { collectionAddresses: $tokenAddress }
			)
    }
	}
`;

export const GetOwnerListByAggregateStat = `
	query GetAggregateStat($tokenAddress: [String!], $chain: Chain!, $limit: Int!, $after: String) {
		aggregateStat {
			ownersByCount(
				networks: [{ network: ETHEREUM, chain: $chain }]
				where: { collectionAddresses: $tokenAddress }
				pagination: {limit: $limit, after: $after}
			) {
				nodes {
					owner
					count
				}
				pageInfo {
					hasNextPage
					endCursor
				}
		 	}
    }
	}
`;
