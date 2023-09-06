<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import FormInput from '$lib/components/minter/form/FormInput.svelte';
	import {
		BoostType,
		type Attributes,
		type AttrModification,
		type BasicNftConfig,
		isAdvancedNft,
	} from '$models/minter/nft-config';
	import Modal, { bind, type ModalType } from '$lib/components/Modal.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import { formattedNum } from '$utils/formatNumber';
	import AdvancedArrow from '../advanced-arrow/AdvancedArrow.svelte';
	import EditSimpleAdditionalSettings from './EditSimpleAdditionalSettings.svelte';
	import EditPropertiesModal from './EditPropertiesModal.svelte';
	/*
	TODO: Tooltip text
	*/
	export let advancedMode: boolean = false;
	export let errors: { [key: string]: string } = {};
	export let form: BasicNftConfig;
	export let attrModification: AttrModification = undefined;
	export let handleChange: (event: Event) => any = () => {};
	export let showOptions: { [key: string]: boolean } = { properties: true, supply: true };

	let formModal: ModalType;
	const updateProperties = (attributes: Attributes) => {
		form.attributes = attributes;
	};

	const openPropertiesModal = () => {
		formModal = bind(EditPropertiesModal, {
			saveData: updateProperties,
			attributes: form.attributes,
			close: () => {},
		});
	};

	$: propertiesButtonText =
		form.attributes.properties.length > 0 ||
		form.attributes.levels.length > 0 ||
		form.attributes.stats.length > 0 ||
		form.attributes.boosts.length > 0
			? 'Edit'
			: 'Add';
</script>

<FormInput
	id="name"
	label="Name"
	info="Tooltip text"
	name="name"
	placeholder="Item name"
	description="Your NFT’s name, if left blank then the supply count will be used."
	error={errors.name}
	on:change={handleChange}
	bind:value={form.name}
/>
{#if showOptions.supply}
	<FormInput
		id="totalSupply"
		label="Supply"
		info="Tooltip text"
		name="totalSupply"
		placeholder="10"
		description="The number of items that can be minted."
		required={true}
		error={errors.totalSupply}
		on:change={handleChange}
		bind:value={form.totalSupply}
		type="number"
	/>
{/if}
<slot />
{#if advancedMode}
	<Textarea
		id="description"
		info="Tooltip text"
		label="Description"
		placeholder="Provide a detailed description of your item"
		maxlength={1000}
		rows="4"
		on:change={handleChange}
		bind:value={form.description}
	/>
	<FormInput
		id="externalLink"
		label="External link"
		info="Tooltip text"
		name="externalLink"
		placeholder="https://yoursite.io/stuff/111"
		description="Your external link"
		on:change={handleChange}
		bind:value={form.externalLink}
	/>
	<!-- <FormDropdown
		id="blockchain"
		label="Blockchain"
		info="Tooltip text"
		options={[{ label: 'Ethereum', value: 'ethereum' }]}
		disabled={true}
		on:change={handleChange}
		bind:value={form.blockchain}
	/> -->
	<slot name="advanced" />
	{#if showOptions.properties}
		<h3>Properties</h3>
		{#if form.attributes.properties.length > 0}
			<div class="modal-info">
				Properties:
				{#each form.attributes.properties as property}
					<div class="property-container">
						<div class="row">
							<span>Attribute:</span>
							<span class="value">{property.name}</span>
						</div>
						<div class="row">
							<span>Property:</span>
							<span class="value">{property.value}</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
		{#if form.attributes.levels.length > 0}
			<div class="modal-info">
				Levels:
				{#each form.attributes.levels as level}
					<div class="level-container">
						<span>{level.name}:</span>
						<span class="value">{formattedNum(level.value)} of {formattedNum(level.max)}</span>
					</div>
				{/each}
			</div>
		{/if}
		{#if form.attributes.stats.length > 0}
			<div class="modal-info">
				Stats:
				{#each form.attributes.stats as stat}
					<div class="level-container">
						<span>{stat.name}:</span>
						<span class="value">{formattedNum(stat.value)} of {formattedNum(stat.max)}</span>
					</div>
				{/each}
			</div>
		{/if}
		{#if form.attributes.boosts.length > 0}
			<div class="modal-info">
				Boosts:
				{#each form.attributes.boosts as boost}
					<div class="level-container">
						<span>{boost.name}:</span>
						<span class="value"
							>{formattedNum(boost.value)}{boost.type === BoostType.percentage ? '%' : ''}</span
						>
					</div>
				{/each}
			</div>
		{/if}
		<div class="modal-button">
			<Button
				buttonProps={{ type: 'button' }}
				type="tertiary"
				size="md"
				on:click={openPropertiesModal}
			>
				{propertiesButtonText}
			</Button>
		</div>
	{/if}
{/if}
{#if isAdvancedNft(form)}
	<h3>Additional Settings</h3>
	<EditSimpleAdditionalSettings bind:freeze={form.freezeMetadata} bind:attrModification />
{/if}
<AdvancedArrow bind:advancedMode />
<div class="add-button-container">
	<Button buttonProps={{ type: 'submit' }} size="md">Update</Button>
</div>
<Modal
	on:close={() => {
		formModal = undefined;
	}}
	show={formModal}
/>

<style lang="scss">
	.add-button-container {
		display: flex;
		justify-content: flex-end;
	}
	h3 {
		color: var(--text-header);
		font-size: 16px;
		margin-bottom: 16px;
	}

	.modal-button {
		padding-bottom: 16px;
		margin-bottom: 16px;
		border-bottom: 1px solid var(--stroke-tertiary);
		display: flex;
		flex-direction: column;
	}
	.modal-info {
		padding: 8px 12px;
		display: flex;
		flex-direction: column;
		border: 0.4px solid var(--stroke-tertiary);
		margin-bottom: 16px;
		color: var(--text-secondary);

		.property-container {
			font-weight: 300;
			display: flex;
			flex-direction: column;
			padding: 8px 16px;
			border: 0.4px solid var(--stroke-tertiary);
			margin-bottom: 4px;

			&:first-child {
				margin-top: 4px;
			}

			.row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 4px;

				.value {
					flex-basis: 50%;
				}
			}
		}

		.level-container {
			font-weight: 300;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 16px;
			border: 0.4px solid var(--stroke-tertiary);
			margin-bottom: 4px;

			&:first-child {
				margin-top: 4px;
			}

			.value {
				flex-basis: 50%;
			}
		}
	}
</style>
