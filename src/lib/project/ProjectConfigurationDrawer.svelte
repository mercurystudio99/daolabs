<script lang="ts" context="module">
	export enum Drawers {
		Metadata = 'Metadata',
		Funding = 'Funding',
		Token = 'Token',
		Extensions = 'Extensions',
		Rules = 'Rules',
		Handle = 'Handle',
	}
</script>

<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte';
	import { BigNumber } from 'ethers';
	import { DistributionLimitType } from '$constants';
	import Button from '$lib/components/Button.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import Icon from '$lib/components/Icon';
	import Money from '$lib/components/Money.svelte';
	import Trans from '$lib/components/Trans.svelte';
	// TODO move these files to common area
	import FundingDrawer from '$lib/create/FundingCycle/FundingDrawer.svelte';
	import TokenDrawer from '$lib/create/FundingCycle/TokenDrawer';
	import ProjectDetails from '$lib/create/ProjectDetails.svelte';
	import RulesDrawer from '$lib/create/RulesDrawer.svelte';
	import { getDistributionLimitType } from '$utils/v2/distributions';
	import { getFundingCycleDetails, type FundingCycleDetail } from '$utils/v2/fundingCycle';
	import { MAX_DISTRIBUTION_LIMIT } from '$utils/v2/math';

	import Popover from '$lib/components/Popover.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { PROJECT_PAY_CHARACTER_LIMIT } from '$constants/numbers';
	import { uploadProjectMetadata } from '$utils/ipfs';
	import { JUICEBOX_MONEY_METADATA_DOMAIN } from '$constants/v2/metadataDomain';
	import { readNetwork } from '$stores/web3';
	import { ETH_TOKEN_ADDRESS } from '$constants/v2/juiceboxTokens';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { ballotStrategies } from '$constants/v2/ballotStrategies';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import DrawerTabs from '$lib/components/DrawerTabs.svelte';
	import SimpleSplits from '$lib/components/SimpleSplits.svelte';
	import ProjectHandleDrawer from '$lib/create/ProjectHandleDrawer.svelte';
	import { reconfigureFundingCyclesOf } from '$utils/web3/JBControllerWrapper';
	import { setMetadataOf } from '$utils/web3/JBProjects';
	import { contracts } from '$utils/web3/contractMap';
	import { getProjectPlatform } from '$lib/projects/data';
	import ExtensionsDrawer from '$lib/create/ExtensionsDrawer.svelte';
	import { web3Transact } from '$lib/transaction';
	import { checkTwitterVerified } from '$utils/firebase';
	import { browser } from '$app/environment';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');
	// const reloadProject = getContext<Function>('RELOAD_PROJECT');

	const deployInProgress = false;
	let drawerContent: HTMLElement;

	export let current: Drawers;
	export let drawerOpen = false;
	export let close: () => void;
	let subModal: any = false;

	const hiddenFCDetails = ['start', 'end', 'issuanceRate', 'redemptionRate', 'reservedRate'];

	const info =
		'Updates you make to this section will only be applied to <b>upcoming</b> funding cycles.';

	function openModal(component) {
		subModal = component;
	}

	let savingProjectDetails = false;

	$: twitterSignedAndVerified = !!checkTwitterVerified(
		$project.projectMetadata.twitter,
		$project.projectMetadata.twitterSignature,
	);

	async function deployDetails() {
		try {
			savingProjectDetails = true;

			const metadata = $project.projectMetadata;
			metadata['twitterVerified' as string] = undefined;

			if (!$project.projectMetadata.twitter) {
				$project.projectMetadata.twitterSignature = '';
			}

			const uploadedMetadata = await uploadProjectMetadata({
				name: metadata.name,
				description: metadata.description,
				logoUri: metadata.logoUri,
				infoUri: metadata.infoUri,
				twitter: metadata.twitter,
				discord: metadata.discord,
				payDisclosure: metadata.payDisclosure,
				...metadata,
				payButton: metadata.payButton.substring(0, PROJECT_PAY_CHARACTER_LIMIT), // Enforce limit
				confetti: $project.confetti,
				collections: $project.collections,
				documents: $project.documents,
			});
			const cid = uploadedMetadata.IpfsHash;

			console.clear();
			console.log({ cid });

			if (cid) {
				const txnResponse = await web3Transact(
					'setMetadataOf',
					setMetadataOf,
					getProjectPlatform(project),
					$project.projectId,
					cid,
					JUICEBOX_MONEY_METADATA_DOMAIN,
				);

				openModal(
					bind(PendingTransaction, {
						txnResponse,
						functionName: 'setMetadataOf',
						close: () => {},
					}),
				);
				const txnResult = await txnResponse.wait();
				console.log(txnResult);
			}
		} catch (error) {
			console.error(error);
		}
		savingProjectDetails = false;
	}

	const DEFAULT_MUST_START_AT_OR_AFTER = '1';
	const DEFAULT_MEMO = '';

	async function deployProject() {
		const platform = getProjectPlatform(project);
		const contract = await contracts[platform][$readNetwork.alias].JBETHPaymentTerminal();
		const {
			projectId,
			queuedFundingCycle,
			queuedFundingCycleMetadata,
			payoutSplits,
			reservedTokensSplits,
			tokenAddress,
			distributionLimit,
			distributionLimitCurrency,
		} = $project;

		// TODO: log

		const splits = [
			{
				group: 1,
				splits: payoutSplits,
			},
			{
				group: 2,
				splits: reservedTokensSplits,
			},
		];
		//
		type Parameters<T extends Function> = T extends (p, ...args: infer P) => any ? P : never;
		type ArgsType = Parameters<typeof reconfigureFundingCyclesOf>;
		//
		const fundingCyclceData = Object.fromEntries(
			Object.entries(queuedFundingCycle).filter(([key]) => !key.match(/^\d+$/)),
		) as unknown as ArgsType['1'];

		const fundingCyclceMetaData = Object.fromEntries(
			Object.entries(queuedFundingCycleMetadata).filter(([key]) => !key.match(/^\d+$/)),
		) as unknown as ArgsType['2'];

		const args: ArgsType = [
			projectId,
			fundingCyclceData,
			fundingCyclceMetaData,
			BigNumber.from(DEFAULT_MUST_START_AT_OR_AFTER),
			splits,
			[
				{
					terminal: contract.address,
					token: tokenAddress || ETH_TOKEN_ADDRESS,
					distributionLimit: distributionLimit ?? BigNumber.from(MAX_DISTRIBUTION_LIMIT),
					distributionLimitCurrency: distributionLimitCurrency ?? BigNumber.from(V2_CURRENCY_ETH),
					overflowAllowance: BigNumber.from('0'),
					overflowAllowanceCurrency: BigNumber.from('0'),
				},
			],
			DEFAULT_MEMO,
		];

		console.log('Reconfiguring with args:', args);

		const txnResponse = await web3Transact(
			'reconfigureFundingCyclesOf',
			reconfigureFundingCyclesOf,
			platform,
			args[0],
			args[1],
			args[2],
			args[3],
			args[4],
			args[5],
			args[6],
		);

		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'reconfigureFundingCyclesOf',
				close: () => {},
			}),
		);

		await txnResponse.wait();
		close();
		window.location.reload();
	}

	const disableScroll = () => {
		if (browser) {
			document.body.style.overflow = 'hidden';
		}
	};

	const enableScroll = () => {
		if (browser) {
			document.body.style.overflow = '';
		}
	};

	let currentTab = 0;

	onMount(disableScroll);
	onDestroy(enableScroll);

	$: distributionLimitType = getDistributionLimitType($project.distributionLimit);

	let fundingCycleDetails: FundingCycleDetail[];
	$: fundingCycleDetails = getFundingCycleDetails(
		$project.queuedFundingCycle,
		$project.queuedFundingCycleMetadata,
	);

	$: rates = ['issuanceRate', 'redemptionRate', 'reservedRate'].map((rate) =>
		fundingCycleDetails.find((item) => item.id === rate),
	);

	$: configuration = fundingCycleDetails.find((item) => item.id === 'configuration');

	$: ballot = ballotStrategies(readNetwork.get().alias).find((b) => b.name === configuration.value);
</script>

<section>
	<h3><Trans>Project configuration</Trans></h3>
	<DrawerTabs tabs={['Reconfiguration']} bind:currentTab />
	{#if currentTab === 0}
		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box">
				<h4><Trans>Edit project details</Trans></h4>
				<p><Trans>Changes to project details will take effect immediately.</Trans></p>
				<Button
					type="tertiary"
					size="md"
					on:click={() => {
						drawerOpen = true;
						current = Drawers.Handle;
					}}
				>
					<Trans>Project handle</Trans>
				</Button>
				<Button
					type="tertiary"
					size="md"
					on:click={() => {
						drawerOpen = true;
						current = Drawers.Metadata;
					}}
				>
					<Trans>Project details</Trans>
				</Button>
			</div>
		</HeavyBorderBox>
		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box">
				<h4><Trans>Reconfigure upcoming funding cycles</Trans></h4>
				<p>
					<Trans
						>Any changes you make will take effect in funding cycle #2. The current funding cycle
						(#1) won't be altered.</Trans
					>
				</p>
				<Button
					type="tertiary"
					size="md"
					on:click={() => {
						drawerOpen = true;
						current = Drawers.Funding;
					}}
				>
					<Trans>Distribution limit, duration and payouts</Trans>
				</Button>
				<Button
					type="tertiary"
					size="md"
					on:click={() => {
						drawerOpen = true;
						current = Drawers.Token;
					}}
				>
					<Trans>Token</Trans>
				</Button>
				<Button
					type="tertiary"
					size="md"
					on:click={() => {
						drawerOpen = true;
						current = Drawers.Extensions;
					}}
				>
					<Trans>Extensions</Trans>
				</Button>
				<Button
					type="tertiary"
					size="md"
					on:click={() => {
						drawerOpen = true;
						current = Drawers.Rules;
					}}
				>
					<Trans>Rules</Trans>
				</Button>
			</div>
		</HeavyBorderBox>
		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box">
				<h4><Trans>Review</Trans></h4>
				<p>
					<Trans>Review project reconfiguration</Trans>
				</p>
				<div class="details">
					{#each fundingCycleDetails as detail, index}
						{#if index === 1}
							<div class="distribution-limit">
								<h4>
									<Trans>Distribution Limit</Trans>
									<Popover
										placement="right"
										message="The maximum amount of funds allowed to be distributed from the project's treasury each funding cycle."
									>
										<Icon name="questionCircle" />
									</Popover>
								</h4>
								<p>
									<!-- Put Trans back in when figured out how to style the inner div -->
									{#if distributionLimitType === DistributionLimitType.None}
										<!-- <Trans> -->
										Zero
										<!-- </Trans> -->
									{:else if distributionLimitType === DistributionLimitType.Specific}
										<Money
											currency={$project.distributionLimitCurrency ?? BigNumber.from(0)}
											amount={$project.distributionLimit}
										/>
									{:else}
										<!-- <Trans> -->
										Infinite (no limit)
										<!-- </Trans> -->
									{/if}
								</p>
							</div>
						{/if}

						<!--  i can see the value in having the mint rate, contributor rate, reserved token allocation at the bottom after reconfiguration rules -->
						<!-- 0: {id: 'duration', label: 'Duration', value: 'Not set', issue: true, issueText: 'The project owner may reconfigure this funding cycle at any time, without notice.'}
		1: {id: 'discountRate', label: 'Discount rate', value: '0%', info: 'The ratio of tokens rewarded per payment amount wi…upporters to pay your project earlier than later.'}
		2: {id: 'redemptionRate', label: 'Redemption rate', value: '100%', info: 'This rate determines the amount of overflow that e…equal value regardless of when they are redeemed.'}
		3: {id: 'reservedRate', label: 'Reserved tokens', value: '0%', info: 'Whenever someone pays your project, this percentag…ich distributes them to their intended receivers.', issue: false, …}
		4: {id: 'issuanceRate', label: 'Issuance rate', value: '1,000,000 tokens/ETH', info: 'Tokens received per ETH paid to the treasury. This… reserved tokens amount of future funding cycles.'}
		5: {id: 'payments', label: 'Payments', value: 'Enabled'}
		6: {id: 'allowMinting', label: 'Token minting', value: 'Disabled', issue: false, issueText: 'The project owner may mint any supply of tokens at…ing the token share of all existing contributors.', …}
		7: {id: 'configuration', label: 'Reconfiguration strategy', value: '3-day delay', info:  -->

						{#if !hiddenFCDetails.includes(detail.id)}
							<div class="info-item" class:full={detail.id === 'configuration'}>
								{#if detail.info}
									<h4>
										<Trans>{detail.label}</Trans>
										<Popover
											placement="right"
											message="The maximum amount of funds allowed to be distributed from the project's treasury each funding cycle."
										>
											<Icon name="questionCircle" />
										</Popover>
									</h4>
								{:else}
									<h4><Trans>{detail.label}</Trans></h4>
								{/if}
								<p>{detail.value}</p>
								{#if detail.issue}
									<span>
										<Popover message={detail.issueText} placement="right">
											<Icon name="exclamationCircle" />
										</Popover>
									</span>
								{/if}
								{#if detail.id === 'configuration'}
									<div class="address">
										<p>{ballot.address}</p>
									</div>
								{/if}
							</div>
						{/if}
					{/each}
					<div class="rates full">
						{#each rates as rate}
							<div class="info-item">
								{#if rate.info}
									<h4>
										<Trans>{rate.label}</Trans>
										<Popover
											placement="right"
											message="The maximum amount of funds allowed to be distributed from the project's treasury each funding cycle."
										>
											<Icon name="questionCircle" />
										</Popover>
									</h4>
								{:else}
									<h4><Trans>{rate.label}</Trans></h4>
								{/if}
								<p>{rate.value}</p>
								{#if rate.issue}
									<span>
										<Popover message={rate.issueText} placement="right">
											<Icon name="exclamationCircle" />
										</Popover>
									</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
				<div class="splits">
					{#if $project.payoutSplits.length}
						<div class="split-item">
							<h4>
								<Trans>Distribution splits</Trans>
								<Popover
									placement="right"
									message="The maximum amount of funds allowed to be distributed from the project's treasury each funding cycle."
								>
									<Icon name="questionCircle" />
								</Popover>
							</h4>
							{#each $project.payoutSplits as split}
								<SimpleSplits
									crown={$project.projectOwnerAddress?.toLowerCase() ===
										split.beneficiary?.toLowerCase()}
									{split}
									{distributionLimitType}
									distributionLimit={$project.distributionLimit}
									currency={$project.distributionLimitCurrency}
								/>
							{/each}
						</div>
					{/if}
					{#if $project.reservedTokensSplits?.length}
						<div class="split-item">
							<h4>
								<Trans>Reserved token allocation</Trans>
								<Popover
									placement="right"
									message="The maximum amount of funds allowed to be distributed from the project's treasury each funding cycle."
								>
									<Icon name="questionCircle" />
								</Popover>
							</h4>
							{#each $project.reservedTokensSplits as split}
								<SimpleSplits
									crown={$project.projectOwnerAddress?.toLowerCase() ===
										split.beneficiary?.toLowerCase()}
									{split}
									{distributionLimitType}
									distributionLimit={$project.distributionLimit}
									currency={$project.distributionLimitCurrency}
								/>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</HeavyBorderBox>
	{/if}
	<div bind:this={drawerContent}>
		<Button size="md" fullWidthMobile={true} type="secondary" on:click={close}>Cancel</Button>
		<Button size="md" fullWidthMobile={true} on:click={deployProject}>
			Deploy {currentTab === 0 ? 'funding cycle' : 'tokens'} configuration
			{#if deployInProgress}
				<Icon name="loading" spin />
			{/if}
		</Button>
	</div>
</section>

<Drawer bind:shown={drawerOpen} disableBodyScroll={false}>
	<div class="content">
		{#if current === Drawers.Metadata}
			<h3>Reconfigure project details</h3>
			<ProjectDetails
				bind:twitterSignedAndVerified
				setValid={() => {}}
				info={'Project details reconfigurations will create a separate transaction.'}
			/>
			<Button size="md" on:click={deployDetails} disabled={savingProjectDetails}>
				{savingProjectDetails ? '...' : 'Save project details'}
			</Button>
		{:else if current === Drawers.Funding}
			<FundingDrawer
				close={() => {
					drawerContent.scrollIntoView();
					drawerOpen = false;
				}}
				{openModal}
			>
				<header slot="header">
					<h3>Reconfigure funding</h3>
					<p>
						<Trans>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html info}
						</Trans>
					</p>
				</header>
			</FundingDrawer>
		{:else if current === Drawers.Extensions}
			<ExtensionsDrawer
				close={() => {
					drawerContent.scrollIntoView();
					close();
				}}
			>
				<header slot="header">
					<h3>Reconfigure extensions</h3>
				</header>
			</ExtensionsDrawer>
		{:else if current === Drawers.Rules}
			<RulesDrawer
				close={() => {
					drawerContent.scrollIntoView();
					drawerOpen = false;
				}}
			>
				<header slot="header">
					<h3>Reconfigure rules</h3>
					<p>
						<Trans>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html info}
						</Trans>
					</p>
				</header>
			</RulesDrawer>
		{:else if current === Drawers.Token}
			<TokenDrawer
				close={() => {
					drawerContent.scrollIntoView();
					drawerOpen = false;
				}}
				{openModal}
			>
				<header slot="header">
					<h3>Reconfigure token</h3>
					<p>
						<Trans>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html info}
						</Trans>
					</p>
				</header>
			</TokenDrawer>
		{:else if current === Drawers.Handle}
			<ProjectHandleDrawer>
				<header slot="header">
					<h3>Change project handle</h3>
				</header>
			</ProjectHandleDrawer>
		{/if}
	</div>
</Drawer>
<Modal show={subModal} />

<style lang="scss">
	section {
		padding: 40px 26px;
		max-width: 650px;
	}

	p {
		font-weight: 400;
		color: var(--text-secondary);
		margin-bottom: 0;
	}

	h3 {
		font-size: 28px;
		color: var(--text-header);
	}

	h4 {
		font-size: 16px;
		font-weight: 400;
		color: var(--text-header);
		margin-bottom: 0;
	}

	span {
		font-size: 18px;
		color: var(--text-warn);
	}

	.address {
		color: var(--text-secondary);
		font-size: 14px;
		word-break: break-all;
	}

	.content {
		padding: 2rem;
	}

	.details {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		grid-row-gap: 20px;
		grid-column-gap: 40px;
		grid-auto-flow: row;
		font-size: 13px;
		p {
			font-weight: 400;
			margin-bottom: 0;
			display: inline;
		}
		h4 {
			font-weight: 500;
		}
	}

	.full {
		grid-column: 1 / -1;
	}

	.rates {
		/* A sub-grid with three columns and wraps if item smaller than 100px */
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		grid-auto-flow: row;
	}

	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 350px) {
		h4 {
			font-size: 13px;
		}
	}
</style>
