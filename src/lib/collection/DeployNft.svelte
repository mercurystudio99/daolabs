<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import DeploymentModal from '$lib/components/DeploymentModal';

	import {
		getCollectionIssues,
		hasCollectionIssues,
		getDeploymentPipelineForCollection,
	} from '$utils/deployCollectionHelpers';
	import { createCustomNotification } from '$utils/notification';
	import type { Collection } from '$models/minter/collection-config';

	export let collection: Collection;
	export let saveCollection: (form: Collection) => Promise<void>;

	async function updateCollection(modifiedCollection: Collection) {
		try {
			await saveCollection(modifiedCollection);
		} catch (error) {
			console.warn(error);
			createCustomNotification({
				type: 'error',
				message: 'Error saving collection with deploy data.',
				autoDismiss: 3000,
			});
			return Promise.reject('Error saving collection with deploy data.');
		}
	}

	$: disabled = hasCollectionIssues(collection);
	$: issueTextList = getCollectionIssues(collection);
	$: pipeline = !disabled && getDeploymentPipelineForCollection(collection, updateCollection);

	function openDeployModal() {
		openModal(
			bind(DeploymentModal, {
				actions: pipeline.actions,
				steps: pipeline.steps,
			}),
		);
	}
</script>

<div class="box">
	<h4>Deploy</h4>
	<InfoBox>
		{#if disabled}
			<p>Fix the following issues to deploy:</p>
			<ul>
				{#each issueTextList as issueText}
					<li>{issueText}</li>
				{/each}
			</ul>
		{:else}
			<p>You can now deploy your NFT to the Ethereum blockchain.</p>
			<p>
				Before deploying, double check that your NFT looks the way you expect and that you've
				provided all the information you want available to your end user.
			</p>
		{/if}
	</InfoBox>
	<Button {disabled} size="md" type="tertiary" on:click={openDeployModal}
		>Deploy NFT contract 🚀</Button
	>
</div>

<style>
	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	h4 {
		font-size: 16px;
		font-weight: 400;
		color: var(--text-header);
		margin-bottom: 0;
	}

	ul {
		color: var(--text-warn);
	}
</style>
