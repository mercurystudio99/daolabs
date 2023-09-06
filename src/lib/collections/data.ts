import { BigNumber, constants } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { sign } from 'tweetnacl';
import axios from 'axios';
import { getProjects, getProjectMetadata } from '$data/project';
import { chainId, readNetwork } from '$stores/web3';
import { JUICEBOX_MONEY_METADATA_DOMAIN } from '$constants/v2/metadataDomain';
import { CodeError } from '$utils/errors';
import {
	currentFundingCycleOf,
	distributionLimitOf,
	queuedFundingCycleOf,
	reservedTokenBalanceOf,
	usedDistributionLimitOf,
} from '$utils/web3/JBControllerWrapper';
import { metadataContentOf, ownerOf } from '$utils/web3/JBProjects';
import { ETH_PAYOUT_SPLIT_GROUP, RESERVED_TOKEN_SPLIT_GROUP } from '$constants/v2/splits';
import { splitsOf } from '$utils/web3/JBSplitsStore';
import { tokenOf, totalSupplyOf } from '$utils/web3/JBTokenStoreWrapper';
import { readContractByAddress } from '$utils/web3/contractReader';
import ERC20ContractAbi from '$constants/ERC20ContractAbi';
import { terminalsOf } from '$utils/web3/JBDirectory';
import { ETH_TOKEN_ADDRESS } from '$constants/v2/juiceboxTokens';
import { currentOverflowOf } from '$utils/web3/JBSingleTokenPaymentTerminalStore';
import { contractUriOf, tiers } from '$utils/web3/nft-rewards/JBTiered721DelegateStoreWrapper';
import { MAX_NFT_REWARD_TIERS } from '$utils/nftRewards';
import { getNftRewardCollectionMetadata, getNftRewardTierMetadata } from '$data/nftRewards';
import { decodeEncodedIPFSUri, ipfsUrlToCid } from '$utils/ipfs';
import { getDefaultConfettiOptions } from '$lib/utils/confetti';
import { symbol } from '$utils/web3/nft-rewards/JB721TieredGovernance';
import type { V2FundingCycle, V2FundingCycleMetadata } from '$models/v2/fundingCycle';
import type Store from '$utils/Store';
import type { V2ProjectContextType } from '$models/project-type';
import type { ContractPlatform, ProjectPlatform } from '$constants/platform';

export function checkNetworkId(_chainId: number) {
	if (Number(readNetwork.get().id) !== _chainId) {
		console.log('Network changed', chainId.get(), _chainId);
		throw new CodeError(
			`aborting: network was changed (from: ${_chainId} to: ${chainId.get()})`,
			'networkChanged',
		);
	}
}

export function getContractPlatform(platform: ProjectPlatform, alter = false): ContractPlatform {
	return platform === 'juicebox' ? (alter ? 'juicebox2' : 'juicebox3') : platform;
}

export function getProjectPlatform(
	project: Store<V2ProjectContextType>,
	alter = false,
): ContractPlatform {
	const { platform } = project.get();
	return getContractPlatform(platform, alter);
}

export async function loadInitial(
	project: Store<V2ProjectContextType>,
	redirectIfHasHandle: boolean,
) {
	const { projectId } = project.get();
	const platform = getProjectPlatform(project);
	const [resultingProject] = await getProjects({
		keys: ['projectId', 'handle', 'createdAt', 'totalPaid'],
		projectId,
		platform: platform === 'juicebox3' ? 'juicebox' : platform,
	});
	if (resultingProject && resultingProject.handle) {
		project.update((values) => ({
			...values,
			handle: resultingProject.handle,
		}));

		if (redirectIfHasHandle) {
			history.replaceState({}, '', `/@${resultingProject.handle}`);
		}
	}

	project.update((values) => ({
		...values,
		createdAt: resultingProject?.createdAt,
		totalVolume: resultingProject?.totalPaid,
	}));
}

export async function loadMetadata(
	project: Store<V2ProjectContextType>,
	networkId: number,
	cached: boolean,
) {
	checkNetworkId(networkId);
	const { projectId } = project.get();
	const platform = getProjectPlatform(project);

	const metadataCID = await metadataContentOf(
		platform,
		projectId,
		JUICEBOX_MONEY_METADATA_DOMAIN,
		cached,
	);
	checkNetworkId(networkId);
	type ProjectMetadata = (ReturnType<typeof getProjectMetadata> extends Promise<infer T>
		? T
		: {}) & {
		confetti: V2ProjectContextType['confetti'];
	};
	const { confetti, ...metadata } = (await getProjectMetadata(metadataCID)) as ProjectMetadata;

	if (!metadata) {
		console.log('No metadata found for project', projectId);
		throw new CodeError('Metadata missing', 'noMetadata');
	}

	let verifiedTwitter = false;
	let username = '';

	if (typeof metadata.twitterVerified === 'string' && metadata.twitterVerified) {
		const { data }: { data: { publicKey: string } } = await axios.get(
			`${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string}/app/auth/publickey`,
			{
				headers: {
					apikey: import.meta.env.VITE_API_KEY as string,
				},
			},
		);
		const publicKey = Buffer.from(data.publicKey, 'hex');

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const signed = Buffer.from(metadata.twitterVerified, 'hex');
		const message = new TextDecoder().decode(sign.open(signed, publicKey));

		const [, twitterUid] = message.match(/\d+/g).map((n, i) => (i === 0 ? Number(n) : n)) as [
			number,
			string,
		];

		const response = await fetch(`https://juicebox.wtf/api/twitter/?uid=${twitterUid}`);
		const result = (await response.json()) as { username: string };
		if (result.username?.toLowerCase() && metadata.twitter?.toLowerCase()) {
			verifiedTwitter = true;
			username = result.username;
		}
	}

	project.update((values) => ({
		...values,
		projectMetadata: {
			...metadata,
			twitterVerifiedUsername: verifiedTwitter ? username : '',
		},
		confetti: confetti ?? getDefaultConfettiOptions(),
	}));
}

export async function loadFundingCycle(project: Store<V2ProjectContextType>, networkId: number) {
	checkNetworkId(networkId);
	const { projectId } = project.get();
	const platform = getProjectPlatform(project);

	const { fundingCycle, metadata: fundingCycleMetadata } = (await currentFundingCycleOf(
		platform,
		projectId,
	)) as { fundingCycle: V2FundingCycle; metadata: V2FundingCycleMetadata };

	if (fundingCycle?.number?.eq(0)) {
		const platformV2 = getProjectPlatform(project, true);
		const { fundingCycle: fundingCycleV2, metadata: fundingCycleMetadatav2 } =
			(await currentFundingCycleOf(platformV2, projectId)) as {
				fundingCycle: V2FundingCycle;
				metadata: V2FundingCycleMetadata;
			};

		project.update((values) => ({
			...values,
			version: platform === 'daolabs' ? '3' : '2',
			fundingCycle: fundingCycleV2,
			fundingCycleMetadata: fundingCycleMetadatav2,
		}));
	} else {
		project.update((values) => ({
			...values,
			version: '3',
			fundingCycle,
			fundingCycleMetadata,
		}));
	}
}

export async function loadQueuedFundingCycle(
	project: Store<V2ProjectContextType>,
	networkId: number,
) {
	checkNetworkId(networkId);
	const { projectId } = project.get();
	const platform = getProjectPlatform(project);

	const { fundingCycle, metadata: fundingCycleMetadata } = (await queuedFundingCycleOf(
		platform,
		projectId,
	)) as { fundingCycle: V2FundingCycle; metadata: V2FundingCycleMetadata };

	project.update((values) => ({
		...values,
		queuedFundingCycle: fundingCycle,
		queuedFundingCycleMetadata: fundingCycleMetadata,
	}));
}

export async function loadProjectOwner(project: Store<V2ProjectContextType>, networkId: number) {
	checkNetworkId(networkId);
	const { projectId } = project.get();
	const platform = getProjectPlatform(project);

	const owner = await ownerOf(platform, BigNumber.from(projectId));

	project.update((values) => ({
		...values,
		projectOwnerAddress: owner,
	}));
}

export async function loadSplitsOf(project: Store<V2ProjectContextType>, networkId: number) {
	checkNetworkId(networkId);
	const { projectId, fundingCycle } = project.get();
	const platform = getProjectPlatform(project);

	const splitResult = await splitsOf(
		platform,
		projectId,
		fundingCycle.configuration,
		ETH_PAYOUT_SPLIT_GROUP,
	);

	project.update((values) => ({
		...values,
		payoutSplits: splitResult.map((split) => ({
			projectId: split?.projectId,
			percent: split?.percent?.toNumber(),
			lockedUntil: split?.lockedUntil?.toNumber(),
			beneficiary: split?.beneficiary,
			allocator: split?.allocator,
			preferClaimed: split?.preferClaimed,
			preferAddToBalance: split?.preferAddToBalance,
		})),
	}));
}

export async function loadReservedTokensSplitsOf(
	project: Store<V2ProjectContextType>,
	networkId: number,
) {
	checkNetworkId(networkId);
	const { projectId, fundingCycle } = project.get();
	const platform = getProjectPlatform(project);

	const splitResult = await splitsOf(
		platform,
		projectId,
		fundingCycle.configuration,
		RESERVED_TOKEN_SPLIT_GROUP,
	);

	project.update((values) => ({
		...values,
		reservedTokensSplits: splitResult.map((split) => ({
			projectId: split?.projectId,
			percent: split?.percent?.toNumber(),
			lockedUntil: split?.lockedUntil?.toNumber(),
			beneficiary: split?.beneficiary,
			allocator: split?.allocator,
			preferClaimed: split?.preferClaimed,
			preferAddToBalance: split?.preferAddToBalance,
		})),
	}));
}

export async function loadTokenOf(project: Store<V2ProjectContextType>, networkId: number) {
	checkNetworkId(networkId);
	const { projectId } = project.get();
	const platform = getProjectPlatform(project);

	const tokenAddress = await tokenOf(platform, projectId);
	let tokenSymbol: string;

	if (tokenAddress && tokenAddress !== constants.AddressZero) {
		checkNetworkId(networkId);
		tokenSymbol = (await readContractByAddress(
			tokenAddress,
			ERC20ContractAbi,
			'symbol',
			[],
		)) as string;
	}

	project.update((values) => ({
		...values,
		tokenAddress,
		tokenSymbol,
	}));
}

export async function loadTotalSupplyOf(project: Store<V2ProjectContextType>, networkId: number) {
	checkNetworkId(networkId);
	const { projectId } = project.get();
	const platform = getProjectPlatform(project);

	const totalTokenSupply = await totalSupplyOf(platform, projectId);

	project.update((values) => ({
		...values,
		totalTokenSupply,
	}));
}

export async function loadPrimaryTerminalOf(
	project: Store<V2ProjectContextType>,
	networkId: number,
) {
	checkNetworkId(networkId);
	const { projectId } = project.get();
	const platform = getProjectPlatform(project);

	const terminals = await terminalsOf(platform, projectId);

	project.update((values) => ({
		...values,
		primaryTerminal: terminals?.[0],
	}));
}

export async function loadDistributionLimitOf(
	project: Store<V2ProjectContextType>,
	networkId: number,
) {
	checkNetworkId(networkId);
	const { projectId, fundingCycle, primaryTerminal } = project.get();
	const platform = getProjectPlatform(project);

	if (!primaryTerminal) return;

	const [distributionLimit, distributionLimitCurrency] = await distributionLimitOf(
		platform,
		projectId,
		fundingCycle.configuration,
		primaryTerminal,
		ETH_TOKEN_ADDRESS,
	);

	project.update((values) => ({
		...values,
		distributionLimit,
		distributionLimitCurrency,
	}));
}

export async function loadPrimaryTerminalCurrentOverflow(
	project: Store<V2ProjectContextType>,
	networkId: number,
) {
	checkNetworkId(networkId);
	const { projectId, primaryTerminal } = project.get();
	const platform = getProjectPlatform(project);

	let primaryTerminalCurrentOverflow = BigNumber.from(0);

	if (primaryTerminal && primaryTerminal !== constants.AddressZero) {
		primaryTerminalCurrentOverflow = await currentOverflowOf(platform, projectId, primaryTerminal);
	}

	project.update((values) => ({
		...values,
		primaryTerminalCurrentOverflow,
	}));
}

export async function loadUsedDistributionLimitOf(
	project: Store<V2ProjectContextType>,
	networkId: number,
) {
	checkNetworkId(networkId);
	const { projectId, fundingCycle, primaryTerminal } = project.get();
	const platform = getProjectPlatform(project);

	if (!primaryTerminal) return;

	const usedDistributionLimit = await usedDistributionLimitOf(
		platform,
		projectId,
		primaryTerminal,
		fundingCycle.number,
	);

	project.update((values) => ({
		...values,
		usedDistributionLimit,
	}));
}

export async function loadReservedTokenBalance(
	project: Store<V2ProjectContextType>,
	networkId: number,
) {
	checkNetworkId(networkId);
	const { projectId, fundingCycleMetadata } = project.get();
	const platform = getProjectPlatform(project);

	const reservedTokenBalance = await reservedTokenBalanceOf(
		platform,
		projectId,
		fundingCycleMetadata.reservedRate,
	);

	project.update((values) => ({
		...values,
		reservedTokenBalance,
	}));
}

export async function loadNftRewardTiers(project: Store<V2ProjectContextType>, networkId: number) {
	checkNetworkId(networkId);
	const { fundingCycleMetadata } = project.get();
	const platform = getProjectPlatform(project);

	const tiersResult = await tiers(
		platform,
		fundingCycleMetadata.dataSource,
		0,
		MAX_NFT_REWARD_TIERS,
	);
	if (!tiersResult.length) return;
	const collectionCid = await contractUriOf(platform, fundingCycleMetadata.dataSource);
	if (!collectionCid) return;
	const collectionMetadata = await getNftRewardCollectionMetadata(
		ipfsUrlToCid(collectionCid).replace(/ipfs:\/\//, ''),
	);

	let tokenSymbol = '';
	try {
		tokenSymbol = await symbol(platform, fundingCycleMetadata.dataSource);
	} catch (e) {
		if (e instanceof Error) {
			console.error(e.message);
		} else {
			console.error(e);
		}
	}

	const cids = tiersResult.map((tier) => decodeEncodedIPFSUri(tier.encodedIPFSUri));
	const tiersIpfsData = await Promise.all(cids.map((cid: string) => getNftRewardTierMetadata(cid)));

	project.update((values) => ({
		...values,
		nftRewardTiers: {
			rewardTiers: tiersResult.map((tier, index) => ({
				id: tier.id?.toNumber(),
				name: tiersIpfsData[index].name,
				description: tiersIpfsData[index].description,
				externalLink: tiersIpfsData[index].externalLink,
				imageUrl: tiersIpfsData[index].image,
				contributionFloor: Number(formatEther(tier.contributionFloor)),
				maxSupply: tier.initialQuantity?.toNumber(),
				remainingSupply: tier.remainingQuantity?.toNumber(),
			})),
			CIDs: tiersResult.map((tier) => decodeEncodedIPFSUri(tier.encodedIPFSUri)),
			collectionMetadata: {
				name: collectionMetadata.name,
				symbol: collectionMetadata.symbol ?? tokenSymbol,
				uri: collectionMetadata.external_link ?? collectionMetadata.uri,
				external_link: collectionMetadata.external_link,
				description: collectionMetadata.description,
			},
		},
	}));
}
