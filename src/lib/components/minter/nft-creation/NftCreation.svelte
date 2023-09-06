<script lang="ts">
	import Button, { ButtonType } from '$lib/components/Button.svelte';
	import FormInput from '$lib/components/minter/form/FormInput.svelte';
	import {
		BoostType,
		type Attributes,
		type NftConfig,
		type AttrModification,
	} from '$models/minter/nft-config';
	import Modal, { bind, type ModalType } from '$lib/components/Modal.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import { formattedNum } from '$utils/formatNumber';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import AdvancedArrow from '../advanced-arrow/AdvancedArrow.svelte';
	import EditPropertiesModal from '../edit/EditPropertiesModal.svelte';
	import EditSimpleAdditionalSettings from '../edit/EditSimpleAdditionalSettings.svelte';
	/*
	TODO: Tooltip text
	*/
	export let advancedMode: boolean = false;
	export let errors;
	export let form: NftConfig;
	export let attrModification: AttrModification;
	export let handleChange: (event: Event) => any;
	export let keepDescription: boolean;
	export let keepLink: boolean;
	export let addDisabled = false;
	export let options: {
		nameFieldPopover?: string;
		nameFieldDescription?: string;
		submitButtonText?: string;
		submitButtonType?: ButtonType;
		totalSupplyPopover?: string;
		totalSupplyDescription?: string;
	} = {};
	export let showOptions: { [key: string]: boolean } = {
		properties: true,
		keepDescription: true,
		keepLink: true,
		supply: true,
	};
	export let onAdvanced = null;

	const updateProperties = (attributes: Attributes) => {
		form.attributes = attributes;
	};

	let modal: ModalType;
	const openPropertiesModal = () => {
		modal = bind(EditPropertiesModal, {
			saveData: updateProperties,
			attributes: form.attributes,
		});
	};

	$: propertiesAdded =
		form.attributes?.properties.length > 0 ||
		form.attributes?.levels.length > 0 ||
		form.attributes?.stats.length > 0 ||
		form.attributes?.boosts.length > 0;
</script>

<span class="required-fields"><small>*</small> Required fields</span>
<span id="name-wrap">
	<FormInput
		id="name"
		label="Name"
		info={options.nameFieldPopover ||
			"This will be displayed in marketplaces and wallets as your NFT's name."}
		name="name"
		placeholder="Item name"
		description={options.nameFieldDescription ||
			'The name of your NFT in marketplaces and wallets.'}
		error={errors.name}
		on:change={handleChange}
		bind:value={form.name}
	/>
</span>
{#if showOptions.supply}
	<span id="totalSupply-wrap">
		<FormInput
			id="totalSupply"
			label="Supply"
			info={options.totalSupplyPopover || 'The number of copies of this NFT which can be minted.'}
			name="totalSupply"
			placeholder="10"
			description={options.totalSupplyDescription ||
				'The number of NFTs that can be minted. Helpful to create a unique NFT id with the same content.'}
			required={true}
			error={errors.totalSupply}
			on:change={handleChange}
			bind:value={form.totalSupply}
			type="number"
		/>
	</span>
{/if}

<slot />
{#if advancedMode}
	<span id="description-wrap">
		<Textarea
			id="description"
			info="Describe or add context to your NFT. This will be displayed in marketplaces and wallets."
			label="Description"
			placeholder="Provide a detailed description of your NFT. This description will be displayed on marketplaces and wallets."
			maxlength={1000}
			rows="4"
			on:change={handleChange}
			bind:value={form.description}
		/>
		{#if showOptions.keepDescription}
			<div class="checkbox">
				<Checkbox bind:checked={keepDescription} />
				Use description for each subsequent created NFT
			</div>
		{/if}
	</span>
	<span id="externalLink-wrap">
		<FormInput
			id="externalLink"
			label="External link"
			info="Link to your NFT's website, a social media profile, or something else."
			name="externalLink"
			placeholder="https://yoursite.io/stuff/111"
			description="Link to any website."
			on:change={handleChange}
			bind:value={form.externalLink}
		/>
		{#if showOptions.keepLink}
			<div class="checkbox">
				<Checkbox bind:checked={keepLink} />
				Use link for each subsequent created NFT
			</div>
		{/if}
	</span>
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
	<span id="properties-wrap">
		{#if showOptions.properties}
			<h3>Properties</h3>
			{#if form.attributes?.properties.length > 0}
				<div class="modal-info">
					Properties:
					{#each form.attributes?.properties as property}
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
			{#if form.attributes?.levels.length > 0}
				<div class="modal-info">
					Levels:
					{#each form.attributes?.levels as level}
						<div class="level-container">
							<span>{level.name}:</span>
							<span class="value">{formattedNum(level.value)} of {formattedNum(level.max)}</span>
						</div>
					{/each}
				</div>
			{/if}
			{#if form.attributes?.stats.length > 0}
				<div class="modal-info">
					Stats:
					{#each form.attributes?.stats as stat}
						<div class="level-container">
							<span>{stat.name}:</span>
							<span class="value">{formattedNum(stat.value)} of {formattedNum(stat.max)}</span>
						</div>
					{/each}
				</div>
			{/if}
			{#if form.attributes?.boosts.length > 0}
				<div class="modal-info">
					Boosts:
					{#each form.attributes?.boosts as boost}
						<div class="level-container">
							<span>{boost.name}:</span>
							<span class="value">
								{formattedNum(boost.value)}{boost.type === BoostType.percentage ? '%' : ''}
							</span>
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
					{propertiesAdded ? 'Edit' : 'Add'}
				</Button>
			</div>
		{/if}
	</span>

	<span id="additional-settings-wrap">
		<h3>Additional Settings</h3>
		<EditSimpleAdditionalSettings bind:freeze={form.freezeMetadata} bind:attrModification />
	</span>
{/if}
<AdvancedArrow bind:advancedMode id="advanced" onChange={onAdvanced} />
<div class="add-button-container">
	<Button
		buttonProps={{ type: 'submit', id: 'submit' }}
		disabled={!form.totalSupply || addDisabled}
		size="md"
		type={options.submitButtonType}
	>
		{options.submitButtonText || 'Add'}
	</Button>
</div>

<Modal
	on:close={() => {
		modal = undefined;
	}}
	show={modal}
/>

<style lang="scss" scoped>
	@import './nftCreation.scss';
</style>
