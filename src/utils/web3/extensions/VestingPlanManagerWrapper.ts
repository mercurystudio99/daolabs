import { BigNumber, ethers } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '$stores/web3';

import { contracts } from '../contractMap';
import { readContractByAddress } from '../contractReader';
import type { ContractPlatform } from '$constants/platform';

/**
 * Creates a vesting plan. Emits a `CreatePlan` event. Plan id is generated from incoming parameters and is published in the `CreatePlan` event.
 *
 * @param receiver Receiver of the tokens.
 * @param token ERC20 token to distribute.
 * @param amount Token amount to distribute each vesting period.
 * @param cliff Vesting cliff for the first distribution.
 * @param periodDuration Vesting period duration in seconds.
 * @param eventCount Number of periods to schedule.
 * @param memo String to include in the emitted CreatePlan event.
 * @param opts Operation options, gas, etc.
 */
export async function create<T extends boolean = false>(
	platform: ContractPlatform,
	receiver: string,
	token: string,
	amount: BigNumber,
	cliff: BigNumber,
	periodDuration: BigNumber,
	eventCount: BigNumber,
	memo: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const VestingPlanManager = await contracts[platform][get(readNetwork).alias].VestingPlanManager();
	const contract = new ethers.Contract(
		VestingPlanManager.address,
		VestingPlanManager.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.create(
			receiver,
			token,
			amount,
			cliff,
			periodDuration,
			eventCount,
			memo,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.create(
		receiver,
		token,
		amount,
		cliff,
		periodDuration,
		eventCount,
		memo,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Terminates a vesting plan in progress. This method is only available to the account that set up the plan originally. Before the plan record is removed any vested, but not distributed balance is sent out to the receiver.
 *
 * @param id Vesting plan id.
 */
export async function terminate<T extends boolean = false>(
	platform: ContractPlatform,
	id: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const VestingPlanManager = await contracts[platform][get(readNetwork).alias].VestingPlanManager();
	const contract = new ethers.Contract(
		VestingPlanManager.address,
		VestingPlanManager.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.terminate(id, opts) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.terminate(id, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * A trustless function to distribute tokens, if available, from a given plan.
 *
 * @param id Vesting plan id.
 * @param opts Operation options, gas, etc.
 */
export async function distribute<T extends boolean = false>(
	platform: ContractPlatform,
	id: BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const VestingPlanManager = await contracts[platform][get(readNetwork).alias].VestingPlanManager();
	const contract = new ethers.Contract(
		VestingPlanManager.address,
		VestingPlanManager.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.distribute(id, opts) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.distribute(id, opts) as ContractWrapperTxnReturnType<T>;
}

/**
 * Returns a `VestingPlan` struct and the end of the most-recently claimed distribution period in seconds.
 *
 * @param id Vesting plan id.
 * @param cache Option to cache the response in the environment.
 */
export async function planDetails(
	platform: ContractPlatform,
	id: BigNumber,
	cache: boolean = false,
): Promise<any> {
	const VestingPlanManager = await contracts[platform][get(readNetwork).alias].VestingPlanManager();
	const contractAddress = VestingPlanManager.address;
	const abi = VestingPlanManager.abi;

	return readContractByAddress(contractAddress, abi, 'planDetails', [id], cache);
}

/**
 * @notice Returns the unvested amount and token for a given plan.
 *
 * @param _id Vesting plan id.
 * @param cache Option to cache the response in the environment.
 */
export async function unvestedBalance(
	platform: ContractPlatform,
	id: BigNumber,
	cache: boolean = false,
): Promise<any> {
	const VestingPlanManager = await contracts[platform][get(readNetwork).alias].VestingPlanManager();
	const contractAddress = VestingPlanManager.address;
	const abi = VestingPlanManager.abi;

	return readContractByAddress(contractAddress, abi, 'unvestedBalance', [id], cache);
}
