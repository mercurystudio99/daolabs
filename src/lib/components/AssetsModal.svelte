<script lang="ts">
	import { BigNumber } from 'ethers';

	import { getContext, onMount } from 'svelte';
	import { readContractByAddress } from '$utils/web3/contractReader';
	import { formatWad } from '$utils/formatNumber';
	import { copyToClipboard } from '$utils/clipboard';
	import { getProvider, connectedAccount, readNetwork } from '$stores/web3';
	import ERC20ContractAbi from '$constants/ERC20ContractAbi';
	import Icon from '$lib/components/Icon';
	import { balanceOf, tokenOf } from '$utils/web3/JBTokenStoreWrapper';
	import { getProjectPlatform } from '$lib/projects/data';
	import EnsOrAddress from './EnsOrAddress.svelte';
	import Button from './Button.svelte';
	import EditAssetsModal from './EditAssetsModal.svelte';
	import Loading from './Loading.svelte';
	import { bind, closeModal, openModal } from './Modal.svelte';
	import Popover from './Popover.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');

	interface Token {
		type: 'native' | 'project' | 'erc20';
		balance: BigNumber;
		alwaysShow: boolean;
		id?: BigNumber | string;
		contract?: {
			goerli: string;
			mainnet: string;
		};
		symbol?: string;
	}

	function projectTokens(): Token[] {
		if (!$project.projectMetadata.tokens) {
			return [];
		}
		return $project.projectMetadata.tokens.map((t) => ({
			type: t.type,
			[t.type === 'erc20' ? 'contract' : 'id']:
				t.type === 'erc20'
					? {
							goerli: t.value,
							mainnet: t.value,
					  }
					: t.value,
			balance: BigNumber.from(0),
			alwaysShow: true,
		}));
	}

	function getAssetKey(asset: Token) {
		return `${asset.type}${
			asset.type === 'erc20'
				? asset.contract[$readNetwork.alias]
				: asset.type === 'project'
				? String(asset.id)
				: ''
		}`;
	}

	const assets: Token[] = [
		{
			type: 'native',
			balance: BigNumber.from(0),
			symbol: $readNetwork.token,
			alwaysShow: true,
		} as Token,
		{
			// DAI
			type: 'erc20',
			contract: {
				goerli: '0x73967c6a0904aA032C103b4104747E88c566B1A2',
				mainnet: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
			},
			balance: BigNumber.from(0),
			alwaysShow: false,
			symbol: null,
			id: null,
		} as Token,
		{
			// JBX
			type: 'project',
			id: BigNumber.from(1),
			balance: BigNumber.from(0),
			alwaysShow: false,
		} as Token,
		...($project.projectId
			? [
					{
						type: 'project',
						id: $project.projectId,
						balance: BigNumber.from(0),
						contract: null,
						symbol: null,
					} as Token,
					...projectTokens(),
			  ]
			: []),
	].filter(Boolean);
	let filteredAssets: Token[] = [];
	let loading = false;

	let projectOwner: string;
	$: projectOwner = $project.projectOwnerAddress;
	$: {
		filteredAssets = [];
		for (const asset of assets) {
			const key = getAssetKey(asset);
			if (!filteredAssets.find((a) => getAssetKey(a) === key)) {
				filteredAssets.push(asset);
			}
		}
	}

	async function readAsset(assetIndex: number) {
		const provider = getProvider();
		const asset = assets[assetIndex];
		if (asset.type === 'native') {
			asset.balance = await provider.getBalance(projectOwner);
		} else if (asset.type === 'erc20') {
			asset.balance = BigNumber.from(
				await readContractByAddress(
					asset.contract[$readNetwork.alias],
					ERC20ContractAbi,
					'balanceOf',
					[projectOwner],
				),
			);
			asset.symbol = String(
				await readContractByAddress(asset.contract[$readNetwork.alias], ERC20ContractAbi, 'symbol'),
			);
		} else if (asset.type === 'project') {
			const platform = getProjectPlatform(project);
			const contractAddress = String(await tokenOf(platform, BigNumber.from(asset.id)));
			asset.symbol = String(
				await readContractByAddress(contractAddress, ERC20ContractAbi, 'symbol'),
			);
			asset.balance = BigNumber.from(
				await balanceOf(platform, BigNumber.from(asset.id), projectOwner),
			);
		}
		/*
		console.log(`Asset type: ${asset.type}`);
		console.log(JSON.stringify(asset));
		*/
		assets[assetIndex] = asset;
	}

	onMount(async () => {
		loading = true;
		for (let i = 0; i < assets.length; i++) {
			try {
				await readAsset(i);
			} catch (error) {
				console.log(error);
			}
		}
		loading = false;
	});

	const getEtherscanSubdomain = (): string => {
		return $readNetwork.alias === 'mainnet' ? '' : `${$readNetwork.alias}.`;
	};
	const getAssetContractAddress = (asset: Token): string =>
		asset.contract ? asset.contract[$readNetwork.alias] : '';

	const editAssetsClicked = () => {
		openModal(bind(EditAssetsModal, {}));
	};

	function done() {
		closeModal();
	}
</script>

<!--
	TODO: Move styling to styles section
	ETH asset should not have tooltip
-->
<main>
	<div>
		<div>
			<h1>Assets</h1>
			<p>Other assets in this project's owner's wallet.</p>
			<div>
				{#each filteredAssets as asset}
					<div>
						<div style="display: flex; justify-content: space-between;">
							<span
								>{formatWad(asset.balance, {
									precision: 4,
								})}</span
							>
							<Popover placement="left">
								<svelte:fragment slot="content">
									<div>
										{#if asset.type === 'erc20'}
											<a
												href="https://{getEtherscanSubdomain()}etherscan.io/token/{asset.contract[
													$readNetwork.alias
												]}?a={projectOwner}"
												target="_blank"
												rel="noreferrer"
											>
												<EnsOrAddress
													address={asset.contract[$readNetwork.alias]}
													showTooltip={false}
												/>
											</a>
											<span
												style="cursor: pointer"
												on:click={() => copyToClipboard(getAssetContractAddress(asset))}
												on:keydown
											>
												<Icon name="copy" style="transform: translateY(3px)" />
											</span>
										{:else if asset.type === 'project'}
											<a href="/projects/${$project.platform}/{asset.id}">
												Project ID: {asset.id}
											</a>
										{/if}
									</div>
								</svelte:fragment>
								<div style="display: flex; align-items: center;">
									{#if asset.type === 'native'}
										<a
											style="color: var(--text-primary);"
											href="https://{getEtherscanSubdomain()}etherscan.io/address/{projectOwner}"
											target="_blank"
											rel="noreferrer"
										>
											<span>{asset.symbol ?? 'TOKENs'}</span>
										</a>
									{:else if asset.type === 'erc20' && asset.contract}
										<a
											style="color: var(--text-primary);"
											href="https://{getEtherscanSubdomain()}etherscan.io/token/{asset.contract[
												$readNetwork.alias
											]}?a={projectOwner}"
											target="_blank"
											rel="noreferrer"
										>
											<span>{asset.symbol ?? 'TOKENs'}</span>
										</a>
									{:else if asset.type === 'project'}
										<a
											style="color: var(--text-primary);"
											href="/projects/{$project.platform}/{asset.id}"
										>
											{#if asset.symbol}
												<span>{asset.symbol}</span>
											{:else}
												<span>project #{asset.id}</span>
											{/if}
										</a>
									{/if}
								</div>
							</Popover>
						</div>
					</div>
				{/each}
			</div>
			{#if loading}
				<Loading />
			{/if}
		</div>
	</div>
	<div>
		<div style="display: flex; justify-content: space-between; margin-top: 20px;">
			{#if $connectedAccount && $project.projectOwnerAddress?.toLowerCase() === $connectedAccount?.toLowerCase()}
				<Button type="primary" on:click={editAssetsClicked}>
					<Icon name="setting" />
					<span>Edit tracked assets</span>
				</Button>
			{:else}
				<div>&nbsp;</div>
			{/if}
			<Button type="primary" on:click={done}>Done</Button>
		</div>
	</div>
</main>

<style>
	h1 {
		color: var(--text-header);
	}
	main {
		max-width: 350px;
	}
</style>
