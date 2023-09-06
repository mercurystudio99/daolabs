import { BigNumber, ethers, type BytesLike } from 'ethers';
import { get } from 'svelte/store';
import { web3Provider as provider, readNetwork } from '../../stores/web3';

import { contracts } from './contractMap';
import type { RewardTier, OpenRewardTier, JBTokenAmount } from './types';
import type { ContractPlatform } from '$constants/platform';

/**
 * Deploys a full-fat ERC721 contract.
 *
 * @param owner NFT admin address.
 * @param tokenName Token name.
 * @param tokenSymbol Token symbol.
 * @param baseUri Base URI, initially expected to point at generic, "unrevealed" metadata json.
 * @param contractUri OpenSea-style contract metadata URI.
 * @param jbxProjectId Juicebox project id that will be paid the proceeds of the sale.
 * @param jbxDirectory Juicebox directory to determine payment destination.
 * @param maxSupply Max NFT supply.
 * @param unitPrice Price per token expressed in Ether.
 * @param mintAllowance Per-user mint cap.
 * @param reveal Sets the revealed flag on deployment. This impacts how token URI is presented.
 * @param opts Deployment options, gas, etc.
 */
export async function deployNFToken<T extends boolean = false>(
	platform: ContractPlatform,
	owner: string,
	tokenName: string,
	tokenSymbol: string,
	baseUri: string,
	contractUri: string,
	maxSupply: number | BigNumber,
	unitPrice: number | BigNumber,
	mintAllowance: number,
	reveal: boolean,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployNFToken(
			owner,
			tokenName,
			tokenSymbol,
			baseUri,
			contractUri,
			maxSupply,
			unitPrice,
			mintAllowance,
			reveal,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployNFToken(
		owner,
		tokenName,
		tokenSymbol,
		baseUri,
		contractUri,
		maxSupply,
		unitPrice,
		mintAllowance,
		reveal,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Deploys a MixedPaymentSplitter contract. It is possible to deploy this contract with partial subscription.
 *
 * @param name Name for this split configuration.
 * @param payees Payable addresses to send payment portion to.
 * @param projects Juicebox project ids to send payment portion to.
 * @param shares Share assignment in the same order as payees and projects parameters. Share total is 1,000,000.
 * @param jbxDirectory Juicebox directory contract.
 * @param owner Admin of this contract.
 * @param opts Deployment options, gas, etc.
 */
export async function deployMixedPaymentSplitter<T extends boolean = false>(
	platform: ContractPlatform,
	name: string,
	payees: string[],
	projects: number[],
	shares: number[],
	jbxDirectory: string,
	owner: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployMixedPaymentSplitter(
			name,
			payees,
			projects,
			shares,
			jbxDirectory,
			owner,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployMixedPaymentSplitter(
		name,
		payees,
		projects,
		shares,
		jbxDirectory,
		owner,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Deploys an English auction management contract.
 *
 * @param projectId Project that manages this auction contract.
 * @param feeReceiver An instance of IJBPaymentTerminal which will get auction fees.
 * @param feeRate Fee percentage expressed in terms of JBConstants.SPLITS_TOTAL_PERCENT (1000000000).
 * @param allowPublicAuctions A flag to allow anyone to create an auction on this contract rather than only accounts with the `AUTHORIZED_SELLER_ROLE` permission.
 * @param owner Contract admin if, should be msg.sender or another address.
 * @param directory JBDirectory instance to enable JBX integration.
 * @param opts Deployment options, gas, etc.
 */
export async function deployEnglishAuction<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number,
	feeReceiver: string,
	feeRate: number,
	allowPublicAuctions: boolean,
	owner: string,
	directory: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployEnglishAuction(
			projectId,
			feeReceiver,
			feeRate,
			allowPublicAuctions,
			owner,
			directory,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployEnglishAuction(
		projectId,
		feeReceiver,
		feeRate,
		allowPublicAuctions,
		owner,
		directory,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Deploys a Dutch auction management contract.
 *
 * @param projectId Project that manages this auction contract.
 * @param feeReceiver An instance of IJBPaymentTerminal which will get auction fees.
 * @param feeRate Fee percentage expressed in terms of JBConstants.SPLITS_TOTAL_PERCENT (1000000000).
 * @param allowPublicAuctions A flag to allow anyone to create an auction on this contract rather than only accounts with the `AUTHORIZED_SELLER_ROLE` permission.
 * @param periodDuration Number of seconds for each pricing period.
 * @param owner Contract admin if, should be msg.sender or another address.
 * @param directory JBDirectory instance to enable JBX integration.
 * @param opts Deployment options, gas, etc.
 */
export async function deployDutchAuction<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number,
	feeReceiver: string,
	feeRate: number,
	allowPublicAuctions: boolean,
	periodDuration: number,
	owner: string,
	directory: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployDutchAuction(
			projectId,
			feeReceiver,
			feeRate,
			allowPublicAuctions,
			periodDuration,
			owner,
			directory,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployDutchAuction(
		projectId,
		feeReceiver,
		feeRate,
		allowPublicAuctions,
		periodDuration,
		owner,
		directory,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Deploys a fixed-price sale management contract.
 *
 * @param projectId Project that manages this auction contract.
 * @param feeReceiver An instance of IJBPaymentTerminal which will get auction fees.
 * @param feeRate Fee percentage expressed in terms of JBConstants.SPLITS_TOTAL_PERCENT (1000000000).
 * @param allowPublicAuctions A flag to allow anyone to create an auction on this contract rather than only accounts with the `AUTHORIZED_SELLER_ROLE` permission.
 * @param periodDuration Number of seconds for each pricing period.
 * @param owner Contract admin if, should be msg.sender or another address.
 * @param directory JBDirectory instance to enable JBX integration.
 * @param opts Deployment options, gas, etc.
 */
export async function deployFixedPriceSale<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: number,
	feeReceiver: string,
	feeRate: number,
	allowPublicSales: boolean,
	periodDuration: number,
	owner: string,
	directory: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployDutchAuction(
			projectId,
			feeReceiver,
			feeRate,
			allowPublicSales,
			periodDuration,
			owner,
			directory,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployDutchAuction(
		projectId,
		feeReceiver,
		feeRate,
		allowPublicSales,
		periodDuration,
		owner,
		directory,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Deploys a low-cost, shared-code ERC721 NFT contract.
 *
 * @param owner NFT admin address.
 * @param tokenName Token name.
 * @param tokenSymbol Token symbol.
 * @param baseUri Base URI, initially expected to point at generic, "unrevealed" metadata json.
 * @param contractUri OpenSea-style contract metadata URI.
 * @param maxSupply Max NFT supply.
 * @param unitPrice Price per token expressed in Ether.
 * @param mintAllowance Per-user mint cap.
 * @param opts Deployment options, gas, etc.
 */
export async function deployNFUToken<T extends boolean = false>(
	platform: ContractPlatform,
	owner: string,
	tokenName: string,
	tokenSymbol: string,
	baseUri: string,
	contractUri: string,
	maxSupply: number | BigNumber,
	unitPrice: number | BigNumber,
	mintAllowance: number | BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployNFUToken(
			owner,
			tokenName,
			tokenSymbol,
			baseUri,
			contractUri,
			maxSupply,
			unitPrice,
			mintAllowance,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployNFUToken(
		owner,
		tokenName,
		tokenSymbol,
		baseUri,
		contractUri,
		maxSupply,
		unitPrice,
		mintAllowance,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Deploys a pseudo ERC1155.
 *
 * @param owner NFT admin address.
 * @param tokenName Token name.
 * @param tokenSymbol Token symbol.
 * @param baseUri Base URI, initially expected to point at generic, "unrevealed" metadata json.
 * @param contractUri OpenSea-style contract metadata URI.
 * @param maxSupply Max NFT supply.
 * @param unitPrice Price per token expressed in Ether.
 * @param mintAllowance Per-user mint cap.
 * @param opts Deployment options, gas, etc.
 */
export async function deployNFUEdition<T extends boolean = false>(
	platform: ContractPlatform,
	owner: string,
	tokenName: string,
	tokenSymbol: string,
	baseUri: string,
	contractUri: string,
	maxSupply: number | BigNumber,
	unitPrice: number | BigNumber,
	mintAllowance: number | BigNumber,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployNFUEdition(
			owner,
			tokenName,
			tokenSymbol,
			baseUri,
			contractUri,
			maxSupply,
			unitPrice,
			mintAllowance,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployNFUEdition(
		owner,
		tokenName,
		tokenSymbol,
		baseUri,
		contractUri,
		maxSupply,
		unitPrice,
		mintAllowance,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 *
 * Deploys the PaymentProcessor contract which serves as a proxy between the payer and the Juicebox platform. It allows payment acceptance in case of Juicebox project misconfiguration. It allows acceptance of ERC20 tokens via liquidation even if there is no corresponding Juicebox payment terminal. PaymentProcessor will use the platform TokenLiquidator instance.
 *
 * @param jbxDirectory Juicebox directory.
 * @param jbxOperatorStore Juicebox operator store.
 * @param jbxProjects Juicebox project registry.
 * @param jbxProjectId Juicebox project id to pay into.
 * @param ignoreFailures If payment forwarding to the Juicebox terminal fails, Ether will be retained in this contract and ERC20 tokens will be processed per stored instructions. Setting this to false will `revert` failed payment operations.
 * @param defaultLiquidation Setting this to true will automatically attempt to convert the incoming ERC20 tokens into WETH via Uniswap unless there are specific settings for the given token. Setting it to false will attempt to send the tokens to an appropriate Juicebox terminal, on failure, _ignoreFailures will be followed.
 * @param opts Deployment options, gas, etc.
 */
export async function deployPaymentProcessor<T extends boolean = false>(
	platform: ContractPlatform,
	jbxDirectory: string,
	jbxOperatorStore: string,
	jbxProjects: string,
	jbxProjectId: number,
	ignoreFailures: boolean,
	defaultLiquidation: boolean,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployPaymentProcessor(
			jbxDirectory,
			jbxOperatorStore,
			jbxProjects,
			jbxProjectId,
			ignoreFailures,
			defaultLiquidation,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployPaymentProcessor(
		jbxDirectory,
		jbxOperatorStore,
		jbxProjects,
		jbxProjectId,
		ignoreFailures,
		defaultLiquidation,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 *
 * @param baseUri Token metadata URI.
 * @param opts Deployment options, gas, etc.
 */
export async function deployOpenTieredTokenUriResolver<T extends boolean = false>(
	platform: ContractPlatform,
	baseUri: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployOpenTieredTokenUriResolver(
			baseUri,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployOpenTieredTokenUriResolver(
		baseUri,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 *
 * @param contributionToken Token to accept, ERC20 contract address or '0x000000000000000000000000000000000000EEEe' for Ether.
 * @param tiers Price tiers.
 * @param opts Deployment options, gas, etc.
 */
export async function deployOpenTieredPriceResolver<T extends boolean = false>(
	platform: ContractPlatform,
	contributionToken: string,
	tiers: OpenRewardTier[],
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployOpenTieredPriceResolver(
			contributionToken,
			tiers,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployOpenTieredPriceResolver(
		contributionToken,
		tiers,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 *
 * @param contributionToken Token to accept, ERC20 contract address or '0x000000000000000000000000000000000000EEEe' for Ether.
 * @param mintCap Total number of tokens to mint.
 * @param userMintCap Per-user mint cap.
 * @param tiers Price tiers.
 * @param opts Deployment options, gas, etc.
 */
export async function deployTieredPriceResolver<T extends boolean = false>(
	platform: ContractPlatform,
	contributionToken: string,
	mintCap: BigNumber | number,
	userMintCap: BigNumber | number,
	tiers: RewardTier[],
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployTieredPriceResolver(
			contributionToken,
			mintCap,
			userMintCap,
			tiers,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployTieredPriceResolver(
		contributionToken,
		mintCap,
		userMintCap,
		tiers,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Deploys NFTRewardDataSourceDelegate contracts. This may need a URI resolver and price resolver depending on use-case. Those are deployed with deployOpenTieredTokenUriResolver and deployOpenTieredPriceResolver or deployTieredPriceResolver. Note that the NFTRewardDataSourceDelegate contract is itself an ERC721 NFT based on the rari-capital implementation.
 *
 * @param projectId Juicebox project id associated with the NFT
 * @param jbxDirectory Juicebox directory.
 * @param maxSupply Maximum number of tokens to mint.
 * @param minContribution Minimum contribution amount that triggers an NDT issuance to the caller.
 * @param tokenName NFT name.
 * @param tokenSymbol NFT symbol
 * @param uri Token metadata URI.
 * @param tokenUriResolverAddress Token URI resolver for advanced use-cases. Can be set to `address(0)` in which case uri will be used. This contract can be deployed later and then applied to the RewardDataSource via `setTokenUriResolver` contract call.
 * @param contractMetadataUri OpenSea-style contract metadata.
 * @param admin Contract owner.
 * @param priceResolver Price resolver for advanced use-cases. If in use, this contract must be deployed prior to calling this function.
 * @param opts Deployment options, gas, etc.
 */
export async function deployNFTRewardDataSource<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber | number,
	jbxDirectory: string,
	maxSupply: BigNumber | number,
	minContribution: JBTokenAmount,
	tokenName: string,
	tokenSymbol: string,
	uri: string,
	tokenUriResolverAddress: string,
	contractMetadataUri: string,
	admin: string,
	priceResolver: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployNFTRewardDataSource(
			projectId,
			jbxDirectory,
			maxSupply,
			minContribution,
			tokenName,
			tokenSymbol,
			uri,
			tokenUriResolverAddress,
			contractMetadataUri,
			admin,
			priceResolver,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployNFTRewardDataSource(
		projectId,
		jbxDirectory,
		maxSupply,
		minContribution,
		tokenName,
		tokenSymbol,
		uri,
		tokenUriResolverAddress,
		contractMetadataUri,
		admin,
		priceResolver,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Deploys EnglishAuctionMachine contracts.
 *
 * @param opts Deployment options, gas, etc.
 */
export async function deployEnglishAuctionMachine<T extends boolean = false>(
	platform: ContractPlatform,
	maxAuctions: BigNumber | number,
	auctionDuration: BigNumber | number,
	projectId: BigNumber | number,
	jbxDirectory: string,
	token: string,
	owner: string,
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const DeployerProxy = await contracts[platform][get(readNetwork).alias].DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployEnglishAuctionMachine(
			maxAuctions,
			auctionDuration,
			projectId,
			jbxDirectory,
			token,
			owner,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployEnglishAuctionMachine(
		maxAuctions,
		auctionDuration,
		projectId,
		jbxDirectory,
		token,
		owner,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}

/**
 * Deploys a clone of the ThinProjectPayer contract. It's functionally identical to JBETHERC20ProjectPayer, but cheaper to create.
 * Leave jbxDirectory, jbxOperatorStore, and jbxProjects blank/empty string to use the default values and to set opts.
 * @param opts Deployment options, gas, etc.
 */
export async function deployThinProjectPayer<T extends boolean = false>(
	platform: ContractPlatform,
	projectId: BigNumber | number,
	beneficiary: string,
	preferClaimedTokens = false,
	preferAddToBalance = false,
	memo = '',
	metadata: BytesLike = '0x00',
	jbxDirectory: string = '',
	jbxOperatorStore: string = '',
	jbxProjects: string = '',
	{
		populateTxn = <T>false,
		actualProvider = provider.get(),
		...opts
	}: ContractWrapperTxnOpts<T> = {},
): ContractWrapperTxnReturnType<T> {
	const currentContracts = contracts[platform][get(readNetwork).alias];
	// Set default values if not provided.
	if (!jbxDirectory) {
		jbxDirectory = (await currentContracts.JBDirectory())?.address;
	}
	if (!jbxOperatorStore) {
		jbxOperatorStore = (await currentContracts.JBOperatorStore())?.address;
	}
	if (!jbxProjects) {
		jbxProjects = (await currentContracts.JBProjects())?.address;
	}

	const DeployerProxy = await currentContracts.DeployerProxy();
	const contract = new ethers.Contract(
		DeployerProxy.address,
		DeployerProxy.abi,
		actualProvider.getSigner(),
	);

	if (populateTxn) {
		return contract.populateTransaction.deployProjectPayer(
			jbxDirectory,
			jbxOperatorStore,
			jbxProjects,
			projectId,
			beneficiary,
			preferClaimedTokens,
			preferAddToBalance,
			memo,
			metadata,
			opts,
		) as ContractWrapperTxnReturnType<T>;
	}
	return contract.functions.deployProjectPayer(
		jbxDirectory,
		jbxOperatorStore,
		jbxProjects,
		projectId,
		beneficiary,
		preferClaimedTokens,
		preferAddToBalance,
		memo,
		metadata,
		opts,
	) as ContractWrapperTxnReturnType<T>;
}
