<script lang="ts">
	import { flip } from 'svelte/animate';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import {
		initialPfpProperty,
		PfpConstraintType,
		type PfpAttribute,
		type PfpProperty,
	} from '$models/minter/nft-config';
	import { generateId } from '$lib/utils/generateId';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { deepCopy } from '$utils/object';
	import touchHelperDirective from '$utils/touchHelper';
	import SeemlessInput from '../seemless-input/SeemlessInput.svelte';
	import FormInput from '../form/FormInput.svelte';
	import DraggableListItem from '../draggable-list-item/DraggableListItem.svelte';
	import type { DropzoneOutput, FileWithPath } from '$models/minter/dropzone';
	/*
	TODO: Tooltip text
	*/
	export let handleChange: (event: Event) => any;
	export let attributeForm: PfpAttribute;
	export let errors;
	export let uploadLoading = false;
	let hovering;

	function extractNameFromFileName(filename: string) {
		// Given a string in the form foo_foo_foo_.png, or foo-foo-foo.png,
		// return foo foo foo
		return filename.split('.').slice(0, -1).join('').split(/[-_]/).join(' ');
	}

	const handlePropertySelect = (
		file: DropzoneOutput,
		acceptedFiles: FileWithPath[],
		index: number,
	) => {
		const name = extractNameFromFileName(acceptedFiles[index].name);
		// TODO: handle archives, what are archives?
		const initial = deepCopy(initialPfpProperty);
		// We're just going to assume that if the user uploads a different layer with the same name,
		// they want the old layer to be replaced.
		const properties = attributeForm.properties.filter((property) => property.name !== name);
		attributeForm.properties = [
			...properties,
			{
				...initial,
				file,
				_id: generateId(),
				fileName: acceptedFiles[index].name,
				name,
			},
		];
	};
	const updatePropertyOrder = (list: PfpProperty[]) => {
		attributeForm.properties = [...list];
	};
	const deleteProperty = (index: number) => {
		attributeForm.properties = [
			...attributeForm.properties.slice(0, index),
			...attributeForm.properties.slice(index + 1),
		];
	};

	const handleConstraintChange = (e, index) => {
		if (e.detail.value === PfpConstraintType.NONE) {
			attributeForm.properties[index].constraint.value = 0;
		}
	};
</script>

<FormInput
	id="attribute-name"
	label="Attribute Name"
	info="Tooltip text"
	placeholder="i.e. Background"
	error={errors.name}
	required
	on:change={handleChange}
	bind:value={attributeForm.name}
/>

{#if attributeForm.properties.length > 0}
	<h4>
		<PopInfo message="Tooltip text">Property name</PopInfo>
	</h4>
	<div class="properties" use:touchHelperDirective>
		{#each attributeForm.properties as property, index (property._id)}
			<div animate:flip>
				<DraggableListItem
					{index}
					bind:list={attributeForm.properties}
					updateOrder={updatePropertyOrder}
					bind:hovering
				>
					<div class="property" class:is-active={hovering === index}>
						<div class="info">
							<SeemlessInput bind:value={property.name} />
							<span>
								{property.fileName}
							</span>
						</div>
						<div class="constraints">
							<div class="dropdown">
								<HoverDropdown
									options={[
										{ label: 'No constraints', value: PfpConstraintType.NONE },
										{ label: 'Finite count', value: PfpConstraintType.COUNT },
										{ label: 'Percentage', value: PfpConstraintType.PERCENTAGE },
									]}
									initial={property.constraint.type}
									bind:value={property.constraint.type}
									on:select={(e) => handleConstraintChange(e, index)}
								/>
							</div>
							{#if property.constraint.type}
								<SeemlessInput
									bind:value={property.constraint.value}
									addon={property.constraint.type === PfpConstraintType.PERCENTAGE ? '%' : ''}
									size={`${property.constraint.value}`.length || 1}
									style="width:auto"
								/>
							{/if}
						</div>
						<CloseButton
							size="0.5rem"
							position="8px"
							color="--icon-action-primary"
							on:click={() => deleteProperty(index)}
						/>
					</div>
				</DraggableListItem>
			</div>
		{/each}
	</div>
{/if}
<div class="dropzone">
	<UploadDropzone
		label={attributeForm.properties.length === 0 ? 'Add property*' : ''}
		info="Tooltip text"
		accept={['.png', '.jpg', '.jpeg', '.svg']}
		title="Upload Properties"
		multiple={true}
		bind:loading={uploadLoading}
		onDrop={handlePropertySelect}
	/>
</div>

<style lang="scss">
	h4 {
		color: var(--text-header);
	}

	.properties {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 16px;
		max-height: 440px;
		min-height: 148px;
		overflow: auto;

		.property {
			border: 1px solid var(--stroke-secondary);
			padding: 4px 16px;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			background-color: var(--background-l0);
			font-weight: 300;

			&:hover {
				border: 1px solid var(--stroke-action-primary);
			}

			.info {
				display: flex;
				flex-direction: column;
				gap: 4px;
				span {
					color: var(--text-tertiary);
				}
			}
		}

		.constraints {
			position: absolute;
			right: 10px;
			padding-right: 10px;

			.dropdown {
				min-width: 150px;
			}
		}
	}

	.dropzone {
		margin-bottom: 16px;
	}
</style>
