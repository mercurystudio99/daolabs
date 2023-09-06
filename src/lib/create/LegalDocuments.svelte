<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { marked } from 'marked';
	import {
		templatesIdToItemMap,
		getDataToSign,
		type Template,
		type ParameterField as Field,
		getParameterJsonForTemplate,
		templatesIdToGroupIdMap,
		templates,
	} from '$services/templates';
	import FormField from '$lib/components/FormField.svelte';
	import InlineCalendar from '$lib/components/InlineCalendar.svelte';
	import Button from '$lib/components/Button.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import Icon from '$lib/components/Icon';
	import Textarea from '$lib/components/Textarea.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');

	let editingMarkdown: boolean = false;
	let markdown: string;
	let fields: Field[] = [];
	let fieldsValues: Record<string, string | number | Date> = {};

	const allTemplatesToShow = {
		0: ['nonprofit', 'forprofit'],
		1: ['treasuryTosSimple', 'treasuryTosLong'],
	};

	let selectedDocumentsGrouped: Record<string, Template> = {};
	let subsetOfTemplatesToShow: typeof allTemplatesToShow | {} = {};
	let currentPreview: Template = {} as Template;

	function mapDocumentsToGroups() {
		const documentIds = $project.documents.map((doc) => doc.id);
		Object.keys(allTemplatesToShow).forEach((groupKey) => {
			const groupTemplates = allTemplatesToShow[groupKey];
			const intersection = groupTemplates.filter((id: string) => documentIds.includes(id));
			if (intersection.length) {
				subsetOfTemplatesToShow[groupKey] = groupTemplates;
				const selectedDocumentId = intersection[0];
				selectedDocumentsGrouped[groupKey] = templatesIdToItemMap[selectedDocumentId];
			}
		});
	}

	function initializeSelectedDocuments() {
		Object.keys(allTemplatesToShow).forEach((groupKey) => {
			let initialTemplateId = allTemplatesToShow[groupKey][0];
			selectedDocumentsGrouped[groupKey] = templatesIdToItemMap[initialTemplateId];
		});
	}

	function initializeDocuments() {
		if ($project.documents?.length) {
			mapDocumentsToGroups();
		} else {
			initializeSelectedDocuments();
			subsetOfTemplatesToShow = allTemplatesToShow;
		}
		currentPreview = selectedDocumentsGrouped[0];
	}

	async function setMarkdown(templateId: string) {
		// if templateId is in $project.documents, get markdown from there if it exists
		const document = $project.documents?.find((doc) => doc.id === templateId);
		if (document?.markdown) {
			markdown = document.markdown;
		} else {
			markdown = await getDataToSign(templateId);
			markdown = markdown.replace(/^---$.*^---$/ms, '');
		}
	}

	function transformField(field: Field): Field {
		if (field.type === 'text') {
			field.type = 'textarea';
		} else if (!['date', 'address', 'input', 'text', 'textarea'].includes(field.type)) {
			field.props = {
				type: field.type,
			};
			field.type = 'input';
		}
		return field;
	}

	// Utility function to set value from document metadata
	function setValueFromMetadata(document: any, field: Field) {
		if (document.metadata[field.name]) {
			field.value = document.metadata[field.name];
		}
		return field;
	}

	// Utility function to generate field values
	function generateFieldValues(acc: any, field: Field) {
		if (field.type === 'date') {
			acc[field.name] = new Date(field.value as string);
		} else {
			acc[field.name] = field.value;
		}
		return acc as Record<string, string | number | Date>;
	}

	async function setForm(templateId: string) {
		// Get and transform fields
		fields = await getParameterJsonForTemplate(templateId);
		fields = fields.map(transformField);
		// Fill in metadata fields if they exist
		const document = $project.documents?.find((doc) => doc.id === templateId);
		if (document?.metadata) {
			fields = fields.map((field) => setValueFromMetadata(document, field));
		}
		// Generate field values
		fieldsValues = fields.reduce(generateFieldValues, {});
	}

	async function selectDocument(templateId: string, groupKey: string) {
		const document = templatesIdToItemMap[templateId];
		selectedDocumentsGrouped[groupKey] = document;
		if (currentPreview.id === document.id) return;
		currentPreview = document;
		await setMarkdown(document.id);
		await setForm(document.id);
	}

	function getOtherDocumentSavedInGroup(groupKey: string) {
		const groupTemplates = templates
			.filter((template) => template.groupId === groupKey)
			.map((template) => template.id);
		const otherDocument = groupTemplates.find((id: string) => id !== currentPreview.id);
		if (otherDocument) {
			return $project.documents?.find((doc) => doc.id === otherDocument);
		}
	}

	function updateFieldValueInMarkdown(fieldName: string) {
		let value = fieldsValues[fieldName];
		if (!value) return;
		if (value instanceof Date) {
			value = new Date(value).toISOString().split('T')[0];
		}
		let regex = new RegExp(`\\[${fieldName}\\]`, 'g');
		markdown = markdown.replace(regex, `${value.toString()}`);
	}

	function updateMarkdown() {
		Object.keys(fieldsValues).forEach(updateFieldValueInMarkdown);
	}

	function handleDateSelect(fieldName: string, { detail }) {
		fieldsValues[fieldName] = detail.day.getTime();
	}

	function saveDocument() {
		updateMarkdown();
		// add metadata property as <Field.name, fieldsValues[Field.name]>
		const metadata = fields.reduce((acc, field) => {
			acc[field.name] = fieldsValues[field.name];
			return acc;
		}, {});

		$project.documents = [
			...$project.documents.filter(
				(doc) =>
					doc.id !== currentPreview.id &&
					templatesIdToGroupIdMap[doc.id] !== currentPreview.groupId,
			),
			{
				id: currentPreview.id,
				title: currentPreview.title,
				markdown,
				metadata,
			},
		];
		project.set($project);
	}

	function editMarkdown() {
		editingMarkdown = true;
	}

	function saveMarkdown() {
		editingMarkdown = false;
	}

	async function removeDocument() {
		$project.documents = $project.documents.filter((doc) => doc.id !== currentPreview.id);
		project.set($project);
		await setMarkdown(currentPreview.id);
	}

	const theme = {
		calendar: {
			width: '280px',
			shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
		},
	};

	onMount(async () => {
		initializeDocuments();
		await setMarkdown(currentPreview.id);
		await setForm(currentPreview.id);
	});

	let saveDisabled = true;
	let removeButtonVisible = false;
	let otherDocumentSavedInGroup = null;
	$: {
		const fieldIds = fields.map((field) => field.name);
		removeButtonVisible = $project.documents.some(
			(doc) => doc.id === currentPreview.id && doc.markdown,
		);
		saveDisabled = fieldIds
			.map((key) => fieldsValues[key])
			.some((value) => [undefined, ''].includes(value as string));
		otherDocumentSavedInGroup = getOtherDocumentSavedInGroup(currentPreview.groupId);
	}
</script>

<div class="container">
	<header>
		<nav>
			{#each Object.keys(subsetOfTemplatesToShow) as groupKey}
				<div class="group">
					{#each subsetOfTemplatesToShow[groupKey] as templateId}
						<button
							class:selected={selectedDocumentsGrouped[groupKey]?.id === templateId}
							class:current={currentPreview.id === templateId}
							on:click={() => selectDocument(templateId, groupKey)}
						>
							{templatesIdToItemMap[templateId].title}
						</button>
					{/each}
				</div>
			{/each}
		</nav>
	</header>

	{#if otherDocumentSavedInGroup}
		<InfoBox>
			<b>
				Warning: You have another document saved of this type. Saving this document will replace <i>
					{otherDocumentSavedInGroup.title}.</i
				>
			</b>
		</InfoBox>
	{/if}
	<main>
		<section class="form-section">
			<h2>
				{currentPreview.title}
				{#if removeButtonVisible}
					<span class="saved">Saved</span>
				{/if}
			</h2>

			<div class="form">
				{#each fields as field}
					{#if field.type === 'date'}
						<p class="dateLabel">{field.label}</p>
						<InlineCalendar
							{theme}
							on:select={(value) => handleDateSelect(field.name, value)}
							bind:value={fieldsValues[field.name]}
						/>
					{:else}
						<FormField field={{ ...field, id: field.name }} bind:value={fieldsValues[field.name]} />
					{/if}
				{/each}
			</div>
			<div class="buttons">
				<Button
					disabled={removeButtonVisible || saveDisabled || editingMarkdown}
					on:click={updateMarkdown}>Fill Document</Button
				>
			</div>
		</section>

		<section class="preview-section">
			<header>
				<h2>Preview</h2>
				{#if editingMarkdown}
					<Button on:click={saveMarkdown} size="sm">
						<!-- <Icon name="checkmark" />  -->
						Save markdown
					</Button>
				{:else}
					<Button on:click={editMarkdown} size="sm">
						<Icon name="pen" /> Edit Markdown
					</Button>
				{/if}
			</header>
			{#if markdown && !editingMarkdown}
				<div class="markdown-preview">
					{@html marked(markdown)}
				</div>
			{:else if markdown && editingMarkdown}
				<div class="markdown-editor">
					<Textarea
						bind:value={markdown}
						style="height: 800px; min-height: 400px;"
						maxHeight={800}
						shouldAutoResize={false}
					/>
				</div>
			{:else}
				<p>No markdown to preview</p>
			{/if}

			<div class="buttons">
				{#if removeButtonVisible}
					<Button disabled={editingMarkdown} on:click={removeDocument}>Remove Document</Button>
				{:else}
					<Button disabled={saveDisabled || editingMarkdown} on:click={saveDocument}
						>Save Document</Button
					>
				{/if}
			</div>
		</section>
	</main>
</div>

<style>
	header {
		/* takes up the whole flew width */
		flex-grow: 1;
	}
	.preview-section header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	main {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	nav {
		display: flex;
		gap: 1rem;
		border-bottom: 2px solid var(--stroke-tertiary);
	}
	button {
		background: none;
		border: none;
		padding: 0.5rem;
		cursor: pointer;
		position: relative;
		bottom: -2px;
	}
	.dateLabel:not(:first-child) {
		margin-top: 16px;
	}
	.buttons {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 0.5rem;
	}
	.container {
		position: relative;
		width: 100%;
		top: -54px;
	}
	.saved {
		color: var(--text-tertiary);
		font-weight: 700;
		margin-left: 1rem;
		font-style: italic;
	}
	.selected {
		border-bottom: 2px solid var(--stroke-secondary);
	}
	.current {
		border-bottom: 2px solid var(--stroke-primary);
		font-weight: 700;
		color: var(--accent);
	}
	.group {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		border-right: 1px solid var(--stroke-tertiary);
		padding-right: 1rem;
		align-items: center;
	}
	.group:last-child {
		border-right: none;
	}
	.preview-section {
		width: 60%;
		flex: 0 0 60%;
		padding: 20px;
	}

	.form-section {
		width: 40%;
		flex: 0 0 40%;
		padding: 20px;
	}

	.form,
	.markdown-preview {
		margin-top: 20px;
		padding: 20px;
		border: 1px solid var(--stroke-tertiary);
		border-radius: 4px;
		max-height: 800px;
		min-height: 400px;
		overflow-y: scroll;
	}
	.markdown-preview {
		margin-top: 10px;
	}
	.markdown-editor {
		margin-top: 10px;
	}

	:global(.markdown-preview li) {
		overflow-wrap: anywhere;
	}
</style>
