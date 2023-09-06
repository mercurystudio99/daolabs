<script lang="ts">
	import { getContext } from 'svelte';
	import { BigNumber } from 'ethers';
	import Button from '$lib/components/Button.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import AddMembershipTierModal from '$lib/components/AddMembershipTierModal.svelte';
	import Icon from '$lib/components/Icon';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import { defaultNftCollectionDescription, defaultNftCollectionName } from '$utils/nftRewards';
	import FormField from '$lib/components/FormField.svelte';
	import { getProjectPlatform } from '$lib/projects/data';
	import { contracts } from '$utils/web3/contractMap';
	import { readNetwork } from '$stores/web3';
	import { ETH_TOKEN_ADDRESS } from '$constants/v2/juiceboxTokens';
	import { MAX_DISTRIBUTION_LIMIT } from '$utils/v2/math';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { updateNftProject } from './createHelper';
	import type {
		JBFundAccessConstraints,
		JBFundingCycleData,
		JBFundingCycleMetadata,
		JBGroupedSplits,
		JBSplit,
	} from '$utils/web3/types';
	import type { EditingNftRewardTier, NftRewardTier } from '$models/nftRewardTier';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';

	export let close: () => void;

	const project: Store<V2ProjectContextType> = getContext('PROJECT');
	const reloadProject: Function = getContext('RELOAD_PROJECT');

	const dirty: {
		showDirty: Store<boolean>;
		check: (
			initialState?: {
				[x: string]: any;
			},
			currentState?: {
				[x: string]: any;
			},
		) => void;
	} = getContext('SHOW_DIRTY');
	let disabled = false;

	let [collection, tiers] = (() => {
		const { collectionMetadata, rewardTiers } = $project.nftRewardTiers || {
			collectionMetadata: { name: '', description: '', symbol: '', uri: '' },
			rewardTiers: [],
		};
		return [
			{
				name: collectionMetadata.name || defaultNftCollectionName($project.projectMetadata.name),
				description:
					collectionMetadata.description ||
					defaultNftCollectionDescription($project.projectMetadata.name),
				symbol: collectionMetadata.symbol,
				uri: collectionMetadata.uri || $project.projectMetadata.infoUri,
			},
			rewardTiers.map(
				(tier) =>
					<EditingNftRewardTier>{
						name: tier.name,
						link: tier.externalLink,
						description: tier.description,
						file: tier.imageUrl,
						maxSupply: tier.maxSupply,
						priceInput: tier.contributionFloor,
						default: tier.default,
					},
			),
		];
	})();

	function validate(name: string, symbol: string, url: string) {
		return (
			typeof name === 'string' &&
			typeof symbol === 'string' &&
			name.length &&
			symbol.length &&
			symbol.match(/^[A-Z]+$/) &&
			(url ? url.match(/^https?:\/\/\w+/) : true)
		);
	}

	const initialState = {
		name: collection.name,
		symbol: collection.symbol,
		description: collection.description,
		uri: collection.uri,
		tiers: JSON.stringify(tiers),
	};

	$: {
		disabled = !validate(collection.name, collection.symbol, collection.uri);
		dirty?.check(initialState, {
			name: collection.name,
			symbol: collection.symbol,
			description: collection.description,
			uri: collection.uri,
			tiers: JSON.stringify(tiers),
		});
	}

	function editTier(index: number) {
		openModal(
			bind(AddMembershipTierModal, {
				project,
				otherTiersPrices: tiers
					.filter((t, i) => i !== index)
					.map((tier) => Number(tier.priceInput)),
				handleSave: (tier) => {
					tiers[index] = tier;
				},
				tierForm: tiers[index],
				close: () => {},
			}),
		);
	}

	function addTier() {
		openModal(
			bind(AddMembershipTierModal, {
				project,
				otherTiersPrices: tiers.map((tier) => Number(tier.priceInput)),
				handleSave: (tier) => {
					tiers = [...tiers, tier];
				},
				close: () => {},
			}),
		);
	}

	function removeTier(index: number) {
		tiers = tiers.filter((t, i) => i !== index);
	}

	const followLink = (url: string) => {
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('target', '_blank');
		link.click();
	};

	const DEFAULT_MUST_START_AT_OR_AFTER = '1';
	const DEFAULT_MEMO = '';

	async function updateNftRewardTiers() {
		const platform = getProjectPlatform(project);
		const { rewardTiers, collectionMetadata } = $project.nftRewardTiers || {
			collectionMetadata: {},
			rewardTiers: [],
		};

		const { payoutSplits, reservedTokensSplits } = $project;
		const projectFundingCycleData: JBFundingCycleData = {
			duration: $project.fundingCycle.duration,
			weight: $project.fundingCycle.weight,
			discountRate: $project.fundingCycle.discountRate,
			ballot: $project.fundingCycle.ballot,
		};
		const projectFundingCycleMetadata = $project.fundingCycleMetadata as JBFundingCycleMetadata;
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
		const JBETHPaymentTerminal = await contracts[platform][
			$readNetwork.alias
		].JBETHPaymentTerminal();
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

		const txnResponse = await updateNftProject(
			platform,
			$project.projectId,
			$project.projectOwnerAddress,
			{
				data: projectFundingCycleData,
				metadata: projectFundingCycleMetadata,
				mustStartAtOrAfter: BigNumber.from(projectStartTime),
				fundAccessConstraints: projectFundAccessConstraints,
				groupedSplits: projectGroupedSplits,
				memo: DEFAULT_MEMO,
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
		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'reconfigureFundingCyclesOf',
				close: () => {},
			}),
		);
		await txnResponse.wait();
		reloadProject?.();
	}

	let saving = false;

	async function onSaveExtensionConfig() {
		saving = true;
		const nftRewardTiersBeforeUpdate = $project.nftRewardTiers;
		try {
			const nftRewardTier = JSON.parse(JSON.stringify(nftRewardTiersBeforeUpdate)) || {
				collectionMetadata: { name: '', description: '', symbol: '', uri: '' },
				rewardTiers: [],
			};
			nftRewardTier.collectionMetadata.name = collection.name;
			nftRewardTier.collectionMetadata.symbol = collection.symbol;
			nftRewardTier.collectionMetadata.description = collection.description;
			nftRewardTier.collectionMetadata.uri = collection.uri;
			nftRewardTier.rewardTiers = tiers.map(
				(tier): NftRewardTier => ({
					name: tier.name,
					contributionFloor: tier.priceInput,
					description: tier.description,
					externalLink: tier.link,
					imageUrl: tier.file,
					maxSupply: tier.maxSupply,
					remainingSupply: tier.maxSupply,
					default: tier.default,
				}),
			);
			if (JSON.stringify($project.nftRewardTiers) !== JSON.stringify(nftRewardTier)) {
				$project.nftRewardTiers = nftRewardTier;
				if ($project.projectId instanceof BigNumber) {
					await updateNftRewardTiers();
				}
			}
			close();
		} catch (error) {
			console.error(error.message);
			$project.nftRewardTiers = nftRewardTiersBeforeUpdate;
		}
		saving = false;
	}

	function handleTierClick(isDefault: boolean, index: number, doubleClick = false) {
		if (isDefault && doubleClick) {
			editTier(index);
		} else if (!isDefault) {
			editTier(index);
		}
	}
</script>

<slot name="header" />
<InfoBox
	>Membership non-fungible token (NFT) mechanics are currently awaiting smart contract review/audit
	as they relate to how we envision their use with the corresponding Treasury tokens. Visit our <a
		href="https://discord.gg/daolabs"
		target="_blank"
		rel="noreferrer">Discord</a
	> to learn more.
</InfoBox>
<br />
<HeavyBorderBox>
	<h2>Membership</h2>
	<p>
		Define the below Membership Collection metadata details so that contributors and marketplaces
		can easily identify this NFT.
	</p>
	<div class="form-field" id="collection-name">
		<FormField
			popInfoMessage="Your Membership Collection's name, usually displayed as the title (i.e., CryptoKitties)."
			field={{
				id: 'collection-name',
				description: 'Name which describes the entire Membership Collection',
				label: 'Membership Collection Name',
				placeholder: defaultNftCollectionName($project.projectMetadata.name),
			}}
			labelHeaderColored
			bind:value={collection.name}
		/>
	</div>
	<div class="form-field" id="collection-symbol">
		<FormField
			popInfoMessage="Your Treasury Membership Collection's symbol, used within the smart contract, is less common but used in wallets (i.e., CK)."
			field={{
				id: 'collection-symbol',
				description: '',
				label: 'Collection Symbol',
				placeholder: 'SYM',
				props: {
					pattern: '^[A-Z]+$',
				},
			}}
			labelHeaderColored
			bind:value={collection.symbol}
		/>
	</div>
	<div class="form-field" id="collection-description">
		<FormField
			field={{
				id: 'collection-description',
				description: '',
				label: `Membership Collection Description`,
				placeholder: defaultNftCollectionDescription($project.projectMetadata.name),
				type: 'textarea',
			}}
			labelHeaderColored
			popInfoMessage="Collection Description"
			bind:value={collection.description}
		/>
	</div>
	<div class="form-field" id="collection-uri">
		<FormField
			popInfoMessage="Link contributors to another page after they successfully mint/contribute to your Treasury."
			field={{
				id: 'collection-uri',
				description: '',
				label: 'Link',
				placeholder: $project.projectMetadata.infoUri,
				props: {
					type: 'url',
				},
			}}
			labelHeaderColored
			bind:value={collection.uri}
		/>
	</div>
	<br />

	<!-- TODO: Tooltip -->
	{#each tiers as tier, index}
		<div class="nft-container">
			<div
				class="numbers"
				on:keydown={null}
				on:dblclick|preventDefault={() => handleTierClick(tier.default, index, true)}
				on:click|preventDefault={() => handleTierClick(tier.default, index)}
			>
				<span>
					> {tier.priceInput || 0} ETH
				</span>
				<span>
					&#931 {tier.maxSupply} NFTs
				</span>
			</div>

			<div
				class="text"
				on:keydown={null}
				on:dblclick|preventDefault={() => handleTierClick(tier.default, index, true)}
				on:click|preventDefault={() => handleTierClick(tier.default, index)}
			>
				<span>
					{tier.name}
					{#if tier.link}
						<div class="link-icon" on:click={() => followLink(tier.link)} on:keydown={null}>
							<Icon name="link" />
						</div>
					{/if}
				</span>
				<span class="description">
					{tier.description}
				</span>
			</div>
			<img
				class="nft-preview"
				src={tier.file}
				alt=""
				on:keydown={null}
				on:dblclick|preventDefault={() => handleTierClick(tier.default, index, true)}
				on:click|preventDefault={() => handleTierClick(tier.default, index)}
			/>
			{#if !tier.default}
				<CloseButton
					size="6px"
					position="8px"
					on:click={() => removeTier(index)}
					color="--stroke-action-primary"
				/>
			{/if}
		</div>
	{/each}
	<br />
	<Button fullWidth type="secondary" size="md" on:click={addTier}
		>Add additional membership tier</Button
	>
</HeavyBorderBox>
<br />
<Button disabled={disabled || saving} on:click={onSaveExtensionConfig}>
	Confirm Membership Settings {#if saving}<Icon name="loading" spin />{/if}
</Button>

<style lang="scss">
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
	h2 {
		color: var(--text-header);
	}
	.nft-container {
		position: relative;
		padding: 8px 16px;
		display: flex;
		gap: 16px;
		font-weight: 300;
		background: var(--background-l0);
		border: 0.4px solid var(--stroke-secondary);
		cursor: pointer;
		user-select: none;

		.numbers {
			color: var(--text-action-primary);
			display: flex;
			flex-direction: column;
			gap: 4px;

			span {
				display: flex;
				gap: 16px;
				white-space: nowrap;
			}
		}
		.text {
			display: flex;
			flex-grow: 1;
			flex-direction: column;
			gap: 4px;
			color: var(--text-secondary);

			span {
				display: flex;
				align-items: center;
			}

			.link-icon {
				display: flex;
				margin-left: 8px;
				cursor: pointer;
			}

			.description {
				font-size: 10px;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 3;
				line-clamp: 3;
				-webkit-box-orient: vertical;
				word-break: break-all;
			}
		}
		.nft-preview {
			min-width: 80px;
			height: 80px;
			margin-left: auto;
			margin-top: auto;
			margin-bottom: auto;
		}
	}
	.form-field {
		margin-top: 0.25rem;
	}
</style>
