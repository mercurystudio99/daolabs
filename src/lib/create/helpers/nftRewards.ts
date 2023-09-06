import { BigNumber, constants } from 'ethers';
import { parseEther } from 'ethers/lib/utils.js';
import { ETH_TOKEN_ADDRESS } from '$constants/v2/juiceboxTokens';
import { MaxUint48 } from '$utils/math';
import IPFS_GATEWAY_HOSTNAME from '$constants/ipfs';
import type { ContractNftRewardTier } from 'src/app';

export function getJBDeployTieredNFTRewardDataSourceData({
	projectName,
	nftRewards,
	ownerAddress,
	directory,
}: {
	projectName: string;
	nftRewards: { [cid: string]: number };
	ownerAddress: string;
	directory: string;
}) {
	const tiersArg: ContractNftRewardTier[] = Object.keys(nftRewards).map((cid) => {
		const contributionFloorWei = parseEther(nftRewards[cid].toString());
		return {
			contributionFloor: contributionFloorWei,
			remainingQuantity: BigNumber.from(MaxUint48),
			initialQuantity: BigNumber.from(0),
			tokenUri: `https://${IPFS_GATEWAY_HOSTNAME}/ipfs/${cid}`,
			votingUnits: BigNumber.from(0),
			reservedRate: BigNumber.from(0),
		};
	});

	return {
		directory,
		name: projectName,
		symbol: 'NFT',
		tokenUriResolver: constants.AddressZero,
		contractUri: 'ipfs://null',
		owner: ownerAddress,
		contributionToken: ETH_TOKEN_ADDRESS,
		tiers: tiersArg,
		shouldMintByDefault: true,
	};
}
