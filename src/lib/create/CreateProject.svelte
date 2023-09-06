<script lang="ts">
	import { ethers, constants, BigNumber } from 'ethers';
	import { setContext } from 'svelte';
	import { MAX_DISTRIBUTION_LIMIT, redemptionRateFrom } from '$utils/v2/math';
	import Store from '$utils/Store';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import { chainId, connectedAccount, web3Connect, readNetwork } from '$stores/web3';
	import { uploadProjectDocuments, uploadProjectMetadata } from '$utils/ipfs';
	import { getDefaultBallotStrategy } from '$constants/v2/ballotStrategies';
	import { launchProjectFor } from '$utils/web3/JBControllerWrapper';
	import { JUICEBOX_MONEY_METADATA_DOMAIN } from '$constants/v2/metadataDomain';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import BannerNotice from '$lib/components/BannerNotice.svelte';
	import { ETH_TOKEN_ADDRESS } from '$constants/v2/juiceboxTokens';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import {
		projectCreationOptions,
		fundingCycleOptions,
		reviewAndDeployOptions,
	} from '$utils/introjs/options';
	import { startIntroTour } from '$utils/introjs/intro-js';
	import Trans from '$lib/components/Trans.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import Radio from '$lib/components/Radio.svelte';
	import { contracts } from '$utils/web3/contractMap';
	import { getDefaultConfettiOptions, throwConfetti } from '$lib/utils/confetti';
	import { projectPlatformWithVersion } from '$constants/platform';
	import { deepCopy } from '$utils/object';
	import { web3Transact } from '$lib/transaction';
	import { checkTwitterVerified } from '$utils/firebase';
	import { defaultNftCollectionDescription, defaultNftCollectionName } from '$utils/nftRewards';
	import { goto } from '$app/navigation';
	import FinalPreview from './FinalPreview.svelte';
	import ProjectDetails from './ProjectDetails.svelte';
	import Preview from './Preview';
	import FundingCycle from './FundingCycle';
	import { Tab, Tabs, TabList, TabPanel } from './Tabs';
	import { deployNftProject } from './createHelper';
	import LegalDocuments from './LegalDocuments.svelte';

	import type { V2ProjectContextType } from '$models/project-type';
	import type {
		JBProjectMetadata,
		JBFundingCycleData,
		JBFundingCycleMetadata,
		JBGroupedSplits,
		JBFundAccessConstraints,
		JBSplit,
	} from '$utils/web3/types';

	const project = new Store<V2ProjectContextType>();

	const fundingCycleMetadata = {
		global: {
			allowSetTerminals: false,
			allowSetController: false,
			pauseTransfers: false,
		},
		reservedRate: BigNumber.from(0), // A number from 0-10,000
		redemptionRate: redemptionRateFrom('100'), // A number from 0-10,000
		ballotRedemptionRate: redemptionRateFrom('100'), // A number from 0-10,000
		pausePay: false,
		pauseDistributions: false,
		pauseRedeem: false,
		allowMinting: false,
		pauseBurn: false,
		allowChangeToken: false,
		allowTerminalMigration: false,
		allowControllerMigration: false,
		holdFees: false,
		preferClaimedTokenOverride: false,
		useTotalOverflowForRedemptions: false,
		useDataSourceForPay: false,
		useDataSourceForRedeem: false,
		dataSource: constants.AddressZero,
		metadata: 0,
	};
	const fundingCycle = {
		duration: BigNumber.from(0),
		weight: BigNumber.from('0xd3c21bcecceda1000000'),
		discountRate: BigNumber.from(0),
		// TODO ballot, look at hooks/v2/V2ContractLoader.ts for more info
		// ballot: contracts?.JBETHPaymentTerminal.address ?? '', // hex, contract address
		ballot: getDefaultBallotStrategy().address,

		number: BigNumber.from(1),
		configuration: BigNumber.from(0),
		basedOn: BigNumber.from(0),
		start: BigNumber.from(Date.now()).div(1000),
		metadata: BigNumber.from(0),
	};
	// Populate project with default data
	// TODO: fix the type...
	chainId.subscribe(() => {
		project.set({
			platform: 'daolabs',
			version: '3',
			projectId: undefined,
			isPreviewMode: false,
			handle: '',
			projectMetadata: {
				version: 6,
				name: '',
				description: '',
				infoUri: '',
				logoUri: '',
				twitter: '',
				discord: '',
				telegram: '',
				tokens: [],
				payButton: 'Pay',
				payDisclosure: '',
			},
			fundingCycle: deepCopy(fundingCycle),
			fundingCycleMetadata: deepCopy(fundingCycleMetadata),

			queuedFundingCycle: deepCopy(fundingCycle),
			queuedFundingCycleMetadata: deepCopy(fundingCycleMetadata),

			payoutSplits: [],
			reservedTokensSplits: [],
			distributionLimit: BigNumber.from(0),
			distributionLimitCurrency: BigNumber.from(V2_CURRENCY_ETH),

			tokenAddress: undefined,
			tokenSymbol: undefined,
			primaryTerminal: undefined,
			ETHBalance: undefined,
			projectOwnerAddress: undefined,
			balanceInDistributionLimitCurrency: undefined,
			usedDistributionLimit: undefined,
			ballotState: undefined,
			primaryTerminalCurrentOverflow: undefined,
			totalTokenSupply: undefined,
			loading: undefined,
			terminals: [],
			createdAt: undefined,
			totalVolume: undefined,
			tokenWhitelist: [],
			vests: [],

			events: undefined,
			nftRewardTiers: {
				rewardTiers: [],
				CIDs: [],
				collectionMetadata: {
					name: '',
					symbol: '',
					description: '',
					uri: '',
				},
			},
			confetti: getDefaultConfettiOptions(),
			documents: [],
		});
	});

	$: {
		const defaultTier = {
			name: `${$project.projectMetadata.name} Base Membership`,
			description: defaultNftCollectionDescription($project.projectMetadata.name),
			externalLink: $project.projectMetadata.infoUri,
			imageUrl:
				$project.projectMetadata.logoUri ||
				'https://juicebox.mypinata.cloud/ipfs/bafkreiezbzhcjjtsx4xqgnwffe2o6gdk54fjhrf52c25jpof4oi2juwwje',
			contributionFloor: 1e-4,
			remainingSupply: 1e8,
			maxSupply: 1e8,
			default: true,
		};
		if ($project.nftRewardTiers.rewardTiers.find((tier) => tier.default)) {
			$project.nftRewardTiers.rewardTiers = $project.nftRewardTiers.rewardTiers.map((tier) =>
				tier.default ? defaultTier : tier,
			);
		} else {
			$project.nftRewardTiers.rewardTiers = [defaultTier, ...$project.nftRewardTiers.rewardTiers];
		}

		if (!$project.nftRewardTiers.collectionMetadata.symbol && $project.projectMetadata.name) {
			$project.nftRewardTiers.collectionMetadata.symbol = (
				$project.projectMetadata.name.match(/[a-zA-Z]+/g) ?? []
			)
				.join('')
				.toUpperCase()
				.slice(0, 4)
				.padEnd(3, String.fromCharCode(65 + Math.floor(Math.random() * 26)));
		}
	}

	let deploying = false;
	let currentTab = 'details';

	setContext('PROJECT', project);

	function setTab(tabId: string) {
		currentTab = tabId;
	}

	function onClick(tabId: string) {
		document.getElementById(tabId).click();
		currentTab = tabId;
		window.scrollTo(0, 0);
	}

	const DEFAULT_MUST_START_AT_OR_AFTER = '0x01';
	const DEFAULT_MEMO = '';

	$: twitterSignedAndVerified = !!checkTwitterVerified(
		$project.projectMetadata.twitter,
		$project.projectMetadata.twitterSignature,
	);

	async function deployProject() {
		console.log('Start serializing');
		console.log('projectMetadata', $project.projectMetadata);
		console.log('documents', $project.documents);
		console.log('fundingCycle', $project.queuedFundingCycle);
		console.log('fundingCycleMetadata', $project.queuedFundingCycleMetadata);
		console.log('payoutSplits', $project.payoutSplits);
		console.log('reservedTokensSplits', $project.reservedTokensSplits);
		deploying = true;
		console.log('LOGO:', $project.projectMetadata.logoUri);

		if (!$project.nftRewardTiers.collectionMetadata.name) {
			$project.nftRewardTiers.collectionMetadata.name = defaultNftCollectionName(
				$project.projectMetadata.name,
			);
		}

		if (!$project.nftRewardTiers.collectionMetadata.description) {
			$project.nftRewardTiers.collectionMetadata.description = defaultNftCollectionDescription(
				$project.projectMetadata.name,
			);
		}

		if (!$project.nftRewardTiers.collectionMetadata.uri) {
			$project.nftRewardTiers.collectionMetadata.uri = $project.projectMetadata.infoUri;
		}

		if (!$project.projectMetadata.twitter) {
			$project.projectMetadata.twitterSignature = '';
		}

		const uploadedDocuments = await uploadProjectDocuments($project.documents);
		console.log('uploadedDocuments', uploadedDocuments);
		if (!uploadedDocuments) {
			deploying = false;
			return;
		}

		const uploadedMetadata = await uploadProjectMetadata(
			{
				...$project.projectMetadata,
				twitterSignature: twitterSignedAndVerified
					? $project.projectMetadata.twitterSignature
					: undefined,
				confetti: $project.confetti,
				documents: uploadedDocuments,
			},
			$project.projectMetadata.name.toLowerCase().replace(/[^\w]+/g, '_'),
		);
		console.log('uploadedMetadata', uploadedMetadata);
		if (!uploadedMetadata.IpfsHash) {
			deploying = false;
			return;
		}

		const { payoutSplits } = $project;
		const { reservedTokensSplits } = $project;

		const projectOwner: string = $connectedAccount;
		const projectMetadata: JBProjectMetadata = {
			content: uploadedMetadata.IpfsHash,
			domain: JUICEBOX_MONEY_METADATA_DOMAIN,
		};
		const projectFundingCycleData: JBFundingCycleData = {
			duration: $project.queuedFundingCycle.duration,
			weight: $project.queuedFundingCycle.weight,
			discountRate: $project.queuedFundingCycle.discountRate,
			ballot: $project.queuedFundingCycle.ballot,
		};
		const projectFundingCycleMetadata: JBFundingCycleMetadata =
			$project.queuedFundingCycleMetadata as JBFundingCycleMetadata;
		const projectStartTime = DEFAULT_MUST_START_AT_OR_AFTER;
		const projectGroupedSplits: JBGroupedSplits[] = [
			{
				group: 1,
				splits: payoutSplits as JBSplit[],
			},
			{
				group: 2,
				splits: reservedTokensSplits as JBSplit[],
			},
		];
		const JBETHPaymentTerminal: { address: string } = await contracts[
			projectPlatformWithVersion($project.platform, '3')
		][$readNetwork.alias].JBETHPaymentTerminal();
		const projectFundAccessConstraints: JBFundAccessConstraints[] = [
			{
				terminal: JBETHPaymentTerminal.address, // address probably
				token: ETH_TOKEN_ADDRESS,
				distributionLimit: $project.distributionLimit ?? BigNumber.from(MAX_DISTRIBUTION_LIMIT),
				distributionLimitCurrency:
					$project.distributionLimitCurrency ?? BigNumber.from(V2_CURRENCY_ETH),
				overflowAllowance: 0,
				overflowAllowanceCurrency: 0,
			},
		];
		const projectTerminals = [JBETHPaymentTerminal.address];
		const projectMemo = DEFAULT_MEMO;
		const { rewardTiers, collectionMetadata } = $project.nftRewardTiers || { rewardTiers: [] };

		console.log(
			'Deploying with arguments',
			projectOwner,
			projectMetadata,
			projectFundingCycleData,
			projectFundingCycleMetadata,
			projectStartTime,
			projectGroupedSplits,
			projectFundAccessConstraints,
			projectTerminals,
			projectMemo,
		);

		try {
			let txnResponse: ethers.ContractTransaction;
			let hasNftRewards = !!rewardTiers.length;
			if (hasNftRewards) {
				if (!collectionMetadata || !('name' in collectionMetadata))
					return Error('malformed collectionMetadata');
				txnResponse = await deployNftProject(
					projectPlatformWithVersion($project.platform, '3'),
					projectOwner,
					{
						projectMetadata,
						data: projectFundingCycleData,
						metadata: projectFundingCycleMetadata,
						mustStartAtOrAfter: BigNumber.from(projectStartTime),
						groupedSplits: projectGroupedSplits,
						fundAccessConstraints: projectFundAccessConstraints,
						terminals: projectTerminals,
						memo: projectMemo,
					},
					{
						projectName: $project.projectMetadata.name,
						logoUri: $project.projectMetadata.logoUri,
						infoUri: $project.projectMetadata.infoUri,
						collectionName: collectionMetadata.name,
						collectionSymbol: collectionMetadata.symbol,
						collectionDescription: collectionMetadata.description,
						rewardTiers,
					},
				);
			} else {
				txnResponse = await web3Transact(
					'launchProjectFor',
					launchProjectFor,
					projectPlatformWithVersion($project.platform, '3'),
					projectOwner,
					projectMetadata,
					projectFundingCycleData,
					projectFundingCycleMetadata,
					projectStartTime,
					projectGroupedSplits,
					projectFundAccessConstraints,
					projectTerminals,
					projectMemo,
				);
			}
			openModal(
				bind(PendingTransaction, {
					txnResponse,
					functionName: 'launchProjectFor',
					close: () => {},
				}),
			);
			console.log('Pending txn:', txnResponse.hash);
			const txn = await txnResponse.wait();

			const eventAbi = [
				'event LaunchProject (uint256 configuration, uint256 projectId, string memo, address caller)',
			];
			const iface = new ethers.utils.Interface(eventAbi);

			const event = iface.parseLog(txn.logs[txn.logs.length - 1]);
			const projectId = event.args[1] as BigNumber;

			console.log('Created project [ID]:', projectId.toNumber());

			await throwConfetti();
			// Go to projects page
			await goto(`/projects/${$project.platform}/${projectId.toString()}?newDeploy=true`);
		} catch (error) {
			console.error('failed to deploy project');
			console.error(error);
			deploying = false;
		}

		deploying = false;
	}

	let nextStepDisabled = true;
	function setNextStepDisabled(disabled: boolean) {
		nextStepDisabled = disabled;
	}

	const handleStartIntroTour = () => {
		document.cookie = 'introjs-dontShowAgain=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
		if (currentTab === 'details') startIntroTour(projectCreationOptions);
		if (currentTab === 'funding') startIntroTour(fundingCycleOptions);
		if (currentTab === 'review') startIntroTour(reviewAndDeployOptions);
	};

	let deployDisabled = true;
	$: deployDisabled = !$project.projectMetadata.name || deploying;
</script>

<BannerNotice>
	<span>
		<Icon name="exclamationCircle" />YOU AGREE THAT YOU HAVE READ ALL OF THE DAO'S
		<a href="/disclaimers" target="_blank">DISCLAIMERS</a> and
		<a href="/terms-of-service" target="_blank">TERMS OF SERVICES</a>.
	</span>
</BannerNotice>

<div id="create">
	<h1>Design your treasury 🏦</h1>
	<Tabs>
		<TabList>
			<Tab id="details" onClick={setTab}>1. Treasury details</Tab>
			<Tab id="funding" disabled={nextStepDisabled} onClick={setTab}>2. Funding cycle</Tab>
			<Tab id="legal" disabled={nextStepDisabled} onClick={setTab}>3. Document templates</Tab>
			<Tab id="review" disabled={nextStepDisabled} onClick={setTab}>4. Review and deploy</Tab>
		</TabList>
		<div on:click={handleStartIntroTour} on:keydown class="life-preserver">
			<Icon name="lifePreserver" style="width: 1rem; height: 1rem;" />
		</div>
		<div class="row">
			{#if currentTab === 'review'}
				<main>
					<FinalPreview />
					<div class="select-platform">
						<h4>
							<Trans>Select Platform</Trans>
							<Popover placement="right" message="Select which platform to deploy this project to.">
								<Icon name="questionCircle" />
							</Popover>
						</h4>
						<div class="platforms">
							<div class="platform">
								<Radio name="daolabs" bind:group={$project.platform} value="daolabs" />
								<span>MOVEMENT/DAOLABS</span>
							</div>
							<div class="platform">
								<Radio name="juicebox" bind:group={$project.platform} value="juicebox" />
								<span>JUICEBOX</span>
							</div>
						</div>
					</div>
					<br />
					<span id="deploy">
						<Button
							disabled={deployDisabled}
							loading={deploying}
							on:click={$connectedAccount ? deployProject : () => web3Connect()}
						>
							{#if $connectedAccount}
								Deploy{#if deploying}ing{/if} project to {$readNetwork.alias}
							{:else}
								Connect wallet to deploy
							{/if}
						</Button>
					</span>
				</main>
			{:else if currentTab === 'legal'}
				<LegalDocuments />
			{:else}
				<section>
					<TabPanel id="details">
						<ProjectDetails
							bind:twitterSignedAndVerified
							setValid={(isValid) => setNextStepDisabled(!isValid)}
						/>
						<span id="next">
							<Button disabled={nextStepDisabled} on:click={() => onClick('funding')}>
								Next: Funding cycle
							</Button>
						</span>
					</TabPanel>
					<TabPanel id="funding">
						<FundingCycle />
						<span id="next">
							<Button on:click={() => onClick('legal')}>Next: Document Templates</Button>
						</span>
					</TabPanel>
				</section>
				<section>
					<Preview />
				</section>
			{/if}
		</div>
	</Tabs>
</div>

<style>
	#create {
		box-sizing: border-box;
		padding: 2rem 4rem;
		margin: 0px auto;
		margin-bottom: 40px;
		background: var(--background-l0);
		max-width: 1300px;
	}

	#next {
		display: inline-block;
	}

	.row {
		margin-top: 1.4rem;
		display: flex;
		max-width: 1300px;
		gap: 40px;
	}

	h1 {
		color: var(--primary-text);
		font-size: 28px;
		font-weight: 400;
		margin-bottom: 14px;
	}
	h4 {
		color: var(--text-header);
	}

	section:first-of-type {
		flex: 0 0 42%;
		max-width: 42%;
	}

	section:last-of-type {
		width: 100%;
		padding-left: 40px;
		border-left: 1px solid rgba(0, 0, 0, 0.094);
	}

	a[href='/disclaimers'],
	a[href='/terms-of-service'] {
		font-weight: 900;
	}

	.life-preserver {
		display: flex;
		flex-direction: row-reverse;
		height: 1.5rem;
		margin-top: 0.5rem;
		color: var(--text-action-primary);
	}

	div.select-platform {
		/* display: flex; */
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: space-between;
		max-width: 200px;
	}
	.platforms {
		display: flex;
		gap: 1rem;
	}
	.platform {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 850px) {
		#create {
			padding: 40px 20px 80px;
		}
		.row {
			flex-flow: row wrap;
		}
		section:first-of-type,
		section:last-of-type {
			flex: 0 0 100%;
			max-width: 100%;
			margin-right: 0;
		}

		section:last-of-type {
			border-left: none;
			padding-left: 0;
		}
	}
</style>
