<script lang="ts">
	import { onMount } from 'svelte';
	import { ethers } from 'ethers';
	import CollapsibleSection from '$lib/create/CollapsibleSection.svelte';
	import { contracts } from '$utils/web3/contractMap';
	import { readNetwork, web3Provider } from '$stores/web3';
	import Icon from '$lib/components/Icon';
	import ContractFunction from './ContractFunction.svelte';
	import type { Contract } from '$models/minter/collection-config';
	import type { AbiType } from './types';

	/**
	 * TODO:
	 * - [ ] Add value to payable functions
	 */

	export let contractInfo: Contract;

	let contract: ethers.Contract;
	let functions: AbiType[];
	let expanded: { [key: AbiType['name']]: boolean | null } = null;
	let showJson: { [key: AbiType['name']]: boolean } = {};

	async function loadFunctions() {
		const actualProvider = web3Provider.get();
		const jsonContract = await contracts.daolabs[readNetwork.get().alias][contractInfo.name]();
		contract = new ethers.Contract(
			contractInfo.address,
			jsonContract.abi,
			actualProvider.getSigner(),
		);
		console.log(contract);
		functions = Object.entries(contract.interface.functions)
			.filter(([, item]) => item.type === 'function')
			.map(([name, item]) => ({
				...item,
				name,
			}))
			.sort((a: AbiType, b: AbiType) => a.name.localeCompare(b.name));

		expanded = functions?.reduce((acc, func) => {
			acc[func.name] = false;
			return acc;
		}, {});
	}

	onMount(() => {
		loadFunctions().catch(console.error);
	});

	async function callContract({ name, args }: { name: string; args: any[] }) {
		return (await contract[name](...args)) as unknown;
	}
</script>

{#if contract}
	{#each functions as func}
		<div class="func">
			<CollapsibleSection bind:expanded={expanded[func.name]} color="var(--text-secondary)">
				<h4 slot="header" class:active={expanded[func.name]}>
					{func.name}
					{#if func.stateMutability !== 'view'}
						<Icon name="pen" />
					{/if}
					{#if expanded[func.name]}
						<button on:click|stopPropagation={() => (showJson[func.name] = !showJson?.[func.name])}>
							<Icon name="codeFile" />
						</button>
					{/if}
				</h4>
				<ContractFunction {func} {callContract} showJson={showJson[func.name]} />
			</CollapsibleSection>
		</div>
	{/each}
{/if}

<style>
	button {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		line-height: 0;
	}

	button:hover {
		transform: scale(1.05);
		animation: wiggle 2s ease-in-out;
		color: var(--icon-action-primary);
		transition: color 0.2s ease-in-out;
	}

	h4 {
		margin: 0;
		margin-left: 0.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		overflow-wrap: anywhere;
		color: var(--text-tertiary);
		transition: color 0.5s ease-in-out;
	}

	h4.active {
		color: var(--text-primary);
	}

	.func {
		margin-bottom: 0.2rem;
	}

	@keyframes -global-wiggle {
		0% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(5deg);
		}
		50% {
			transform: rotate(-5deg);
		}
		75% {
			transform: rotate(3deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
</style>
