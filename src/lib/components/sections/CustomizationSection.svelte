<script lang="ts">
	import EditCollectionCustomization from '$lib/components/minter/edit/EditCollectionCustomization.svelte';
	import Button from '../Button.svelte';
	import Modal, { bind, openModal, type ModalType } from '../Modal.svelte';
	import CollectionSection from './CollectionSection.svelte';

	export let updateCustomization: (colors: string[]) => void;
	export let colors: string[];
	export let readonly = false;
	export let updateNestedModal: (nestedModal: ModalType) => void = null;

	let customizationModal: ModalType;

	const openCustomizationModal = () => {
		const modal = bind(EditCollectionCustomization, {
			saveData: updateCustomization,
			colors: colors,
			close: () => {},
		});

		updateNestedModal ? updateNestedModal(modal) : openModal(modal);
	};

	$: customizationButtonText = colors?.length > 0 ? 'Edit' : 'Add';
</script>

{#if (colors?.length > 0 && readonly) || !readonly}
	<CollectionSection
		title="Collection customization"
		info="Other collection settings displayed while loading your collection on marketplaces."
	>
		{#if colors?.length > 0}
			<div class="modal-info">
				Background:
				<span class="hash">
					{colors.join(', ')}
				</span>
			</div>
		{/if}
		{#if !readonly}
			<Button
				buttonProps={{ type: 'button' }}
				type="tertiary"
				size="md"
				on:click={openCustomizationModal}
			>
				{customizationButtonText}
			</Button>
		{/if}
	</CollectionSection>
{/if}

<Modal
	on:close={() => {
		customizationModal = undefined;
	}}
	show={customizationModal}
	styleInnerContent={{ overflow: 'visible' }}
/>

<style lang="scss">
	.modal-info {
		padding: 8px 12px;
		display: flex;
		flex-direction: column;
		border: 0.4px solid var(--stroke-tertiary);
		color: var(--text-secondary);

		.hash {
			font-weight: 300;
			margin-bottom: 4px;
			word-break: break-all;
		}
	}
</style>
