<script lang="ts">
	import { isAddress } from 'ethers/lib/utils';
	import AddRevenueSplitModal from '$lib/components/AddRevenueSplitModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import Expandable from '$lib/components/Expandable.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import Input from '$lib/components/Input.svelte';
	import FormErrorModal from '$lib/components/minter/modal/FormErrorModal.svelte';
	import SeemlessInput from '$lib/components/minter/seemless-input/SeemlessInput.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import { deepCopy } from '$utils/object';
	import DeployRevenueSplit from '$lib/components/revenue-split/DeployRevenueSplit.svelte';
	import { generateId } from '$lib/utils/generateId';
	import { connectedAccount } from '$stores/web3';
	import type { RevenueRecipient, RevenueSplit } from '$models/user/revenue-splits';

	export let shown: boolean;
	export let split: RevenueSplit;
	export let saveSplits: (split: RevenueSplit) => Promise<void>;

	let mutable = false;
	let total: number;
	const initialState = split ? deepCopy(split) : null;
	const saveSplit = (_split: RevenueSplit) => {
		split = _split;
	};

	const openAddModal = () => {
		openModal(bind(AddRevenueSplitModal, { userSplit: split, saveSplit, close: () => {} }));
	};

	const handleEdit = (index: number) => {
		openModal(
			bind(AddRevenueSplitModal, {
				userSplit: split,
				saveSplit,
				currentIndex: index,
				edit: true,
				close: () => {},
			}),
		);
	};

	const removeRecipient = (index: number) => {
		split.recipients.splice(index, 1);
		split = split;
	};

	const calculateTotal = (recipients: RevenueRecipient[]) =>
		recipients.reduce((acc, recipient) => {
			acc += Number(recipient.percent);
			return acc;
		}, 0);

	let csvContent = 'address,percentage';
	let file: HTMLInputElement;
	const parseCsv = () => {
		const rows = csvContent.split('\n');
		const valueRows = rows.splice(1);
		const recipientData = valueRows.map((value) => value.split(','));
		const recipients: RevenueRecipient[] = [];
		recipientData.forEach((data) => {
			if (data.length === 2) {
				recipients.push({ address: data[0], percent: Number(data[1]) });
			}
		});
		split = split
			? { ...split, recipients }
			: { name: recipients[0]?.address, recipients, id: '', creator: '', createdBy: 'user' };
	};
	const uploadTemplate = () => {
		file.click();
	};
	const handleUpload = (event: Event) => {
		const inputTarget = event.target as HTMLInputElement;
		if (inputTarget && inputTarget.files?.length === 1) {
			const reader = new FileReader();
			reader.readAsText(inputTarget.files[0]);
			reader.onload = (e) => {
				csvContent = e.target.result as string;
				parseCsv();
			};
		}
	};

	const saveChanges = async () => {
		if (!split) return;
		if (!split.controllingAddress && total !== 100) {
			openModal(bind(FormErrorModal, { errorList: [{ field: 'Total', message: 'Must be 100' }] }));
			return;
		}
		if (!split.name) {
			split.name = split.recipients[0].displayName || split.recipients[0].address;
		}
		split.id = split.id || generateId();
		split.creator = $connectedAccount;
		split.createdBy = split.createdBy || 'user';

		await saveSplits(split);
		shown = false;
	};

	const handleSplitDeployment = async ({ detail }: CustomEvent<{ deployed: RevenueSplit }>) => {
		await saveSplits(detail.deployed);
		shown = false;
	};
	$: changed = JSON.stringify(initialState) !== JSON.stringify(split);
	$: saveButtonDisabled = !changed;
	$: total = split && split.recipients ? calculateTotal(split.recipients) : 0;
</script>

<Drawer bind:shown>
	<section>
		<h2>Revenue split</h2>
		<HeavyBorderBox>
			<div class="box">
				<h4>Revenue split details</h4>
				<p>
					Revenue split gives you the ability to add additional recipients to your NFT sales. These
					recipients can be contributors, collaborators or donation-based to receive a portion of
					revenue from existing and future projects.
				</p>
				{#if split}
					<div class="split">
						<SeemlessInput bind:value={split.name} />
						{#each split.recipients as recipient, index}
							<div class="recipient" on:click={() => handleEdit(index)} on:keydown>
								<span>
									{#if isAddress(recipient.address)}
										<EnsOrAddress address={recipient.address} />
									{:else}
										{recipient.displayName}
									{/if}
								</span>
								<span>{recipient.percent}%</span>
								<div class="delete">
									<CloseButton
										size="8px"
										position="0"
										on:click={() => removeRecipient(index)}
										color="--text-action-primary"
									/>
								</div>
							</div>
						{/each}
						<div
							class="progress-bar"
							style="--color: {total >= 50 ? 'var(--stroke-action-primary)' : 'var(--stroke-warn)'}"
						>
							<div class="bar">
								<ProgressBar percentage={total} />
							</div>
							<div class="description">
								<span>{total}% allocated</span>
								<span>{100 - total}% remaining</span>
							</div>
						</div>
					</div>
				{:else}
					<p>
						Please enter a unique name for your revenue split and define each recipient’s wallet
						address and split amount. The overall split amount must total 100.
					</p>
					<h4>
						<PopInfo message="Tooltip text">Revenue split</PopInfo>
					</h4>
				{/if}
				<Button size="md" type="tertiary" disabled={total == 100} on:click={openAddModal}>
					{split ? 'Add recipient' : 'Add'}
				</Button>
				<div class="expandable">
					<Expandable titleColor="var(--text-header)">
						<div slot="title" class="expandable-title">
							<PopInfo message="Tooltip text">CSV upload</PopInfo>
						</div>
						<p>Paste or upload a CSV. Ownership must add up to 100.</p>
						<Textarea id="tierform-description" bind:value={csvContent} on:blur={parseCsv} />
					</Expandable>
					<Button size="md" type="tertiary" on:click={uploadTemplate}>Upload Split Template</Button>
					<input bind:this={file} type="file" accept=".csv" class="file" on:change={handleUpload} />
				</div>
				<Toggle id="mutable" bind:checked={mutable} disabled>
					<h4>Mutable</h4>
				</Toggle>
				<p>
					Making this split mutable allows it to be modified in the future. Mutability is helpful if
					you know recipients and/or shares must change over time.
				</p>
				{#if mutable}
					<div class="input">
						<label for="controlling-address">
							<PopInfo message="Tooltip info">Controlling address</PopInfo>
						</label>
						<Input
							id="controlling-address"
							type="address"
							placeholder="0x0000...000000"
							styles={{ input: 'background: var(--background-l0)' }}
							bind:value={split.controllingAddress}
						/>
					</div>
					<p>
						The controlling address will be the <a href="/">only account</a> that can make changes
						to this split once it's been created. Make sure this is an EOA or contract (e.g., a
						<a href="/https://gnosis-safe.io">multisig</a>) that can interact with the split
						contract directly. It's generally <a href="/">recommended to make splits immutable</a> unless
						there's a strong need for mutability in the future.
					</p>
				{/if}
				<Button
					size="md"
					type={changed ? 'primary' : 'tertiary'}
					disabled={saveButtonDisabled}
					on:click={saveChanges}
				>
					Save
				</Button>
			</div>
		</HeavyBorderBox>
		{#if split}
			<HeavyBorderBox>
				<DeployRevenueSplit title="Deploy" {split} on:deploy={handleSplitDeployment} />
			</HeavyBorderBox>
		{/if}
	</section>
</Drawer>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		padding: 40px 26px;
		max-width: 650px;

		.box {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 16px;

			p {
				font-weight: 300;
				color: var(--text-secondary);
				margin: 0;
			}

			h4 {
				font-size: 16px;
				font-weight: 400;
				color: var(--text-header);
				margin: 0;
			}

			.input {
				display: flex;
				flex-direction: column;

				label {
					font-size: 14px;
					color: var(--text-header);
					margin-bottom: 8px;
				}
			}

			.expandable {
				display: flex;
				flex-direction: column;
				gap: 8px;

				.expandable-title {
					color: var(--text-header);
				}

				.file {
					display: none;
				}
			}
		}
		h2 {
			font-size: 28px;
			color: var(--text-header);
		}

		.split {
			display: flex;
			flex-direction: column;
			gap: 16px;
			.recipient {
				position: relative;
				display: flex;
				justify-content: space-between;
				cursor: pointer;
				&:hover {
					padding-right: 12px;
					.delete {
						display: block;
					}
				}
				.delete {
					position: absolute;
					right: 0;
					top: 0;
					display: none;
				}
			}
			.progress-bar {
				display: flex;
				flex-direction: column;
				.bar {
					height: 16px;
				}

				.description {
					display: flex;
					justify-content: space-between;
					margin-top: 4px;
					font-size: 12px;
					line-height: 16px;
					color: var(--text-tertiary);
				}
			}
		}
	}
</style>
