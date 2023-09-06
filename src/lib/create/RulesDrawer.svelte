<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { constants, utils } from 'ethers';
	import AlertText from '$lib/components/AlertText.svelte';
	import Button from '$lib/components/Button.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import Icon from '$lib/components/Icon';
	import Input from '$lib/components/Input.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import ReconBox from '$lib/components/ReconBox.svelte';
	import { getBallotStrategyByAddress } from '$constants/v2/ballotStrategies/getBallotStrategiesByAddress';
	import { ballotStrategies, getDefaultBallotStrategy } from '$constants/v2/ballotStrategies';
	import { chainId, readNetwork } from '$stores/web3';
	import Popover from '$lib/components/Popover.svelte';
	import { getTruncatedAddress } from '$lib/utils/getTruncatedAddress';
	import EtherscanLink from '$lib/components/EtherscanLink.svelte';
	import { layouts } from '$constants/styles/layouts';
	import type { BallotStrategy } from '$constants/v2/ballotStrategies';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');
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

	let isMobile = false;

	export let close: () => void;

	let { pausePay } = $project.queuedFundingCycleMetadata;
	let { allowMinting } = $project.queuedFundingCycleMetadata;

	let selected = $project.queuedFundingCycle.ballot
		? getBallotStrategyByAddress($project.queuedFundingCycle.ballot)
		: getDefaultBallotStrategy();
	let customBallotAddress: Address | undefined;
	let disabled = false;

	const initialState = {
		pausePay,
		allowMinting,
		selected,
	};

	let strategies = ballotStrategies($readNetwork.alias);

	chainId.subscribe(($chainId) => {
		console.log($chainId);
		strategies = ballotStrategies($readNetwork.alias);
	});

	function selectBallotStrategy(strategy: BallotStrategy) {
		selected = strategy;
		if (strategy.name !== 'custom') {
			disabled = false;
		}
	}

	function validate(address: Address) {
		return utils.isAddress(address) && address !== constants.AddressZero;
	}

	function onSaveRules() {
		// TODO: Issue #50
		// https://github.com/tankbottoms/juice-interface-svelte/issues/50
		// The project data is updated, but the contract isn't called to update
		// the onchain data.
		project.update((current) => ({
			...current,
			queuedFundingCycle: {
				...current.queuedFundingCycle,
				ballot: selected.address,
			},
			queuedFundingCycleMetadata: {
				...current.queuedFundingCycleMetadata,
				pausePay,
				allowMinting,
			},
		}));
		close();
	}

	$: {
		if (selected.name === 'custom') {
			selected.address = customBallotAddress;
			disabled = !validate(customBallotAddress);
		}
		dirty?.check(initialState, {
			pausePay,
			allowMinting,
			selected,
		});
	}

	onMount(() => {
		isMobile = window.innerWidth < (<Record<string, number>>layouts.screen).md;
	});
</script>

<slot name="header" />
<HeavyBorderBox>
	<div class="option">
		<Toggle id="pausePayments" bind:checked={pausePay}>Pause payments</Toggle>
		<p>When enabled, your project cannot receive direct payments.</p>
	</div>
	<div class="option">
		<Toggle id="allowMinting" bind:checked={allowMinting}>Allow token minting</Toggle>
		<p>When enabled, the project owner can manually mint any amount of tokens to any address.</p>
		{#if allowMinting}
			<p class="info">
				<Icon name="exclamationCircle" /> Enabling token minting will appear risky to contributors. Only
				enable this when necessary.
			</p>
		{/if}
	</div>
</HeavyBorderBox>
<HeavyBorderBox>
	<h4>Reconfiguration rules</h4>
	{#if selected.name === 'No strategy'}
		<AlertText
			>Using a reconfiguration strategy is recommended. Projects with no strategy will appear risky
			to contributors.</AlertText
		>
	{/if}
	{#each strategies as strategy}
		<ReconBox
			selected={strategy.name === selected.name}
			on:click={() => selectBallotStrategy(strategy)}
		>
			<h3 slot="header">{strategy.name}</h3>
			<p slot="body">{strategy.description}</p>
			<small slot="address">
				{#if isMobile}
					Contract address: <Popover>
						<div slot="content">
							<EtherscanLink truncated={false} type="address" value={strategy.address} />
						</div>
						{getTruncatedAddress(strategy.address)}</Popover
					>
				{:else}
					Contract address: {strategy.address}
				{/if}
			</small>
		</ReconBox>
	{/each}
	<ReconBox
		selected={selected.name === 'custom'}
		on:click={() => selectBallotStrategy({ name: 'custom', address: '' })}
	>
		<!-- TODO Rinkeby should be from signerNetwork -->
		<h3 slot="header">Custom strategy</h3>
		<div slot="body">
			<div class="input">
				<Input
					type="address"
					placeholder={constants.AddressZero}
					bind:value={customBallotAddress}
				/>
			</div>
			<p>
				The address of any smart contract deployed on Rinkeby that implements
				<ExternalLink
					href="https://github.com/jbx-protocol/juice-contracts-v1/blob/main/contracts/FundingCycles.sol"
				>
					this interface.
				</ExternalLink>
			</p>
		</div>
	</ReconBox>
</HeavyBorderBox>
<Button {disabled} on:click={onSaveRules}>Save rules</Button>

<style>
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}

	.info {
		color: var(--text-warn);
	}

	.option {
		margin-bottom: 20px;
	}

	[slot='body'],
	[slot='body'] p {
		color: var(--text-primary);
	}

	[slot='address'] {
		color: var(--text-tertiary);
		font-weight: 300;
	}

	.input {
		width: 100%;
		max-width: 400px;
	}
</style>
