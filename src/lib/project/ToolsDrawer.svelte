<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { BigNumber, utils } from 'ethers';
	import { connectedAccount } from '$stores/web3';
	import { JUICEBOX_MONEY_METADATA_DOMAIN } from '$constants/v2/metadataDomain';
	import { fromWad, parseWad } from '$utils/formatNumber';
	import { uploadProjectMetadata } from '$utils/ipfs';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import Input from '$lib/components/Input.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { ETH_TOKEN_ADDRESS } from '$constants/v2/juiceboxTokens';
	import DrawerTabs from '$lib/components/DrawerTabs.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import { transferFrom } from '$utils/web3/JBTokenStoreWrapper';
	import { addToBalanceOf } from '$utils/web3/JBETHPaymentTerminal';
	import { safeTransferFrom, setMetadataOf } from '$utils/web3/JBProjects';
	import { getProjectPlatform } from '$lib/projects/data';
	import { projectDataToJson } from '$utils/project';
	import { downloadFileFromString } from '$lib/utils/exportConfig';
	import { projectPlatformWithVersion } from '$constants/platform';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { Roles } from '$models/v2/roles';
	import {
		addProjectRole,
		getUserRoles,
		grantProjectRole,
		listProjectRoles,
		revokeProjectRole,
	} from '$utils/web3/extensions/RoleManager';
	import { web3Transact } from '$lib/transaction';
	import CreatePayableAddress from './CreatePayableAddress.svelte';
	import PayableAddress from './PayableAddress.svelte';
	import ToolsDrawerCollectionTab from './ToolsDrawerCollectionTab.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	export let balance = 0;
	export let token = '';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');

	let projectRoles: string[] = [];

	async function init() {
		projectRoles = await listProjectRoles(
			projectPlatformWithVersion($project.platform, $project.version),
			$project.projectId,
		);
	}
	onMount(init);

	let transferTokenAmount = 0;
	let transferTokenTo: Address;

	let currentTab = 0;
	const tabs =
		$project.projectOwnerAddress.toLowerCase() === $connectedAccount.toLowerCase()
			? ['General', 'Ownership', 'Collections']
			: ['General'];

	// NOTE this will be a big number due to CurrencyInput
	let addToBalanceAmount = BigNumber.from(0);

	async function transfer() {
		const { projectId } = $project;
		const amount = parseWad(transferTokenAmount);
		const txnResponse = await web3Transact(
			'transferFrom',
			transferFrom,
			getProjectPlatform(project),
			$connectedAccount,
			projectId,
			amount,
			transferTokenTo,
		);
		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'transferFrom',
				close: () => {},
			}),
		);
		const txnResult = await txnResponse.wait();
		console.log(txnResult);
	}

	async function addToBalance() {
		const DEFAULT_MEMO = '';
		const { projectId } = $project;

		const DEFAULT_METADATA = [0x1];
		try {
			const txnResponse = await web3Transact(
				'addToBalanceOf',
				addToBalanceOf,
				getProjectPlatform(project),
				projectId,
				addToBalanceAmount,
				ETH_TOKEN_ADDRESS,
				DEFAULT_MEMO,
				DEFAULT_METADATA,
				{
					// Settings gasLimit to 0 so that it will force metamask to handle errors
					// https://github.com/ethers-io/ethers.js/discussions/2149
					gasLimit: 0,
					value: addToBalanceAmount,
				},
			);
			openModal(
				bind(PendingTransaction, {
					txnResponse,
					functionName: 'addToBalanceOf',
					close: () => {},
				}),
			);
			const txnResult = await txnResponse.wait();
			console.log(txnResult);
		} catch (e) {
			console.log(e.message);
		}
	}

	function setMax() {
		transferTokenAmount = Number(fromWad(balance));
	}

	async function transferOwnership() {
		const txnResponse = await web3Transact(
			'safeTransferFrom',
			safeTransferFrom,
			projectPlatformWithVersion($project.platform, $project.version),
			$project.projectOwnerAddress,
			transferTokenTo,
			$project.projectId,
		);
		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'safeTransferFrom',
				close: () => {},
			}),
		);
		await txnResponse.wait();
		$project.projectOwnerAddress = transferTokenTo;
	}
	let archiving = false;
	async function archiveProject() {
		const archived = true;

		if (
			!$connectedAccount ||
			$connectedAccount.toLowerCase() !== $project.projectOwnerAddress?.toLowerCase()
		) {
			return alert('Connected wallet not authorized');
		}
		archiving = true;

		const uploadedMetadata = await uploadProjectMetadata({
			...$project.projectMetadata,
			confetti: $project.confetti,
			collections: $project.collections,
			documents: $project.documents,
			archived,
		});
		if (!uploadedMetadata.IpfsHash) {
			return alert('Failed to update project metadata');
		}
		console.log(uploadedMetadata);

		const txnResponse = await web3Transact(
			'setMetadataOf',
			setMetadataOf,
			getProjectPlatform(project),
			$project.projectId,
			uploadedMetadata.IpfsHash,
			JUICEBOX_MONEY_METADATA_DOMAIN,
		);
		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'setMetadataOf',
				close: () => {},
			}),
		);
		await txnResponse.wait();
		archiving = false;
		location.reload();
	}

	let newRoleAdress = '';
	let newRoleType = '';
	let newUserRoles: string[] = [];
	$: {
		newUserRoles = [];
		if (newRoleAdress && newRoleType) {
			void (async () => {
				const address = newRoleAdress;
				const role = newRoleType;
				const roles: string[] = await getUserRoles(
					projectPlatformWithVersion($project.platform, $project.version),
					$project.projectId,
					newRoleAdress,
				);
				if (newRoleAdress === address && role === newRoleType) {
					newUserRoles = roles;
				}
			})();
		}
	}
	async function addRole() {
		const address = newRoleAdress;
		const role = newRoleType;
		if (!projectRoles.includes(newRoleType)) {
			const txnResponse = await web3Transact(
				'addProjectRole',
				addProjectRole,
				projectPlatformWithVersion($project.platform, $project.version),
				$project.projectId,
				role,
			);
			openModal(
				bind(PendingTransaction, {
					txnResponse,
					functionName: 'addProjectRole',
					close: () => {},
				}),
			);
			const txnResult = await txnResponse.wait();
			console.log(txnResult);
			await init();
		}
		const txnResponse = await web3Transact(
			'grantProjectRole',
			grantProjectRole,
			projectPlatformWithVersion($project.platform, $project.version),
			$project.projectId,
			address,
			role,
		);
		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'grantProjectRole',
				close: () => {},
			}),
		);
		const txnResult = await txnResponse.wait();
		console.log(txnResult);
		newRoleAdress = newRoleType = '';
	}

	async function revokeRole() {
		const address = newRoleAdress;
		const role = newRoleType;
		const currentRoles: string[] = await getUserRoles(
			projectPlatformWithVersion($project.platform, $project.version),
			$project.projectId,
			newRoleAdress,
		);
		if (!currentRoles.includes(newRoleType)) return;
		const txnResponse = await web3Transact(
			'revokeProjectRole',
			revokeProjectRole,
			projectPlatformWithVersion($project.platform, $project.version),
			$project.projectId,
			address,
			role,
		);
		openModal(
			bind(PendingTransaction, {
				txnResponse,
				functionName: 'revokeProjectRole',
				close: () => {},
			}),
		);
		const txnResult = await txnResponse.wait();
		console.log(txnResult);
		newRoleAdress = newRoleType = '';
	}

	const deployProjectPayerHandler = () => {
		openModal(
			bind(CreatePayableAddress, {
				projectId: $project.projectId,
				platform: getProjectPlatform(project),
				close: () => {},
			}),
		);
	};

	$: payableAddresses = $project.events?.filter((event) => event?.deployETHERC20ProjectPayerEvent);
	$: alreadyDeployedProjectPayer = payableAddresses?.findIndex(
		(event) => event?.deployETHERC20ProjectPayerEvent?.caller === $connectedAccount,
	);

	let projectExportFilename = $project.projectMetadata?.name
		?.replace(/[^\w-]+/g, '_')
		.toLowerCase();
	$: projectExportFilename = projectExportFilename
		.replace(/[.]json$/i, '')
		.replace(/[^\w-]+/g, '_');
	function downloadProjectJSON() {
		console.log($project);
		const json = projectDataToJson($project);
		const jsonText = JSON.stringify(json, null, '  ');
		downloadFileFromString(jsonText, 'application/json', `${projectExportFilename}.json`);
	}
</script>

<section>
	<h3><Trans>Tools</Trans></h3>
	<DrawerTabs {tabs} bind:currentTab />

	{#if currentTab === 0}
		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box" style="margin-bottom: 16px;">
				<h4><Trans>Create payable address</Trans></h4>
				{#if payableAddresses?.length}
					<p>
						<Trans
							>A project payer contract has been deployed, your project can directly recieve
							Ethereum.</Trans
						>
					</p>
					{#if payableAddresses.length}
						<!-- Note this is copied in PayableAddressCarouselModal -->
						<Carousel
							items={payableAddresses}
							startIndex={alreadyDeployedProjectPayer > -1 ? alreadyDeployedProjectPayer : 0}
							let:item
							let:index
						>
							<PayableAddress event={item?.deployETHERC20ProjectPayerEvent}>
								<span slot="extra">
									{#if payableAddresses.length > 1}
										<!-- eslint-disable-next-line @typescript-eslint/restrict-plus-operands -->
										{index + 1}/{payableAddresses.length}
									{/if}
									{#if index === alreadyDeployedProjectPayer}
										<Popover message="This address is deployed by you.">
											<Icon name="user" />
										</Popover>
									{/if}
								</span>
							</PayableAddress>
						</Carousel>
					{/if}
				{/if}
				<p>
					<Trans>Create an Ethereum address that can be used to pay your project directly.</Trans>
				</p>
				<div class="button">
					<Button
						type="primary"
						size="md"
						on:click={deployProjectPayerHandler}
						disabled={!$connectedAccount}
					>
						Deploy project payer contract
					</Button>
				</div>
			</div>
		</HeavyBorderBox>

		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box">
				<h4><Trans>Transfer unclaimed {token}</Trans></h4>
				<p><Trans>Your unclaimed token balance: {balance}</Trans></p>

				<label for="amount">Amount</label>
				<span class="input">
					<Input type="number" bind:value={transferTokenAmount} max={Number(fromWad(balance))}>
						<div slot="addon" role="button" on:click={setMax} on:keydown>MAX</div>
					</Input>
				</span>

				<label for="to">Recipient address</label>
				<span class="input">
					<Input
						id="to"
						bind:value={transferTokenTo}
						type="address"
						placeholder="0x0000000000000000000000000000000000000000"
					/>
				</span>

				<div class="button">
					<Button
						type="primary"
						size="md"
						on:click={transfer}
						disabled={!balance || !utils.isAddress(transferTokenTo)}
					>
						>Transfer {token}</Button
					>
				</div>
			</div>
		</HeavyBorderBox>

		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box">
				<h4><Trans>Add to balance</Trans></h4>
				<p><Trans>Add funds to this project's balance without minting tokens.</Trans></p>

				<label for="payAmount">Pay amount</label>
				<div class="input">
					<CurrencyInput
						inputValue={0}
						on:setValue={(value) => {
							addToBalanceAmount = value.detail.value;
						}}
					/>
				</div>
				<div class="button">
					<Button type="primary" size="md" on:click={addToBalance}>Add to balance</Button>
				</div>
			</div>
		</HeavyBorderBox>

		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box">
				<h4><Trans>Export project</Trans></h4>
				<p><Trans>Export project as a JSON file.</Trans></p>

				<label for="payAmount">Filename ({projectExportFilename}.json)</label>
				<div class="input">
					<Input type="text" bind:value={projectExportFilename}>
						<div slot="addon" role="button" on:click={setMax} on:keydown>.json</div>
					</Input>
				</div>
				<div class="button">
					<Button type="primary" size="md" on:click={downloadProjectJSON}>Download</Button>
				</div>
			</div>
		</HeavyBorderBox>
	{:else if currentTab === 1}
		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box">
				<h4><Trans>Transfer ownership</Trans></h4>
				<p>
					<Trans>Current owner: {$project.projectOwnerAddress}</Trans>
				</p>
				<label for="to">Recipient address</label>
				<div class="input">
					<Input
						id="to"
						bind:value={transferTokenTo}
						type="address"
						placeholder="treasury.movedao.eth / 0x0000000000000000000000000000000000000000"
					/>
				</div>
				<div class="button">
					<Button type="primary" size="md" on:click={transferOwnership}>Transfer ownership</Button>
				</div>
			</div>
		</HeavyBorderBox>
		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box">
				<h4><Trans>Archive project</Trans></h4>
				<p>Archiving your project will mean the following:</p>
				<ul>
					<li>Your project will appear as 'archived'.</li>
					<li>Your project can't receive payments through the app.</li>
					<li>
						Unless payments to this project are paused in your cycle's rules, your project can still
						receive payments directly through the Juicebox protocol contracts.
					</li>
				</ul>
				<p>
					Allow a few days for your project to appear in the "archived" projects list on the
					Projects page.
				</p>
				<p>
					<Icon name="exclamationCircle" />
					<Trans>You can unarchive your project at any time.</Trans>
				</p>

				<div class="button">
					<Button type="primary" size="md" on:click={archiveProject} disabled={archiving}>
						{archiving ? 'Archiving project...' : 'Archive project'}
					</Button>
				</div>
			</div>
		</HeavyBorderBox>
		<HeavyBorderBox margin="32px" padding="16px 32px">
			<div class="box">
				<h4>
					<PopInfo message="User-role tooltip">
						<Trans>Add user-role</Trans>
					</PopInfo>
				</h4>
				<p>
					<Trans>Current owner: {$project.projectOwnerAddress}</Trans>
				</p>
				<div class="inputs">
					<div class="input">
						<Input
							bind:value={newRoleAdress}
							type="address"
							placeholder="0x0000000000000000000000000000000000000000"
						/>
					</div>
					<div class="dropdown">
						<Dropdown
							bind:value={newRoleType}
							options={[
								{ label: 'Admin', value: Roles.ADMIN },
								{ label: 'Minter', value: Roles.MINTER },
								{ label: 'Curator', value: Roles.CURATOR },
							]}
							placeholder="Roles"
						/>
					</div>
				</div>
				{#if newUserRoles.includes(newRoleType)}
					<Button type="tertiary" size="md" on:click={revokeRole}>Revoke</Button>
				{:else if projectRoles.includes(newRoleType)}
					<Button type="tertiary" size="md" on:click={addRole}>Grant</Button>
				{:else}
					<Button type="tertiary" size="md" on:click={addRole}>Add</Button>
				{/if}
			</div>
		</HeavyBorderBox>
	{:else if currentTab === 2}
		<ToolsDrawerCollectionTab />
	{/if}
</section>

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

	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;

		.input {
			background-color: var(--background-l0);
			width: 100%;
		}
		// .inputs {
		// 	display: flex;
		// 	gap: 16px;

		// 	.dropdown {
		// 		min-width: 100px;
		// 		flex-shrink: 1;
		// 	}
		// }

		.button {
			display: flex;
			justify-content: flex-end;
		}

		/* .link {
			color: var(--text-action-primary);
		} */

		div[slot='addon'] {
			padding: 0px 5px;
			cursor: pointer;
			color: var(--text-action-primary);
			text-align: center;
			background: var(--background-action-secondary);
			border-radius: var(--radius-sm);
		}
	}
</style>
