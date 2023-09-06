<script context="module" lang="ts">
	import { isAddress } from 'ethers/lib/utils';
	import { getProjectEventsById } from '$data/event';

	export async function getPayoutAddress(
		value: string,
		projectValue: string,
		projectPlatform: ProjectPlatform,
	) {
		if (isAddress(value)) {
			return value;
		}

		if (!projectValue && !projectPlatform) {
			return;
		}

		// Check project has payer address
		const projectId = Number(projectValue);
		if (projectId) {
			let events = await getProjectEventsById(
				projectPlatform,
				projectId,
				'deployETHERC20ProjectPayerEvent',
			);
			if (
				events?.length > 0 &&
				events[0].deployETHERC20ProjectPayerEvent &&
				isAddress(events[0].deployETHERC20ProjectPayerEvent.address)
			) {
				return events[0].deployETHERC20ProjectPayerEvent.address;
			}
		}

		return projectValue;
	}
</script>

<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { connectedAccount } from '$stores/web3';
	import { getProjectMetadata, myProjectsQuery } from '$data/project';
	import Button from '$lib/components/Button.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import ProjectWarningModal from '$lib/components/ProjectWarningModal.svelte';
	import ProjectSearchModal from '$lib/components/ProjectSearchModal.svelte';
	import FormError from '$lib/components/minter/form/FormError.svelte';
	import FormInput from './minter/form/FormInput.svelte';
	import Modal, { bind } from './Modal.svelte';
	import type { ProjectV2 } from '$models/subgraph-entities/vX/project';
	import type { ProjectPlatform } from '$constants/platform';

	export let error: string = '';
	export let label = 'Payout address';
	export let value: string | undefined = undefined;
	export let projectValue: string | undefined = undefined;
	export let projectPlatform: ProjectPlatform | undefined = undefined;
	export let refresh = true;

	type ProjectOption = {
		label: string;
		value: string;
		platform: ProjectPlatform;
	};

	const dispatch = createEventDispatcher();

	let loading = false;
	let projectOptions: ProjectOption[] = [];
	let nestedModal;

	const addProjectFromSearch = async (project: ProjectV2) => {
		if (project.handle) {
			value = `@${project.handle}`;
		} else {
			const metadata = await getProjectMetadata(project.metadataUri);
			value = metadata.name;
		}
		projectValue = `${project.projectId}`;
	};

	const handleAddressSelect = ({ detail }) => {
		if (detail.value === 'create') {
			value = '';
			nestedModal = bind(ProjectWarningModal);
			dispatch('select', 'createProject');
		} else if (detail.value === 'search') {
			value = '';
			nestedModal = bind(ProjectSearchModal, {
				addPayoutAddress: (address: string) => {
					value = address;
				},
				addProject: addProjectFromSearch,
				close: () => {},
			});
			dispatch('select', 'searchProject');
		} else {
			projectValue = detail.value;
			const option = projectOptions.find((o) => o.value === detail.value);
			value = option.label;
			projectPlatform = option.platform;
		}
	};

	const fetchProjectsData = async () => {
		loading = true;
		try {
			const projects = await myProjectsQuery('daolabs', $connectedAccount);
			const createOption = {
				label: 'Create a new treasury',
				value: 'create',
			};
			const searchOption = {
				label: 'Enter other treasury',
				value: 'search',
			};
			const options = [];
			for await (const project of projects) {
				if (project.handle) {
					options.push({
						label: `@${project.handle}`,
						value: project.projectId,
						platform: project.platform,
					});
				} else {
					const metadata = await getProjectMetadata(project.metadataUri);
					options.push({
						label: metadata.name,
						value: project.projectId,
						platform: project.platform,
					});
				}
			}
			options.sort((a, b) => {
				if (a.label.toUpperCase() < b.label.toUpperCase()) {
					return -1;
				}
				return 1;
			});
			options.push(createOption);
			options.push(searchOption);
			projectOptions = options;
		} catch (e) {
			console.log(e);
		}
		loading = false;
	};

	onMount(async () => {
		await fetchProjectsData();
		if (!isAddress(value)) {
			const option = projectOptions.find((o) => o.value === value);
			value = option?.label;
			projectPlatform = option?.platform;
			projectValue = value;
		}
	});
</script>

{#if loading}
	<div class="loading-wrap">
		<Loading fullWidth />
	</div>
{:else}
	<FormInput
		id="address"
		{label}
		info="Ethereum address or Juicebox project to receive your collection's earnings."
		placeholder="Address or Juicebox project."
		description="Choose an Ethereum address or a Juicebox project to recieve your collection's earnings."
		required={true}
		on:select={handleAddressSelect}
		dropdownOptions={projectOptions}
		classes=""
		bind:value
	/>
	<FormError {error} />
	{#if refresh}
		<div class="refresh">
			<Button size="md" fullWidth={true} type="secondary" on:click={fetchProjectsData}>
				Refresh Projects
			</Button>
		</div>
	{/if}
{/if}

<Modal show={nestedModal} />

<style>
	.refresh {
		margin-top: 16px;
		margin-bottom: 16px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--stroke-tertiary);
	}
</style>
