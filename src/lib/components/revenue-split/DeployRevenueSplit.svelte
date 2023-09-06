<script lang="ts">
	import { deepCopy, isAddress } from 'ethers/lib/utils';
	import { createEventDispatcher } from 'svelte';
	import { getRevenueSplitIssues, hasRevenueSplitIssues } from '$utils/deployRevenueSplitHelpers';
	import { connectedAccount, readNetwork } from '$stores/web3';
	import { deployMixedPaymentSplitter } from '$utils/web3/deployerWrapper';
	import { contracts } from '$utils/web3/contractMap';
	import { updateRevenueSplit } from '$utils/users/revenueSplitsHelpers';
	import Button from '../Button.svelte';
	import InfoBox from '../InfoBox.svelte';
	import { bind, openModal } from '../Modal.svelte';
	import DeploymentModal from '../DeploymentModal';
	import type { RevenueSplit } from '$models/user/revenue-splits';
	import type { ContractTransaction } from 'ethers';

	export let title: string;
	export let split: RevenueSplit;

	const dispatch = createEventDispatcher();
	let jbDirectory = '';
	let contractTransaction: ContractTransaction;

	const getJBDirectory = async () => {
		try {
			const contract = await contracts.juicebox3[$readNetwork.alias].JBDirectory();
			jbDirectory = contract.address;
		} catch (error) {
			return Promise.reject(error);
		}
	};

	const getSignature = async () => {
		const payees = split.recipients.filter((r) => isAddress(r.address));
		const projects = split.recipients.filter((r) => !isAddress(r.address));
		const shares = [...payees, ...projects];

		const splitName = split.name;
		// TODO: If split is mutable should owner be split.controllingAddress?
		const owner = $connectedAccount;
		try {
			contractTransaction = await deployMixedPaymentSplitter(
				'daolabs',
				splitName,
				payees.map((r) => r.address),
				projects.map((r) => Number(r.address)),
				shares.map((r) => r.percent * 10000),
				jbDirectory,
				owner,
			);
		} catch (error) {
			return Promise.reject(error);
		}
	};

	const deploySplit = async () => {
		try {
			const receipt = await contractTransaction.wait();
			const { contractType, contractAddress } = receipt.events.filter(
				(e) => e.event === 'Deployment',
			)[0].args;

			split.address = contractAddress;
			split.network = $readNetwork.alias;
			split.deployedAt = Date.now();

			return await Promise.resolve(
				console.log(
					`Split has been deployed: ${String(contractType)} on ${String(contractAddress)}`,
				),
			);
		} catch (error) {
			return Promise.reject(error);
		}
	};

	const saveChanges = async () => {
		const deployed = deepCopy(split);
		await updateRevenueSplit(deployed);
		dispatch('deploy', { deployed });
		return Promise.resolve();
	};

	const openDeplaySplitModal = () => {
		openModal(
			bind(DeploymentModal, {
				actions: {
					0: getJBDirectory,
					1: getSignature,
					2: deploySplit,
					3: saveChanges,
				},
				steps: [
					{
						label: 'Getting JBDirectory address',
						description: 'Used to map projects to an address',
						descriptionIcon: 'ethereum',
						time: '5 seconds',
					},
					{
						label: 'Awaiting signature',
						description: 'Open MetaMask and confirm the transaction',
						descriptionIcon: 'metamask',
						time: '1 minute',
					},
					{ label: 'Deploying Revenue Split', time: '2 minutes' },
					{ label: 'Saving changes', time: '5 seconds' },
				],
			}),
		);
	};

	$: disabled = hasRevenueSplitIssues(split);
	$: issuesList = getRevenueSplitIssues(split);
	$: network = split && split.network ? split.network : $readNetwork.alias;
</script>

<div class="box">
	<h4>{title}</h4>
	<InfoBox>
		{#if disabled}
			<p>Fix the following issues to deploy:</p>
			<ul>
				{#each issuesList as issue}
					<li>{issue}</li>
				{/each}
			</ul>
		{:else}
			<p>You can now deploy your Revenue split to the Ethereum blockchain.</p>
		{/if}
	</InfoBox>
	<Button
		{disabled}
		size="md"
		type="tertiary"
		buttonProps={{ type: 'button' }}
		on:click={openDeplaySplitModal}>Deploy to {network}</Button
	>
</div>

<style>
	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	h4 {
		font-weight: 400;
		color: var(--text-header);
		margin-bottom: 0;
	}
</style>
