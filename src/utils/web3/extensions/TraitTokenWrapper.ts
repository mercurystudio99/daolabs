/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from '../contractMap';
import type { ContractPlatform } from '$constants/platform';

/**
 * TraitToken is an extension of NFToken. This wrapper adds the single function that is added there. For the rest use NFTokenWrapper.
 */

/**
 * Admin function to set individual token CID.
 *
 * @param contractAddress Address of the contract to invoke.
 * @param tokenId Token id
 * @param cid IPFS CID
 * @param opts Operation options, gas, etc.
 */
export async function setTokenAsset<T extends boolean = false>(
	platform: ContractPlatform,
	contractAddress: string,
	tokenId: BigNumber | number,
	cid: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const TraitToken = await contracts[platform][get(readNetwork).alias].TraitToken();
	const contract = new ethers.Contract(contractAddress, TraitToken.abi, actualProvider.getSigner());

	const truncatedCID = '0x' + Buffer.from(cid.slice(2)).toString('hex');

	if (populateTxn) {
		return contract.populateTransaction.setTokenAsset(
			tokenId,
			truncatedCID,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.setTokenAsset(
		tokenId,
		truncatedCID,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
