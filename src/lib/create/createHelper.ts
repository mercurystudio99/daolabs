import { BigNumber, constants } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import {
	launchProjectFor as launchProjectFor721,
	reconfigureFundingCyclesOf,
} from '$utils/web3/nft-rewards/JBTiered721DelegateProjectDeployerWrapper';
import { encodeIPFSUri, ipfsUrl, pinFileToIpfs } from '$utils/ipfs';
import { V2_CURRENCY_ETH } from '$utils/v2/currency';
import { WAD_DECIMALS } from '$constants/numbers';
import { contracts } from '$utils/web3/contractMap';
import {
	JB721GovernanceType,
	type JB721PricingParams,
	type JB721TierParams,
	type JBDeployTiered721DelegateData,
	type JBLaunchProjectData,
	type JBReconfigureFundingCyclesData,
} from '$utils/web3/types';
import { readNetwork } from '$stores/web3';
import { DEFAULT_NFT_MAX_SUPPLY } from '$utils/nftRewards';
// import { IPFS_TAGS } from '$constants/ipfs';
import { movementEmojiImageUri } from '$constants/images';
import { hasPermissions, setOperator } from '$utils/web3/JBOperatorStore';
import { web3Transact } from '$lib/transaction';
import type { ContractPlatform } from '$constants/platform';
import type {
	IpfsNftCollectionMetadata,
	IPFSNftRewardTier,
	NftRewardTier,
} from '$models/nftRewardTier';

async function uploadNftRewardToIPFS(rewardTier: NftRewardTier): Promise<string> {
	const ipfsNftRewardTier: IPFSNftRewardTier = {
		description: rewardTier.description,
		name: rewardTier.name,
		externalLink: rewardTier.externalLink,
		symbol: undefined,
		image: rewardTier.imageUrl,
		imageDataUrl: undefined,
		artifactUri: undefined,
		animationUri: undefined,
		displayUri: undefined,
		youtubeUri: undefined,
		backgroundColor: undefined,
		attributes: [
			{
				trait_type: 'Min. Contribution',
				value: rewardTier.contributionFloor,
			},
			{
				trait_type: 'Max. Supply',
				value: rewardTier.maxSupply,
			},
		],
	};
	const data = await pinFileToIpfs(
		new File([JSON.stringify(ipfsNftRewardTier, null, ' ')], ''),
		undefined,
		undefined,
		true,
	);
	return data.IpfsHash;
}

// Uploads each nft reward tier to an individual location on IPFS
// returns an array of CIDs which point to each rewardTier on IPFS
async function uploadNftRewardsToIPFS(nftRewards: NftRewardTier[]): Promise<string[]> {
	return Promise.all(nftRewards.map((rewardTier) => uploadNftRewardToIPFS(rewardTier)));
}

export async function uploadNftCollectionMetadataToIPFS({
	collectionName,
	collectionDescription,
	collectionLogoUri,
	collectionInfoUri,
}: {
	collectionName: string;
	collectionDescription: string;
	collectionLogoUri: string | undefined;
	collectionInfoUri: string | undefined;
}) {
	const image = collectionLogoUri.length ? collectionLogoUri : movementEmojiImageUri;
	// TODO: add inputs for the rest of these fields
	const ipfsNftCollectionMetadata: IpfsNftCollectionMetadata = {
		name: collectionName,
		description: collectionDescription,
		image: image,
		seller_fee_basis_points: undefined,
		external_link: collectionInfoUri?.length ? collectionInfoUri : 'https://move.xyz',
		fee_recipient: undefined,
	};
	const data = await pinFileToIpfs(
		new File([JSON.stringify(ipfsNftCollectionMetadata, null, ' ')], ''),
	);
	return data.IpfsHash;
}

function buildJBDeployTiered721DelegateData({
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
				reservedTokenBeneficiary: constants.AddressZero,
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

// Default description for NFT collections on NFT marketplaces
const defaultNftCollectionDescription = (projectName: string | undefined) =>
	`NFTs rewarded to ${projectName?.length ? projectName : 'your project'}'s Juicebox contributors.`;

export async function deployNftProject(
	platform: ContractPlatform,
	projectOwner: string,
	projectData: JBLaunchProjectData,
	nftRewards: {
		projectName: string;
		logoUri: string;
		infoUri: string;
		collectionName: string;
		collectionSymbol: string;
		collectionDescription?: string;
		rewardTiers: NftRewardTier[];
	},
) {
	const {
		projectName,
		logoUri,
		infoUri,
		collectionName,
		collectionSymbol,
		collectionDescription,
		rewardTiers,
	} = nftRewards;

	const [rewardTiersCids, nftCollectionMetadataCid] = await Promise.all([
		uploadNftRewardsToIPFS(nftRewards.rewardTiers),
		uploadNftCollectionMetadataToIPFS({
			collectionName: collectionName ?? defaultNftCollectionDescription(projectName),
			collectionDescription: collectionDescription ?? defaultNftCollectionDescription(projectName),
			collectionLogoUri: logoUri,
			collectionInfoUri: infoUri,
		}),
	]);

	const tiers = buildJB721TierParams({
		cids: rewardTiersCids,
		rewardTiers,
	});

	const network = readNetwork.get().alias;
	const selectedContracts = contracts[platform][network];
	console.log({ selectedContracts, platform, network });

	const JBDirectoryAddress = (await selectedContracts.JBDirectory()).address;
	const JBFundingCycleStoreAddress = (await selectedContracts.JBFundingCycleStore()).address;
	const JBPricesAddress = (await selectedContracts.JBPrices()).address;
	const JBTiered721DelegateStoreAddress = (await selectedContracts.JBTiered721DelegateStore())
		.address;

	const deployTiered721DelegateData = buildJBDeployTiered721DelegateData({
		collectionName,
		collectionSymbol,
		collectionUri: nftCollectionMetadataCid,
		contractAddresses: {
			JBDirectoryAddress,
			JBFundingCycleStoreAddress,
			JBPricesAddress,
			JBTiered721DelegateStoreAddress,
		},
		ownerAddress: projectOwner,
		tiers,
	});
	console.log('Args:', [projectOwner, deployTiered721DelegateData, projectData]);
	return web3Transact(
		'launchProjectFor',
		launchProjectFor721,
		platform,
		projectOwner,
		deployTiered721DelegateData,
		projectData,
	);
}

export async function updateNftProject(
	platform: ContractPlatform,
	projectId: BigNumber,
	projectOwner: string,
	projectData: JBReconfigureFundingCyclesData,
	nftRewards: {
		projectName: string;
		logoUri: string;
		infoUri: string;
		collectionName: string;
		collectionSymbol: string;
		collectionDescription?: string;
		rewardTiers: NftRewardTier[];
	},
): ContractWrapperTxnReturnType<false> {
	const {
		projectName,
		logoUri,
		infoUri,
		collectionName,
		collectionSymbol,
		collectionDescription,
		rewardTiers,
	} = nftRewards;

	const [rewardTiersCids, nftCollectionMetadataCid] = await Promise.all([
		uploadNftRewardsToIPFS(nftRewards.rewardTiers),
		uploadNftCollectionMetadataToIPFS({
			collectionName: collectionName ?? defaultNftCollectionDescription(projectName),
			collectionDescription: collectionDescription ?? defaultNftCollectionDescription(projectName),
			collectionLogoUri: logoUri,
			collectionInfoUri: infoUri,
		}),
	]);

	const tiers = buildJB721TierParams({
		cids: rewardTiersCids,
		rewardTiers,
	});

	const network = readNetwork.get().alias;
	const selectedContracts = contracts[platform][network];
	console.log({ selectedContracts, platform, network });

	const JBDirectoryAddress = (await selectedContracts.JBDirectory()).address;
	const JBFundingCycleStoreAddress = (await selectedContracts.JBFundingCycleStore()).address;
	const JBPricesAddress = (await selectedContracts.JBPrices()).address;
	const JBTiered721DelegateStoreAddress = (await selectedContracts.JBTiered721DelegateStore())
		.address;

	const deployTiered721DelegateData = buildJBDeployTiered721DelegateData({
		collectionName,
		collectionSymbol,
		collectionUri: nftCollectionMetadataCid,
		contractAddresses: {
			JBDirectoryAddress,
			JBFundingCycleStoreAddress,
			JBPricesAddress,
			JBTiered721DelegateStoreAddress,
		},
		ownerAddress: projectOwner,
		tiers,
	});
	console.log('Args:', [platform, projectId, deployTiered721DelegateData, projectData]);

	const { address: operatorAddress } = await contracts[platform][
		readNetwork.get().alias
	].JBTiered721DelegateProjectDeployer();
	if (!(await hasPermissions(platform, operatorAddress, projectOwner, projectId, [1]))) {
		const txn = await web3Transact(
			'setOperator',
			setOperator,
			platform,
			operatorAddress,
			projectId,
			[1],
		);
		await txn.wait();
	}

	return web3Transact(
		'reconfigureFundingCyclesOf',
		reconfigureFundingCyclesOf,
		platform,
		projectId,
		deployTiered721DelegateData,
		projectData,
	);
}
