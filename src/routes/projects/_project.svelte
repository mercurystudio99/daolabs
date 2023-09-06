<script lang="ts">
	import { BigNumber, constants } from 'ethers';
	import { setContext } from 'svelte';
	import { modal } from '$stores';
	import Footer from '$lib/components/FooterProject.svelte';
	import Details from '$lib/project/Details.svelte';
	import Head from '$lib/project/Head.svelte';
	import Modal, { openModal, bind } from '$lib/components/Modal.svelte';
	import Store from '$utils/Store';
	import { ETH_TOKEN_ADDRESS } from '$constants/v2/juiceboxTokens';
	import Activity from '$lib/project/Activity.svelte';
	import NextSteps from '$lib/project/NextSteps.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { getCurrencyConverter } from '$data/currency';
	import { V2CurrencyName, V2_CURRENCY_ETH, V2_CURRENCY_USD } from '$utils/v2/currency';
	import { chainId, connectedAccount, readNetwork } from '$stores/web3';
	import { V2OperatorPermission } from '$constants/v2/operatorPermission';
	import V2BugNotice from '$lib/components/V2BugNotice.svelte';
	import BannerNotice from '$lib/components/BannerNotice.svelte';
	import Icon from '$lib/components/Icon';
	import { blocknativeNetworks } from '$constants/networks';
	import blacklist from '$constants/blacklist';
	import {
		checkNetworkId,
		loadDocuments,
		loadFundingCycle,
		loadInitial,
		loadMetadata,
		loadProjectOwner,
		loadSplitsOf,
		loadQueuedFundingCycle,
		loadReservedTokensSplitsOf,
		loadTokenOf,
		loadTotalSupplyOf,
		loadPrimaryTerminalOf,
		loadDistributionLimitOf,
		loadPrimaryTerminalCurrentOverflow,
		loadUsedDistributionLimitOf,
		loadReservedTokenBalance,
		loadNftRewardTiers,
		getProjectPlatform,
	} from '$lib/projects/data';
	import PageError from '$lib/components/error/PageError.svelte';
	import { balanceOf, claimedBalanceOf, unclaimedBalanceOf } from '$utils/web3/JBTokenStoreWrapper';
	import { balanceOf as jbSingleTokenBalanceOf } from '$utils/web3/JBSingleTokenPaymentTerminalStore';
	import Stats from '$lib/project/Stats.svelte';
	import Payment from '$lib/project/Payment.svelte';
	import { hasPermissions } from '$utils/web3/JBOperatorStore';
	import NftCollectionMint from '$lib/project/NFTCollectionMint.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import type { CodeError } from '$utils/errors';
	import type { V2CurrencyOption } from '$models/v2/currencyOption';
	import type { UserTokenBalanceContext, V2ProjectContextType } from '$models/project-type';
	import type { ProjectPlatform } from '$constants/platform';

	let urlProjectId: number;
	export { urlProjectId as projectId };
	export let platform: ProjectPlatform = 'juicebox';
	export let redirectIfHasHandle = false;

	const project = new Store<V2ProjectContextType>({} as V2ProjectContextType);
	const userTokenBalance = new Store<UserTokenBalanceContext>({
		claimedBalance: BigNumber.from(0),
		unclaimedBalance: BigNumber.from(0),
		totalBalance: BigNumber.from(0),
	});

	let issue: string | false = false;

	const isNewDeploy = $page.url.searchParams.get('newDeploy');

	let loadingMetadata = false;
	let loadingVolume = false;
	let loadingInTreasury = false;
	let loadingDistributed = false;
	let loadingFindingCycle = false;
	let loadingUserTokenBalance = false;
	let loading = false;

	async function fetchProject(cached = false, showLoadingUI = true) {
		function handleError(error: CodeError) {
			if (error.code === 'networkChanged') {
				void fetchProject(cached, showLoadingUI);
				return true;
			}
			console.error(error);
			return false;
		}

		if (!browser) return;
		loadingMetadata = true;
		loadingVolume = true;
		loadingInTreasury = true;
		loadingDistributed = true;
		loadingFindingCycle = true;
		loadingUserTokenBalance = true;
		loading = true;

		issue = '';
		const networkId = Number($readNetwork.id);
		if ($connectedAccount && !blocknativeNetworks.find((net) => Number(net.id) === $chainId)) {
			issue = 'current network is not supported';
			return;
		}
		const projectId = BigNumber.from(urlProjectId);

		project.update((values) => ({
			...values,
			projectId,
			platform,
			version: '3',
		}));

		try {
			await loadInitial(project, redirectIfHasHandle);
			loadingVolume = false;
		} catch (e) {
			console.error(e);
		}

		try {
			await loadMetadata(project, networkId, cached);
			loadingMetadata = false;
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = `no metadata found for project ${$project.projectId?.toNumber()}`;
			return;
		}

		try {
			await loadDocuments(project);
			console.log('loaded documents', $project.documents);
		} catch (error) {
			console.error(error);
		}

		try {
			await loadFundingCycle(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading current funding cycle';
			return;
		}

		try {
			await loadQueuedFundingCycle(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading current funding cycle';
			return;
		}

		try {
			await loadProjectOwner(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading owner of project';
			return;
		}

		// TODO - up until this point I've extracted meaningful functions, fixed types,
		// and place in ./data.ts. The rest of the code below is still
		// in need of refactoring.

		try {
			await loadSplitsOf(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading payout splits';
			return;
		}

		try {
			await loadReservedTokensSplitsOf(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading reserved tokens splits';
			return;
		}

		loadingFindingCycle = false;

		try {
			await loadNftRewardTiers(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading nftRewardTiers';
			return;
		}

		try {
			await loadTokenOf(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading token address/symbol';
			return;
		}

		try {
			await loadTotalSupplyOf(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading total token supply';
			return;
		}

		try {
			await loadPrimaryTerminalOf(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading primary terminal of project';
			return;
		}

		try {
			await loadDistributionLimitOf(project, networkId);
			loadingDistributed = false;
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading distributionLimit';
			return;
		}

		try {
			await loadPrimaryTerminalCurrentOverflow(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading owner of project';
			return;
		}

		try {
			await loadUsedDistributionLimitOf(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			// loading = false;
			issue = 'error reading usedDistributionLimitOf';
			return;
		}

		try {
			await loadReservedTokenBalance(project, networkId);
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading reservedTokenBalanceOf';
			return;
		}

		try {
			const isOwner =
				$connectedAccount &&
				$project.projectOwnerAddress &&
				$connectedAccount.toLowerCase() === $project.projectOwnerAddress.toLowerCase();
			for (const permission of [
				V2OperatorPermission.ISSUE,
				V2OperatorPermission.REDEEM,
				V2OperatorPermission.CLAIM,
			]) {
				checkNetworkId(networkId);
				const platformId = getProjectPlatform(project, false);
				$project.hasIssueTicketsPermissions = $project.hasIssueTicketsPermissions || {};
				$project.hasIssueTicketsPermissions[permission] = $connectedAccount
					? isOwner ||
					  (await hasPermissions(
							platformId,
							$connectedAccount,
							$project.projectOwnerAddress,
							$project.projectId,
							[permission],
							cached,
					  ))
					: false;
			}
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading permissions';
			return;
		}

		try {
			checkNetworkId(networkId);
			if ($project.primaryTerminal) {
				const platformId = getProjectPlatform(project, false);
				const ETHBalance = await jbSingleTokenBalanceOf(
					platformId,
					$project.projectId,
					$project.primaryTerminal,
					cached,
				);
				// if ETH, no conversion necessary
				if (BigNumber.from($project.distributionLimitCurrency)?.eq(V2_CURRENCY_USD)) {
					const converter = await getCurrencyConverter();
					$project.balanceInDistributionLimitCurrency = converter.wadToCurrency(
						BigNumber.from(ETHBalance),
						V2CurrencyName(
							BigNumber.from($project.distributionLimitCurrency)?.toNumber() as V2CurrencyOption,
						),
						V2CurrencyName(V2_CURRENCY_ETH as V2CurrencyOption),
					);
				} else {
					$project.balanceInDistributionLimitCurrency = BigNumber.from(ETHBalance);
				}
			}
			loadingInTreasury = false;
		} catch (error) {
			if (handleError(error as CodeError)) return;
			issue = 'error reading balance of project';
			return;
		}

		try {
			if ($connectedAccount) {
				checkNetworkId(networkId);
				const { tokenAddress } = $project;
				const platformId = getProjectPlatform(project);
				if (
					tokenAddress &&
					tokenAddress !== constants.AddressZero &&
					tokenAddress.toLowerCase() !== ETH_TOKEN_ADDRESS.toLowerCase()
				) {
					$userTokenBalance.claimedBalance = await claimedBalanceOf(
						platformId,
						$project.tokenAddress,
						$connectedAccount,
					);
				}
				$userTokenBalance.unclaimedBalance = await unclaimedBalanceOf(
					platformId,
					projectId,
					$connectedAccount,
				);
				$userTokenBalance.totalBalance = await balanceOf(platformId, projectId, $connectedAccount);
			}
			loadingUserTokenBalance = false;
		} catch (error) {
			if (handleError(error as CodeError)) return;
		}

		loading = false;

		console.log(`Project #${String($project.projectId)}`, $project);
		// loading = false;

		if (isNewDeploy) {
			openModal(
				bind(NextSteps, {
					projectId: $project.projectId.toNumber(),
					close: () => {},
				}),
			);
		}
	}

	setContext('PROJECT', project);
	setContext('USER_TOKEN_BALANCE', userTokenBalance);
	setContext('RELOAD_PROJECT', () => {
		void fetchProject();
	});

	$: isBlacklisted = blacklist.includes(urlProjectId);

	if (browser) {
		readNetwork.subscribe(() => {
			void fetchProject();
		});
	}

	let innerWidth: number = browser ? window.innerWidth : 0;
</script>

<svelte:head>
	{#if $project?.projectMetadata?.name}
		<title>{$project?.projectMetadata?.name} | MOVEMENT</title>
	{:else}
		<title>Project | Juicebox</title>
	{/if}
</svelte:head>

<svelte:window bind:innerWidth />

<section>
	{#if isBlacklisted}
		<BannerNotice type="info">
			<span>
				<Icon name="exclamationCircle" /> THIS PROJECT HAS BEEN DISABLED
			</span>
		</BannerNotice>
	{/if}
	<div class="content">
		{#if issue}
			<PageError customMessage={issue} />
		{:else if !$project?.projectId}
			<div class="loading">
				<Loading height={800} />
			</div>
		{:else if $project?.projectId}
			<div>
				<span class="back-icon" on:click={() => window.history.go(-1)} on:keydown>
					<Icon name="collectionBack" viewBox="0 0 18 16" />
				</span>
				<Head {loadingMetadata} {isBlacklisted} />
				{#if $project?.fundingCycle?.number?.eq(0) && $project?.queuedFundingCycle?.number?.eq(0)}
					<V2BugNotice />
				{/if}
				<!-- <Stats /> -->
				<div class="row">
					<div class="col">
						{#if !loadingMetadata}
							<NftCollectionMint />
						{/if}
						<Stats {loadingVolume} {loadingInTreasury} {loadingDistributed} />
						{#if innerWidth > 850}
							<Details {loadingMetadata} {loadingFindingCycle} {loadingUserTokenBalance} />
						{:else}
							<Payment {isBlacklisted} />
						{/if}
					</div>
					<div class="col">
						{#if innerWidth > 850}
							<Payment {isBlacklisted} />
						{:else}
							<Details {loadingMetadata} {loadingFindingCycle} {loadingUserTokenBalance} />
						{/if}
						<Activity {loadingMetadata} />
					</div>
				</div>
			</div>
		{/if}
	</div>
	<Footer />
</section>

{#if !loading}
	<Modal show={$modal} />
{/if}

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: transparent;
		padding-bottom: 62px;
	}

	.content {
		height: 100%;
		min-height: 100vh;
		max-width: 1080px;
		margin: 0px auto;
		padding: 20px;
		width: 100%;
		overflow: hidden;
	}
	.back-icon {
		cursor: pointer;
		color: var(--text-action-primary);
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}

	.row {
		display: flex;
		// flex-flow: row wrap;
		margin-left: -20px;
		margin-right: -20px;
		padding-bottom: 40px;
		row-gap: 0px;
	}
	.col {
		width: 100%;
	}
	@media (max-width: 850px) {
		.row {
			flex-flow: wrap;
		}
	}
	.loading {
		display: block;
		height: 90vh;
		max-height: 1080px;
	}
</style>
