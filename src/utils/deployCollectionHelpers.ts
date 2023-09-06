import { BigNumber, type ContractTransaction, utils, type PopulatedTransaction } from 'ethers';
import {
	type AdvancedCollection,
	type Collection,
	type Contract,
	isPayoutReceiver,
	type PayoutReceiver,
	type SimpleCollection,
	initialCollectionContracts,
} from '$models/minter/collection-config';
import { calculateTotalCombinations } from '$utils/pfp';
import { getNftMetadataFiles } from '$utils/collectionMetadata';
import { cidFromUrl, pinFileToIpfs } from '$utils/ipfs';
import {
	getNftContractAddress,
	getSumNftTotalSupply,
	isAdvancedCollection,
	isPfpCollection,
	isSimpleCollection,
} from '$utils/collectionHelpers';
import { connectedAccount } from '$stores/web3';
import {
	addRevealer,
	registerEdition,
	setPayoutReceiver,
	setRoyalties as wrapperSetRoyalties,
} from '$utils/web3/extensions/NFTokenWrapper';
import { deployNFToken, deployNFUEdition } from '$utils/web3/deployerWrapper';
import { isRevenueSplit, type RevenueSplit } from '$models/user/revenue-splits';
import { revealerAddress } from '$constants/config';
import { scheduleRevealForCollection } from '$services/schedule';
import type { EditionConfig } from '$models/minter/nft-config';

export type CollectionIssue = (collection: Collection) => boolean;
export type CollectionIssues = keyof typeof commonIssues;
export type CollectionIssuesText = Record<CollectionIssues, string>;

function necessaryAssetsMissing(collection: AdvancedCollection): boolean {
	if (!collection.nfts?.length) return false;

	if (isPfpCollection(collection)) {
		return collection.nfts.some((nft) => !nft.ipfs);
	}

	// This should account for music & p5js, I think?
	return !collection.nfts.length;
}

function royaltyRevenueSplitNotDeployed(collection: AdvancedCollection): boolean {
	return (
		isRevenueSplit(collection.royalty?.creator_address) &&
		!collection.royalty.creator_address.address
	);
}

function payoutReceiverSplitNotDeployed(collection: AdvancedCollection): boolean {
	const payoutReceiver = collection.pricing?.payoutReceivers;
	return payoutReceiver && !isPayoutReceiver(payoutReceiver) ? !payoutReceiver.address : false;
}

function notEnoughLayers(collection: AdvancedCollection): boolean {
	if (!collection.nfts?.length) return false;

	if (isPfpCollection(collection)) {
		for (const nft of collection.nfts) {
			const supply = Number(nft.totalSupply);
			const totalCombinations = calculateTotalCombinations(nft, supply);
			if (totalCombinations < supply) return true;
		}
		return false;
	}
	return false;
}

const commonIssues: Record<string, CollectionIssue> = {
	collectionMetadataMissing: (collection: Collection) => {
		return !collection.ipfsMetadata;
	},
	royaltiesMissing: (collection: AdvancedCollection) => {
		return !collection.royalty;
	},
	royaltyRevenueSplitNotDeployed,
};

const advancedIssues: Record<string, CollectionIssue> = {
	...commonIssues,
	nftsMissing: (collection: AdvancedCollection) => {
		return !collection.nfts?.length;
	},
	necessaryAssetsMissing,
	pricingMissing: (collection: AdvancedCollection) => {
		return !collection.pricing;
	},
	tooManyNfts: (collection: AdvancedCollection) => {
		return collection.nfts.some((nft) => Number(nft.totalSupply) > 15000);
	},
	notEnoughLayers,
	payoutReceiverSplitNotDeployed,
	revealDateMalformed: (collection: AdvancedCollection) => {
		if (collection.reveal) {
			const date = new Date(collection.reveal.revealValue);
			if (date.toString() === 'Invalid Date') return true;
			else if (date.getTime() < Date.now()) return true;
			else if (!date) return true;
		}
	},
};

const simpleIssues: Record<string, CollectionIssue> = {
	...commonIssues,
	editionsMissing: (collection: SimpleCollection) => {
		return !collection.editions.length;
	},
	payoutReceiverSplitNotDeployed: (collection: SimpleCollection) => {
		return collection.payoutAddress && typeof collection.payoutAddress !== 'string'
			? !collection.payoutAddress.address
			: false;
	},
};

const issuesText: CollectionIssuesText = {
	collectionMetadataMissing: 'Contract-level metadata is missing.',
	necessaryAssetsMissing: 'Assets need to be pushed to IPFS.',
	editionsMissing: 'Create an edition.',
	nftsMissing: 'Create nfts.',
	tooManyNfts: 'One of your PFPs has a supply over 15k, please reduce it.',
	notEnoughLayers: 'Not enough layers uploaded, or too harsh contraints, to meet supply.',
	payoutReceiverSplitNotDeployed: 'Payout Receivers split is not deployed.',
	pricingMissing: 'Pricing is missing.',
	revealDateMalformed: 'Reveal date is either in the past or malformed.',
	royaltiesMissing: 'Royalties are missing, you can set it to 0, but it must be set.',
	royaltyRevenueSplitNotDeployed: 'Roylties split is not deployed',
};

export function hasCollectionIssues(collection: Collection): boolean {
	const issues = isSimpleCollection(collection) ? simpleIssues : advancedIssues;
	return Object.values(issues).some((issue) => issue(collection));
}

export function getCollectionIssues(collection: Collection): string[] {
	const issues = isSimpleCollection(collection) ? simpleIssues : advancedIssues;
	const collectionIssues = Object.keys(issues).filter((issue) => issues[issue](collection));
	return collectionIssues.map((issue) => issuesText[issue]);
}

export async function pushMetadataFilesToIpfs(collection: Collection) {
	const files = getNftMetadataFiles(collection);

	try {
		const response = await pinFileToIpfs(files);
		return await Promise.resolve(response);
	} catch (error) {
		return Promise.reject(error);
	}
}

export async function setRoyaltiesFromCollection(collection: Collection) {
	const royaltyItem = collection.royalty;
	if (!royaltyItem) {
		return Promise.reject('No royalties set');
	}

	const nftContractAddress = getNftContractAddress(collection);

	console.info('royalty params', {
		platform: 'daolabs',
		contractAddress: nftContractAddress,
		creator: royaltyItem.creator_address,
		royalty: royaltyItem.royalty,
	});

	let royaltyReciverAddress: string;
	if (isRevenueSplit(royaltyItem.creator_address)) {
		if (royaltyItem.creator_address.address) {
			royaltyReciverAddress = royaltyItem.creator_address.address;
		} else {
			return Promise.reject('Royalty address is not deployed');
		}
	} else {
		royaltyReciverAddress = royaltyItem.creator_address;
	}

	try {
		await wrapperSetRoyalties(
			'daolabs',
			nftContractAddress,
			royaltyReciverAddress,
			BigNumber.from(royaltyItem.royalty),
		);
		return await Promise.resolve(console.log('setRoyalties', collection.royalty));
	} catch (error) {
		console.warn('setRoyalties error:', error);
		return Promise.reject(error);
	}
}

export async function setPayoutReceiverFromCollection(collection: Collection) {
	let payoutReceiver: string | PayoutReceiver | RevenueSplit;

	if (isAdvancedCollection(collection)) {
		payoutReceiver = collection.pricing.payoutReceivers;
	} else if (isSimpleCollection(collection)) {
		payoutReceiver = collection.payoutAddress || collection.creator;
	} else {
		throw Error('Collection type not supported');
	}

	let address: string;
	const nftContractAddress = getNftContractAddress(collection);

	if (typeof payoutReceiver === 'string') {
		address = payoutReceiver;
	} else {
		address = payoutReceiver.address;
	}

	console.info('payout params', {
		platform: 'daolabs',
		contractAddress: nftContractAddress,
		address,
	});

	try {
		await setPayoutReceiver('daolabs', nftContractAddress, address);
		return await Promise.resolve(console.log('setPayoutReceiver', payoutReceiver));
	} catch (error) {
		console.warn('setRoyalties error:', error);
		return Promise.reject(error);
	}
}

export async function deployNftFromCollection(collection: Collection): Promise<Contract> {
	const owner = connectedAccount.get();
	const name = collection.name;
	const symbol = collection.symbol;

	let price: unknown;
	let maxSupply: number;

	if (!collection.contracts?.nft?.ipfs) {
		console.error('No IPFS metadata found for NFT');
		return;
	}
	if (!collection.ipfsMetadata) {
		console.error('No IPFS metadata found for contract-level metadata');
		return;
	}

	const contractUri = `ipfs://${collection.ipfsMetadata.IpfsHash}`;
	let baseUri = `ipfs://${collection.contracts.nft.ipfs.IpfsHash}/`;

	if (isSimpleCollection(collection)) {
		price = 0; // NOTE: we set 0 here as we set price on each edition, should check implications
		maxSupply = collection.totalSupply;
	} else if (isAdvancedCollection(collection)) {
		price = collection.pricing.price;
		maxSupply = getSumNftTotalSupply(collection);
		if (collection.reveal) {
			if (collection.reveal.preRevealImage) {
				const cid = cidFromUrl(collection.reveal.preRevealImage);
				baseUri = `ipfs://${cid}`;
			} else {
				const cid = cidFromUrl(collection.defaultImage);
				baseUri = `ipfs://${cid}`;
			}
		}
		if (!price) {
			console.warn('No pricing found for collection. This shouldnt happen.');
			return Promise.reject(new Error('No pricing found for collection. This shouldnt happen.'));
		}
	}

	const unitPrice = utils.parseEther(price.toString());
	const mintAllowance = 10;
	// TODO: where do we set the mint period?
	// const mintPeriodStart = 0;
	// const mintPeriodEnd = 0;

	const deploymentArgs = {
		platform: 'daolabs',
		owner,
		name,
		symbol,
		baseUri,
		contractUri,
		maxSupply,
		unitPrice,
		mintAllowance,
	};

	const opts = { gasLimit: 10000000 };
	console.log('deployNftFromCollection args', deploymentArgs, opts);

	try {
		let response: ContractTransaction | PopulatedTransaction;

		if (isSimpleCollection(collection)) {
			const args = Object.values({ ...deploymentArgs, opts }) as Parameters<
				typeof deployNFUEdition
			>;
			response = await deployNFUEdition(...args);
		} else {
			const nftArgs = Object.values({
				...deploymentArgs,
				// Reveal immediately if no reveal data is present
				reveal: !(collection as AdvancedCollection).reveal,
				opts,
			}) as Parameters<typeof deployNFToken>;
			response = await deployNFToken(...nftArgs);
		}

		const receipt = await response.wait();
		console.info('🧾 deployNftFromCollection receipt', receipt);
		const [contractType, contractAddress] = receipt.events.filter(
			(e) => e.event === 'Deployment',
		)[0].args;
		console.info('✅ deployNftFromCollection contractType, contractAddress', {
			contractType: contractType as string,
			contractAddress: contractAddress as string,
		});

		// TODO: This is where we trigger the firebase function to update the base uri for reveal

		return {
			address: contractAddress as string,
			creator: owner,
			name: contractType as string,
			ipfs: collection.contracts.nft.ipfs,
		};
	} catch (error) {
		console.log(error);
		return Promise.reject(error);
	}
}

export async function registerEditionForCollection(
	collection: SimpleCollection,
	edition: EditionConfig,
) {
	const contractAddress = getNftContractAddress(collection);
	const supply = edition.totalSupply;
	const price = utils.parseEther(edition.price.toString());
	return registerEdition('daolabs', contractAddress, supply, price, {
		gasLimit: 10000000,
	});
}

export async function registerEditionsForCollection(collection: SimpleCollection) {
	try {
		for (const edition of collection.editions) {
			await registerEditionForCollection(collection, edition);
		}
		return 'registered editions';
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function grantDAOLabsRevealRoleForCollection(collection: AdvancedCollection) {
	const contractAddress = getNftContractAddress(collection);
	return addRevealer('daolabs', contractAddress, revealerAddress, {
		gasLimit: 10000000,
	});
}

//================== Chained deployment steps for timeline component ===================//

const commonSteps = [
	{
		label: 'Push metadata to IPFS',
		descriptionIcon: 'ipfs',
		description: 'Creates and pins the metadata files to IPFS',
		// TODO: calculate depending on number of files
		time: '1-2 minutes',
	},
	{
		label: 'Deploying NFT contract',
		description: 'Open MetaMask and confirm the transaction',
		descriptionIcon: 'metamask',
		time: '1-2 minutes',
	},
	{
		label: 'Set payout receiver',
		description: 'Sets the receiver of the initial sale proceeds',
		descriptionIcon: 'metamask',
		time: '1 minutes',
	},
	{
		label: 'Set royalties',
		description: 'Sets the royalties',
		descriptionIcon: 'metamask',
		time: '1-2 minutes',
	},
];

type Step = (typeof commonSteps)[0];
type Action = () => Promise<void>;
type ActionMap = { [key: number]: Action };
type Pipeline = {
	steps: Step[];
	actions: ActionMap;
};

function getCommonActions(
	collection: Collection,
	updateCollection: (collection: Collection) => Promise<unknown>,
) {
	async function pushToIpfs() {
		try {
			const ipfsResponse = await pushMetadataFilesToIpfs(collection);
			collection.contracts = { ...initialCollectionContracts };
			collection.contracts.nft.ipfs = ipfsResponse;
		} catch (error) {
			console.warn(error);
			return Promise.reject('Error pushing metadata to IPFS.');
		}
		return updateCollection(collection);
	}

	async function deployNft() {
		let nftContractData: Contract;
		try {
			nftContractData = await deployNftFromCollection(collection);
			collection.contracts.nft = nftContractData;
		} catch (error) {
			console.warn(error);
			return Promise.reject('Error deploying NFT contract.');
		}
		return updateCollection(collection);
	}

	const actions = {
		pushToIpfs,
		deployNft,
		setPayoutReceiver: async () => setPayoutReceiverFromCollection(collection),
		setRoyalties: async () => setRoyaltiesFromCollection(collection),
	};

	return actions;
}

function convertToNumberedActions(actions: ActionMap) {
	// eslint-disable-next-line
	return Object.entries(actions).reduce((acc, [_, value], index) => {
		acc[index] = value;
		return acc;
	}, {} as ActionMap);
}

function getSimpleDeploymentPipeline(
	collection: SimpleCollection,
	updateCollection: (collection: Collection) => Promise<unknown>,
): Pipeline {
	const commonActions = getCommonActions(collection, updateCollection);
	const actions = {
		...commonActions,
		registerEdition: async () => registerEditionsForCollection(collection),
	};
	const steps = [
		...commonSteps,
		{
			label: 'Register editions',
			descriptionIcon: 'info',
			description: 'Each edition has to be registered separately for collection',
			time: '1 min',
		},
	];
	const numberedActions = convertToNumberedActions(actions);
	return { steps, actions: numberedActions };
}

function getAdvancedDeploymentPipeline(
	collection: AdvancedCollection,
	updateCollection: (collection: Collection) => Promise<unknown>,
): Pipeline {
	const commonActions = getCommonActions(collection, updateCollection);

	if (collection.reveal) {
		const actions = {
			...commonActions,
			grantRevealRole: async () => grantDAOLabsRevealRoleForCollection(collection),
			scheduleReveal: async () => scheduleRevealForCollection(collection),
		};
		const steps = [
			...commonSteps,
			{
				label: 'Grant reveal role',
				descriptionIcon: 'metamask',
				description: 'Grant us permissions to reveal your NFT',
				time: '30 sec',
			},
			{
				label: 'Schedule reveal',
				descriptionIcon: 'info',
				description: 'Schedule reveal for the date or block you specified',
				time: '20 sec',
			},
		];
		const numberedActions = convertToNumberedActions(actions);
		return { steps, actions: numberedActions };
	}
	return { steps: commonSteps, actions: convertToNumberedActions(commonActions) };
}

export function getDeploymentPipelineForCollection(
	collection: Collection,
	updateCollection: (collection: Collection) => Promise<unknown>,
): Pipeline {
	if (isAdvancedCollection(collection)) {
		return getAdvancedDeploymentPipeline(collection, updateCollection);
	} else if (isSimpleCollection(collection)) {
		return getSimpleDeploymentPipeline(collection, updateCollection);
	}
	throw Error('Collection type not supported');
}
