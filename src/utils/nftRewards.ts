import { BigNumber, constants, ethers } from 'ethers';
import { defaultAbiCoder, parseEther } from 'ethers/lib/utils';
import { WAD_DECIMALS } from '$constants/numbers';
import { encodeIPFSUri, ipfsUrl } from './ipfs';
import { ONE_BILLION } from './math';
import { V2_CURRENCY_ETH } from './v2/currency';
import {
	JB721GovernanceType,
	type JB721PricingParams,
	type JB721TierParams,
	type JBDeployTiered721DelegateData,
} from './web3/types';
import type { V2FundingCycleMetadata } from '$models/v2/fundingCycle';
import type { NftRewardTier } from '$models/nftRewardTier';

export const MAX_NFT_REWARD_TIERS = 69;
const IJB721DELEGATE_INTERFACE_ID = '0xb3bcbb79';
export const DEFAULT_NFT_MAX_SUPPLY = ONE_BILLION - 1;

// Returns the highest NFT reward tier that a payer is eligible given their pay amount
export function getNftRewardTier({
	payAmountETH,
	nftRewardTiers,
}: {
	payAmountETH: number;
	nftRewardTiers: NftRewardTier[];
}) {
	let nftReward: NftRewardTier | null = null;
	// all nft's who's thresholds are below the pay amount
	const eligibleNftRewards = nftRewardTiers.filter((rewardTier) => {
		return rewardTier.contributionFloor <= payAmountETH;
	});
	if (eligibleNftRewards.length) {
		// take the maximum which is the only one received by payer
		nftReward = eligibleNftRewards.reduce((prev, curr) => {
			return prev.contributionFloor > curr.contributionFloor ? prev : curr;
		});
	}
	return nftReward;
}

// // returns an array of CIDs from a given array of RewardTier obj's
// export function CIDsOfNftRewardTiersResponse(
// 	nftRewardTiersResponse: JB721TierParams[] | undefined,
// ): string[] {
// 	const cids =
// 		nftRewardTiersResponse
// 			?.map((contractRewardTier: JB721TierParams) => {
// 				return decodeEncodedIPFSUri(contractRewardTier.encodedIPFSUri);
// 			})
// 			.filter((cid) => cid.length > 0) ?? [];

// 	return cids;
// }

// Default name for NFT collections on NFT marketplaces
export const defaultNftCollectionName = (projectName: string | undefined) =>
	`${projectName?.length ? projectName : "Your Treasury's"} Membership`;

// Default description for NFT collections on NFT marketplaces
export const defaultNftCollectionDescription = (projectName: string | undefined) =>
	`Membership NFT for ${projectName ? projectName : 'your project'}'s contributors.`;

// async function uploadNftRewardToIPFS(rewardTier: NftRewardTier): Promise<string> {
// 	const ipfsNftRewardTier: IPFSNftRewardTier = {
// 		description: rewardTier.description,
// 		name: rewardTier.name,
// 		externalLink: rewardTier.externalLink,
// 		symbol: undefined,
// 		image: rewardTier.imageUrl,
// 		imageDataUrl: undefined,
// 		artifactUri: undefined,
// 		animationUri: undefined,
// 		displayUri: undefined,
// 		youtubeUri: undefined,
// 		backgroundColor: undefined,
// 		attributes: [
// 			{
// 				trait_type: 'Min. Contribution',
// 				value: rewardTier.contributionFloor,
// 			},
// 			{
// 				trait_type: 'Max. Supply',
// 				value: rewardTier.maxSupply,
// 			},
// 		],
// 	};

// 	const res = await axios.post<{ IpfsHash: string }>('/api/ipfs/pin', {
// 		data: ipfsNftRewardTier,
// 		options: {
// 			pinataMetadata: {
// 				keyvalues: {
// 					tag: IPFS_TAGS.NFT_REWARDS,
// 				},
// 				name: `nft-rewards_${ipfsNftRewardTier.name}`,
// 			},
// 		},
// 	});

// 	return res.data.IpfsHash;
// }

// Uploads each nft reward tier to an individual location on IPFS
// returns an array of CIDs which point to each rewardTier on IPFS
// export async function uploadNftRewardsToIPFS(nftRewards: NftRewardTier[]): Promise<string[]> {
// 	return Promise.all(nftRewards.map((rewardTier) => uploadNftRewardToIPFS(rewardTier)));
// }

// export async function uploadNftCollectionMetadataToIPFS({
// 	collectionName,
// 	collectionDescription,
// 	collectionLogoUri,
// 	collectionInfoUri,
// }: {
// 	collectionName: string;
// 	collectionDescription: string;
// 	collectionLogoUri: string | undefined;
// 	collectionInfoUri: string | undefined;
// }) {
// 	// TODO: add inputs for the rest of these fields
// 	const ipfsNftCollectionMetadata: IpfsNftCollectionMetadata = {
// 		name: collectionName,
// 		description: collectionDescription,
// 		image: collectionLogoUri?.length ? collectionLogoUri : movementEmojiImageUri,
// 		seller_fee_basis_points: undefined,
// 		external_link: collectionInfoUri?.length ? collectionInfoUri : 'https://juicebox.money',
// 		fee_recipient: undefined,
// 	};
// 	const res = await axios.post<{ IpfsHash: string }>('/api/ipfs/pin', {
// 		data: ipfsNftCollectionMetadata,
// 		options: {
// 			pinataMetadata: {
// 				keyvalues: {
// 					tag: IPFS_TAGS.NFT_REWARDS_COLLECTION_METADATA,
// 				},
// 				name: collectionName,
// 			},
// 		},
// 	});
// 	return res.data.IpfsHash;
// }

// Determines if two NFT reward tiers are equal
export function tiersEqual({ tier1, tier2 }: { tier1: NftRewardTier; tier2: NftRewardTier }) {
	return (
		tier1.contributionFloor === tier2.contributionFloor &&
		tier1.description === tier2.description &&
		tier1.externalLink === tier2.externalLink &&
		tier1.imageUrl === tier2.imageUrl &&
		tier1.maxSupply === tier2.maxSupply &&
		tier1.name === tier2.name
	);
}

// Builds JB721TierParams[] (see juice-721-delegate:structs/JB721TierParams.sol)
export function buildJB721TierParams({
	cids,
	rewardTiers,
}: {
	cids: string[];
	rewardTiers: NftRewardTier[];
}): JB721TierParams[] {
	// `cids` are ordered the same as `rewardTiers` so can get corresponding values from same index
	return cids
		.map((cid, index) => {
			const contributionFloorWei = parseEther(rewardTiers[index].contributionFloor.toString());
			const maxSupply = rewardTiers[index].maxSupply;
			const initialQuantity = BigNumber.from(maxSupply ?? DEFAULT_NFT_MAX_SUPPLY);
			const encodedIPFSUri = encodeIPFSUri(cid);

			return {
				contributionFloor: contributionFloorWei,
				lockedUntil: BigNumber.from(0),
				initialQuantity,
				votingUnits: 0,
				reservedRate: 0,
				reservedTokenBeneficiary: ethers.constants.AddressZero,
				encodedIPFSUri,
				allowManualMint: false,
				shouldUseBeneficiaryAsDefault: false,
				transfersPausable: false,
			} as JB721TierParams;
		})
		.sort((a, b) => {
			// Tiers MUST BE in ascending order when sent to contract.
			if (BigNumber.from(a.contributionFloor).gt(b.contributionFloor)) return 1;
			if (BigNumber.from(a.contributionFloor).lt(b.contributionFloor)) return -1;
			return 0;
		});
}

/**
 * Assume that any project with a data source has "NFT Rewards"
 * In other words, uses the JB721Delegate.
 *
 * @TODO this is a TERRIBLE assumption. If someone starts using a different datasource,
 * the UI will break badly. We should probably be validating that the datasource address adheres to a particular interface.ƒ
 */
export function hasNftRewards(fundingCycleMetadata: V2FundingCycleMetadata | undefined) {
	return Boolean(
		fundingCycleMetadata?.dataSource &&
			fundingCycleMetadata.dataSource !== ethers.constants.AddressZero &&
			fundingCycleMetadata?.useDataSourceForPay,
	);
}

// export function encodeJB721DelegatePayMetadata(metadata: JB721DelegatePayMetadata | undefined) {
// 	if (!metadata) return undefined;

// 	const args = [
// 		constants.HashZero,
// 		constants.HashZero,
// 		IJB721DELEGATE_INTERFACE_ID,
// 		metadata?.dontMint ?? false,
// 		metadata?.expectMintFromExtraFunds ?? false,
// 		metadata?.dontOverspend ?? false,
// 		metadata?.tierIdsToMint,
// 	];

// 	const encoded = defaultAbiCoder.encode(
// 		['bytes32', 'bytes32', 'bytes4', 'bool', 'bool', 'bool', 'uint16[]'],
// 		args,
// 	);

// 	return encoded;
// }

export function encodeJB721DelegateRedeemMetadata(tokenIdsToRedeem: string[]) {
	const args = [constants.HashZero, IJB721DELEGATE_INTERFACE_ID, tokenIdsToRedeem];

	const encoded = defaultAbiCoder.encode(['bytes32', 'bytes4', 'uint256[]'], args);

	return encoded;
}

// // sums the contribution floors of a given list of nftRewardTiers
// //    - optional select only an array of ids
// export function sumTierFloors(rewardTiers: NftRewardTier[], ids?: number[]) {
// 	if (ids) {
// 		rewardTiers = rewardTiers.filter((tier) => ids.includes(tier.id ?? -1));
// 	}
// 	return round(
// 		rewardTiers.reduce((subSum, tier) => subSum + tier.contributionFloor, 0),
// 		6,
// 	);
// }

export function buildJBDeployTiered721DelegateData({
	collectionUri,
	collectionName,
	collectionSymbol,
	tiers,
	ownerAddress,
	contractAddresses: {
		JBDirectoryAddress,
		JBFundingCycleStoreAddress,
		JBPricesAddress,
		JBTiered721DelegateStoreAddress,
	},
}: {
	collectionUri: string;
	collectionName: string;
	collectionSymbol: string;
	tiers: JB721TierParams[];
	ownerAddress: string;
	contractAddresses: {
		JBDirectoryAddress: string;
		JBFundingCycleStoreAddress: string;
		JBPricesAddress: string;
		JBTiered721DelegateStoreAddress: string;
	};
}): JBDeployTiered721DelegateData {
	const pricing: JB721PricingParams = {
		tiers,
		currency: V2_CURRENCY_ETH,
		decimals: WAD_DECIMALS,
		prices: JBPricesAddress,
	};

	return {
		directory: JBDirectoryAddress,
		name: collectionName,
		symbol: collectionSymbol,
		fundingCycleStore: JBFundingCycleStoreAddress,
		baseUri: ipfsUrl(''),
		tokenUriResolver: constants.AddressZero,
		contractUri: ipfsUrl(collectionUri),
		owner: ownerAddress,
		pricing,
		reservedTokenBeneficiary: constants.AddressZero,
		store: JBTiered721DelegateStoreAddress,
		flags: {
			lockReservedTokenChanges: false,
			lockVotingUnitChanges: false,
			lockManualMintingChanges: false,
		},
		governanceType: JB721GovernanceType.TIERED,
	};
}

// /**
//  * Return some hard-coded metadata overrides for specific projects.
//  */
// export function payMetadataOverrides(
// 	projectId: number,
// ): Omit<JB721DelegatePayMetadata, 'tierIdsToMint'> {
// 	// ConstitutionDAO2 wanted to _not_ overspend. That is, to not allow any payment amount that
// 	// doesn't equal one of the NFT tier amounts.
// 	if (projectId === V2V3_PROJECT_IDS.CDAO2) {
// 		return { dontOverspend: true };
// 	}

// 	return {};
// }
