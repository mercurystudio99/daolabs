<script lang="ts">
	// import { format, addMinutes, addYears, addMonths } from 'date-fns';
	import { getContext, onMount } from 'svelte';
	import { readContractByAddress } from '$utils/web3/contractReader';
	import { TokenType, type Asset, type Token } from '$models/v2/tokens';
	import ERC20ContractAbi from '$constants/ERC20ContractAbi';
	import AddMembershipTierModal from './AddMembershipTierModal.svelte';

	import Button from './Button.svelte';
	import HeavyBorderBox from './HeavyBorderBox.svelte';
	import { openModal, bind } from './Modal.svelte';
	import NftTiersList from './NFTTiersList.svelte';
	import PopInfo from './PopInfo.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';
	// import type { Vest } from '$models/v2/vests';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');
	// let vests: Vest[] = $project.vests || [];
	const tokens: Token[] = $project.tokenWhitelist || [];
	// let assets: Asset[] = [];
	// let vestList: HTMLDivElement;
	// let loadingTokens;

	export let membershipTiers = [...$project.membershipNFTS];

	const readAssets = async (assetTokens: Token[]) => {
		// loadingTokens = true;
		let readenAssets: Asset[] = [];
		for await (const token of assetTokens) {
			const asset: Asset = { ...token };
			if (token.type === TokenType.ERC20) {
				asset.balance = await readContractByAddress(asset.value, ERC20ContractAbi, 'balanceOf', [
					$project.projectOwnerAddress,
				]);
				asset.symbol = await readContractByAddress(asset.value, ERC20ContractAbi, 'symbol');
			}
			// TODO: handle ERC721
			if (token.type === TokenType.ERC721) {
				asset.balance = await readContractByAddress(asset.value, ERC20ContractAbi, 'balanceOf', [
					$project.projectOwnerAddress,
				]);
				asset.symbol = await readContractByAddress(asset.value, ERC20ContractAbi, 'symbol');
			}
			// TODO: show project balance?
			// else if (asset.type === TokenType.PROJECT) {
			// 	const contractAddress = await readContract(V2ContractName.JBTokenStore, 'tokenOf', [
			// 		asset.value
			// 	]);

			// 	asset.symbol = await readContractByAddress(contractAddress, ERC20ContractAbi, 'symbol');

			// 	asset.balance = await readContract(V2ContractName.JBTokenStore, 'balanceOf', [
			// 		projectOwner,
			// 		asset.id
			// 	]);
			// }
			readenAssets.push(asset);
		}
		// loadingTokens = false;
		// assets = readenAssets;
	};

	onMount(async () => {
		try {
			await readAssets(tokens);
		} catch (error) {
			// loadingTokens = false;
		}
	});

	// let showShadow = false;
	// $: {
	// 	showShadow =
	// 		vests.length > 4 &&
	// 		vestList &&
	// 		vestList.offsetHeight + vestList.scrollTop < vestList.scrollHeight;
	// }

	// const addVest = (vest: Vest) => {
	// 	vests = [...vests, vest];
	// 	$project.vests = [...vests];
	// };

	// const deployDeposits = () => {
	// 	console.log('deploy'); // TODO
	// };

	// const scrollVests = () => {
	// 	vestList.scrollBy(0, 112);
	// 	showShadow = vestList && vestList.offsetHeight + vestList.scrollTop < vestList.scrollHeight;
	// };

	// const getStartDate = (offset: Period) => {
	// 	const now = new Date();
	// 	if (offset.type === 'months') {
	// 		return format(
	// 			addMonths(addMinutes(now, now.getTimezoneOffset()), parseInt(offset.value)),
	// 			'yyyy-MM-dd h:mma',
	// 		);
	// 	}
	// 		return format(
	// 			addYears(addMinutes(now, now.getTimezoneOffset()), parseInt(offset.value)),
	// 			'yyyy-MM-dd h:mma',
	// 		);

	// };

	// const uploadCsv = async () => {
	// 	// TODO call cloud function
	// };

	// const updateTokens = (newTokens: Token[]) => {
	// 	readAssets(newTokens);
	// 	tokens = newTokens;
	// 	$project.tokenWhitelist = [...newTokens];
	// };

	function addMembershipTeir() {
		openModal(
			bind(AddMembershipTierModal, {
				handleSave: (tier: any) => {
					membershipTiers = membershipTiers ? [...membershipTiers, tier] : [tier];
				},
				close: () => {},
			}),
		);
	}

	// $: projectTokens = assets.filter((token) => token.type === TokenType.PROJECT);
	// $: erc20Tokens = assets.filter((token) => token.type === TokenType.ERC20);
	// $: erc721Tokens = assets.filter((token) => token.type === TokenType.ERC721);
</script>

<HeavyBorderBox margin="32px" padding="16px 32px">
	<div class="box">
		<NftTiersList bind:nftTiers={membershipTiers} />
		<br />
		{#if !(membershipTiers?.length > 0)}
			<h4>
				<PopInfo message="membership tiers">Membership Tiers</PopInfo>
			</h4>
		{/if}
		<Button fullWidth size="md" type="secondary" on:click={addMembershipTeir}>
			Add membership tier
		</Button>
	</div>
</HeavyBorderBox>

<!-- <HeavyBorderBox margin="32px" padding="16px 32px">
	<div class="box">
		<h4>
			<PopInfo message="Token whitelisting tooltip">
				<Trans>ERC-20, ERC-721 token whitelisting</Trans>
			</PopInfo>
		</h4>
		<p>
			<Trans>
				Add ERC-20 and/or ERC-720 tokens which you want to have by default visible from the treasury
				wallet under
			</Trans>
			<span class="link" on:click={() => {}}><Trans>All Assets</Trans></span>.
			<Trans>
				Tokens defined here will include a badge which will signify that they are safe to interact
				with.
			</Trans>
		</p>
		{#if loadingTokens}
			<Loading />
		{:else}
			<div class="token-list">
				{#each projectTokens as token}
					<div class="info">
						<span>--</span>
						<span>{'Project ' + token.value}</span>
					</div>
				{/each}
				{#if erc20Tokens.length > 0}
					ERC-20
					{#each erc20Tokens as token}
						<div class="info">
							<span
								>{formatWad(token.balance, {
									precision: 4
								})}
							</span>
							<span>{getTruncatedAddress(token.value)}</span>
							<span>{token.symbol}</span>
						</div>
					{/each}
				{/if}
				{#if erc721Tokens.length > 0}
					ERC-721
					{#each erc721Tokens as token}
						<div class="info">
							<span>
								{formatWad(token.balance, {
									precision: 4
								})}
							</span>
							<span>{getTruncatedAddress(token.value)}</span>
							<span>{token.symbol}</span>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
		<Button
			type="tertiary"
			size="md"
			on:click={() => {
				openModal(bind(TokenWhitelistModal, { tokens, updateTokens }));
			}}
		>
			<Trans>Add tokens</Trans>
		</Button>
	</div>
</HeavyBorderBox> -->

<!-- <HeavyBorderBox margin="32px" padding="16px 32px">
	<div class="box">
		<h4>
			<PopInfo message="Vesting tooltip">
				<Trans>Vesting</Trans>
			</PopInfo>
		</h4>
		<p>
			<Trans>
				Vesting a token means locking a certain amount of tokens over a certain period as a
				commitment to hold the Token. It's a mechanism that allows the core contributors to prove
				they are highly interested in the project.
			</Trans>
			{#if vests.length === 0}
				<span class="link" on:click={uploadCsv}><Trans>Bulk uploads via csv.</Trans></span>
			{/if}
		</p>
		<div class="list-wrapper">
			{#if showShadow}
				<div class="overlay" />
			{/if}
			<div class="wrap" bind:this={vestList}>
				<div class="vests-list">
					{#each vests as vest}
						<span>
							<EnsOrAddress address={vest.recipient} />:
						</span>
						<span>
							{vest.token}
						</span>
						<span class="right-aligned">
							<span class="highlighted">
								{vest.tokenAmount}
							</span>
							/{formatWad($project.totalTokenSupply, {
								precision: $project.totalTokenSupply.gt(1000) ? 0 : 3
							})}
						</span>
						<Popover message={`Starts ${getStartDate(vest.cliff)} UTC`} maxWidth="250px">
							<span class="right-aligned">
								{vest.vestingPeriod.value}
								{vest.vestingPeriod.type}
							</span>
						</Popover>
					{/each}
				</div>
			</div>
		</div>
		{#if vests.length > 4}
			<div class="scroll">
				<div class="arrow" on:click={scrollVests}>
					<Icon name="chevronDown" />
				</div>
			</div>
		{/if}
		<Button
			type="tertiary"
			size="md"
			on:click={() => {
				openModal(bind(VestingModal, { addVest }));
			}}
		>
			<Trans>Deposit</Trans>
		</Button>
		{#if vests.length > 0}
			<Button type="primary" size="md" on:click={deployDeposits}>
				<Trans>Deploy Deposit(s)</Trans>
			</Button>
		{:else}
			<Button type="tertiary" size="md" on:click={uploadCsv}>
				<Trans>Upload a csv file</Trans>
			</Button>
		{/if}
	</div>
</HeavyBorderBox> -->
<style lang="scss">
	// p {
	// 	font-weight: 400;
	// 	color: var(--text-secondary);
	// 	margin-bottom: 0;
	// }

	h4 {
		font-size: 16px;
		font-weight: 400;
		color: var(--text-header);
		margin-bottom: 0;
	}
	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;

		// .list-wrapper {
		// 	position: relative;
		// 	max-height: 112px;
		// 	.overlay {
		// 		position: absolute;
		// 		height: 20px;
		// 		bottom: 0;
		// 		width: 100%;
		// 		background: linear-gradient(to bottom, rgba(243, 241, 236, 0) 0%, rgb(243, 241, 236) 100%);
		// 	}

		// 	.wrap {
		// 		max-height: 112px;
		// 		overflow: hidden;
		// 		.vests-list {
		// 			display: grid;
		// 			grid-template-columns: auto auto auto auto;
		// 			row-gap: 16px;
		// 			justify-content: space-between;

		// 			span {
		// 				font-size: 14px;
		// 				line-height: 16px;
		// 				font-weight: 500;
		// 				color: var(--text-primary);
		// 				display: flex;
		// 			}

		// 			.right-aligned {
		// 				justify-content: flex-end;
		// 			}

		// 			.highlighted {
		// 				color: var(--text-action-primary);
		// 			}
		// 		}
		// 	}
		// }

		// .scroll {
		// 	width: 100%;
		// 	border-top: 1px solid var(--stroke-tertiary);
		// 	padding-top: 4px;
		// 	display: flex;
		// 	justify-content: center;

		// 	.arrow {
		// 		border-radius: 50%;
		// 		background: var(--background-disabled);
		// 		width: 14px;
		// 		height: 14px;
		// 		display: flex;
		// 		align-items: center;
		// 		justify-content: center;
		// 		color: white;
		// 		cursor: pointer;
		// 	}
		// }
		// .link {
		// 	color: var(--text-action-primary);
		// 	cursor: pointer;
		// }

		// .token-list {
		// 	display: flex;
		// 	flex-direction: column;
		// 	gap: 16px;
		// 	width: 100%;
		// 	color: var(--text-primary);

		// 	.info {
		// 		display: flex;
		// 		justify-content: space-between;
		// 		color: var(--text-secondary);
		// 	}
		// }
	}

	// @media (max-width: 500px) {
	// 	.box {
	// 		.list-wrapper {
	// 			.vests-list {
	// 				span {
	// 					font-size: 12px;
	// 				}
	// 			}
	// 		}
	// 	}
	// }
</style>
