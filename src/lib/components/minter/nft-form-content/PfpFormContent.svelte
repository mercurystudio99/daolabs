<script lang="ts">
	import { flip } from 'svelte/animate';
	import { createForm } from 'svelte-forms-lib';
	import Button from '$lib/components/Button.svelte';
	import Modal, { bind, openModal } from '$lib/components/Modal.svelte';
	import Icon from '$lib/components/Icon';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { generateId } from '$lib/utils/generateId';
	import { getErrorList } from '$lib/utils/getErrorList';
	import {
		initialPfpAttribute,
		NftStatus,
		type PfpAttribute,
		type PfpNftConfig,
	} from '$models/minter/nft-config';
	import { pfpAttributeValidationSchema } from '$models/minter/validation-schemas/pfp-validation';
	import { deepCopy } from '$utils/object';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import touchHelperDirective from '$utils/touchHelper';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import ClosableInfoBox from '../closable-info-box/ClosableInfoBox.svelte';
	import DraggableListItem from '../draggable-list-item/DraggableListItem.svelte';
	import FormErrorModal from '../modal/FormErrorModal.svelte';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import EditPfpAttribute from '../edit/EditPfpAttribute.svelte';
	// import DefaultColorBlock from '../form-block/DefaultColorBlock.svelte';
	import PfpAttributeFormContent from './PfpAttributeFormContent.svelte';
	import PfpMultipleAttributeUpload from './PfpMultipleAttributeUpload.svelte';
	import type { Unsubscriber } from 'svelte/store';
	/*
	TODO: Tooltip text

	Long term rewrite this, the deepcopying to last element to get around how lifecycle works... no.
	*/
	export let form: PfpNftConfig;
	export let handleChange: (event: Event) => any;
	export let nested = false;

	export let uploadLoading = false;
	let savedAttributes: PfpAttribute[];
	let hovering: number;

	let showMultipleUpload = false;
	let showForm = !nested;
	let unsubscribe: Unsubscriber;

	$: {
		savedAttributes = form?.layers?.filter((layer) => layer._status === NftStatus.SAVED);
	}

	function valuesEmpty(values: PfpAttribute) {
		return Object.values(values).every((value: string) => ['', false, 0, []].includes(value));
	}

	// for changes detection modal
	const {
		handleSubmit,
		handleReset,
		form: attributeForm,
		errors: attributeErrors,
	} = createForm<PfpAttribute>({
		initialValues: initialPfpAttribute,
		onSubmit: () => {
			$attributeForm._id = generateId();
			$attributeForm._status = NftStatus.SAVED;
			$attributeForm.name = $attributeForm.name.replace(/[-_]/g, ' ').replace(/ +/g, ' ');
			showForm = false;
			unsubscribe();
			handleReset();
			form = form;
		},
		validationSchema: pfpAttributeValidationSchema,
	});

	const connectForms = () =>
		attributeForm.subscribe((values) => {
			form.layers[form.layers.length - 1] = deepCopy(values);
			form = form;
		});

	unsubscribe = !nested ? connectForms() : undefined;

	const createNewForm = () => {
		const lastIndex = form.layers.length - 1;
		// check if there is an initial state
		if (!(lastIndex >= 0 && valuesEmpty(form.layers[lastIndex]))) {
			form.layers.push(deepCopy(initialPfpAttribute));
		}
		showForm = true;
		unsubscribe = connectForms();
	};

	const cancelForm = () => {
		showForm = false;
		form.layers.pop();
	};

	let errorList;
	attributeErrors.subscribe((value) => {
		const imageErrors = getErrorList(value, { IpfsHash: 'Image' });
		if (imageErrors.length > 0) {
			if (nested) {
				errorList = imageErrors;
			} else {
				openModal(bind(FormErrorModal, { errorList: imageErrors }));
			}
		}
	});

	const updateAttribute = (values: PfpAttribute) => {
		form = {
			...form,
			layers: form.layers.map((attribute) => {
				if (attribute._id === values._id) {
					return values;
				}
				return attribute;
			}),
		};
	};

	let showAttributeEdit;
	const openAttributeEditModal = (attribute: PfpAttribute) => {
		if (nested) {
			showAttributeEdit = attribute;
		} else {
			openModal(bind(EditPfpAttribute, { attribute, updateAttribute, close: () => {} }));
		}
	};

	const updateAttributeOrder = (list: PfpAttribute[]) => {
		form = {
			...form,
			layers: [...list],
		};
	};

	const deleteAttribute = (index: number) => {
		const layers = [...form.layers.slice(0, index), ...form.layers.slice(index + 1)];
		form = {
			...form,
			layers,
		};
	};

	// function deleteAllAttributes() {
	// 	form = {
	// 		...form,
	// 		layers: [],
	// 	};
	// }

	function sendDown(index: number) {
		form.layers = [
			...form.layers.slice(0, index),
			form.layers[index + 1],
			form.layers[index],
			...form.layers.slice(index + 2),
		];
	}
</script>

<h4>
	<PopInfo message="Tooltip info">Attributes</PopInfo>
</h4>
<InfoBox classes="smMargin">
	<p>
		Add the attributes which comprise the components of your generative media. Manually enter the
		attribute layer, then upload the files comprising of a specific property, and constrain
		properties to a fixed number or percentage.
	</p>
</InfoBox>
{#if savedAttributes.length > 0}
	<ClosableInfoBox
		info="Attributes will be used without constraint unless you set a limiter such as used n times or use 1%."
		classes="margin"
		id="pfp-attributes-info"
	/>
	<div class="attributes" use:touchHelperDirective>
		{#each savedAttributes as attribute, index (attribute._id)}
			{@const isLast = index === savedAttributes.length - 1}
			<div animate:flip>
				<DraggableListItem
					{index}
					bind:list={savedAttributes}
					updateOrder={updateAttributeOrder}
					bind:hovering
				>
					<div
						class="attribute"
						class:is-active={hovering === index}
						on:dblclick={() => openAttributeEditModal(attribute)}
					>
						<span>{index + 1}</span>
						<div class="info">
							<SeemlessInput bind:value={attribute.name} />
							<span class="property-count">
								{attribute.properties.length} properties
							</span>
						</div>
						{#if !isLast}
							<div class="orderingIcon" on:click={() => sendDown(index)} on:keydown>
								<Icon name="arrowRight" direction="e" />
							</div>
						{/if}
						<CloseButton
							size="0.5rem"
							position="8px"
							color="--icon-action-primary"
							on:click={() => deleteAttribute(index)}
						/>
					</div>
				</DraggableListItem>
			</div>
		{/each}
	</div>
{/if}
{#if showForm}
	<PfpAttributeFormContent
		{handleChange}
		bind:attributeForm={$attributeForm}
		bind:uploadLoading
		errors={$attributeErrors}
	/>
{/if}
<div class="row-20">
	<Button
		buttonProps={{ type: 'button', id: 'single-add' }}
		type={showForm && $attributeForm?.name && $attributeForm?.properties?.length
			? 'primary'
			: 'tertiary'}
		fullWidth
		on:click={showForm ? handleSubmit : createNewForm}
		size="md"
		disabled={showForm && uploadLoading}
	>
		{showForm ? 'Save attribute' : 'Add attribute'}
	</Button>
	{#if showForm}
		<Button
			buttonProps={{ type: 'button', id: 'cancel' }}
			type="secondary"
			fullWidth
			on:click={cancelForm}
			size="md"
		>
			Cancel
		</Button>
	{/if}
</div>
<br />
<br />
<InfoBox classes="smMargin">
	<p>
		Or, add a directory of directories of attributes. Either append the order of the directory in
		the <b>directory name</b>, e.g. "1_Background", "2_Body"... and wait for the upload to complete
		for the sorting to take place, or reorder in the interface after upload. Property constraint can
		be set by either prepending
		<code>[propertyName]_c_[value]</code> for a fixed number, or
		<code>[propertyName]_p_[value]</code>
		for a percentage, on the <b>property filename</b>. E.g. "Black_p_25.png" will constrain the
		"Black" property to 25% of the population.
	</p>
</InfoBox>
{#if showMultipleUpload}
	<div class="multiple-upload">
		<PfpMultipleAttributeUpload bind:form bind:uploadLoading />
		<br />
	</div>
{/if}
<Button
	buttonProps={{ type: 'button', id: 'multi-add' }}
	type="tertiary"
	size="md"
	on:click={() => (showMultipleUpload = !showMultipleUpload)}
	disabled={showMultipleUpload && uploadLoading}
	>{showMultipleUpload ? 'Hide upload' : 'Add directory of attributes'}</Button
>
<br />
<br />

{#if nested}
	<Modal
		on:close={() => {
			showAttributeEdit = undefined;
		}}
		show={showAttributeEdit &&
			bind(EditPfpAttribute, { attribute: showAttributeEdit, updateAttribute, close: () => {} })}
	/>
	<Modal
		on:close={() => {
			errorList = undefined;
		}}
		show={errorList &&
			bind(FormErrorModal, {
				errorList,
			})}
	/>
{/if}

<style lang="scss">
	h4 {
		color: var(--text-header);
	}

	p {
		color: var(--text-secondary);
		font-weight: 300;
	}

	.orderingIcon {
		position: absolute;
		right: 7px;
		top: 22px;
		stroke-width: 10px;
		stroke: var(--icon-action-secondary);
		fill: var(--icon-action-secondary);
		cursor: pointer;
	}

	.orderingIcon:hover {
		transform: scale(1.1);
	}

	.multiple-upload {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.attributes {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 16px;
		cursor: grab;

		.attribute {
			border: 1px solid var(--stroke-secondary);
			padding: 4px 16px;
			position: relative;
			display: flex;
			gap: 8px;
			background-color: var(--background-l0);
			color: var(--text-action-primary);

			&:hover {
				border: 1px solid var(--stroke-action-primary);
			}
			.info {
				display: flex;
				flex-direction: column;
				.property-count {
					font-size: 12px;
					font-weight: 300;
					color: var(--text-secondary);
				}
			}
		}
	}
	.row-20 {
		display: flex;
		gap: 20px;
	}
</style>
