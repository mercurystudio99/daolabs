<script lang="ts">
	import { getContext } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import ReconBox from '$lib/components/ReconBox.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import { getProjectTemplate, getProjectTos, templatesIdToItemMap } from '$services/templates';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');
	const dirty: {
		showDirty: Store<boolean>;
		check: (
			initialState?: {
				[x: string]: any;
			},
			currentState?: {
				[x: string]: any;
			},
		) => void;
	} = getContext('SHOW_DIRTY');

	export let close: () => void;

	let documents = [templatesIdToItemMap.nonprofit, templatesIdToItemMap.forprofit];

	type Document = (typeof documents)[0];

	let tos = getProjectTos($project.documents);
	let hasTos = !!tos;

	let selected = $project.documents?.length
		? $project.documents.map((doc) => templatesIdToItemMap[doc.id])
		: [documents[0]];

	const initialState = {
		tos,
		selected,
	};

	function selectDocument(document: Document) {
		selected = [document];
	}

	async function onSaveRules() {
		const projectTemplates = selected.map((current) => getProjectTemplate(current.id));
		const docs = await Promise.all(projectTemplates);
		if (hasTos && !tos) {
			const defaultTos = await getProjectTemplate('treasuryTosSimple');
			docs.push(defaultTos);
		} else if (!hasTos && tos) {
			docs.splice(docs.indexOf(tos), 1);
		}
		project.update((current) => ({
			...current,
			documents: docs,
		}));
		close();
	}

	$: {
		dirty?.check(initialState, {
			tos,
			selected,
		});
	}

	$: selectedIds = selected.map((d) => d.id);
</script>

<slot name="header" />
<p>
	These document templates are provided as references only, they are intended to help you fully
	outline the relationship between you, the project creator, and your contributors.
</p>
<InfoBox
	>You acknowledge and agree that the making available of these document(s) to you by Movement DAO,
	shall not create any confidential or special relationship between you and Movement DAO or DAOLABS
	LLC. or its affiliates (collectively, the "DAO") and does not constitute the provision of legal
	advice or other professional advice by the DAO or its legal counsel. You should seek advice from
	an attorney licensed in the relevant jurisdiction(s), as well as a tax professional, before
	relying on or using any document templates. Additionally, the information provided does not
	constitute tax advice. Any discussion of tax matters is not intended or written to be used, and
	cannot be used or relied on, for the purpose of tax planning or avoiding penalties under the
	Internal Revenue Code (or equivalent in the relevant jurisdiction) or promoting, marketing, or
	recommending to another party any transaction or matter.
</InfoBox>
<br />
<HeavyBorderBox>
	<h4>Entity categories</h4>
	{#each documents as document}
		<ReconBox
			selected={selectedIds.includes(document.id)}
			on:click={() => selectDocument(document)}
		>
			<h3 slot="header">{document.title}</h3>
			<p slot="body">{document.description}</p>
		</ReconBox>
	{/each}
</HeavyBorderBox>
<HeavyBorderBox>
	<h4>
		<Toggle id="tos" bind:checked={hasTos}>Terms of Service</Toggle>
	</h4>
	<InfoBox>
		YOU AGREE AND ACKNOWLEDGE THAT THE USE OF THE DAO SERVICES IS MADE SOLELY AT YOUR OWN RISK AND
		RESPONSIBILITY AND THAT THE DAO BARES NO RESPONSIBILITY OR LIABILITY FOR YOUR USE OF THE DAO
		SERVICES PROVIDED INCLUDING, WITHOUT LIMITATION, FOR ANY HARM, LOSS, OR DAMAGES ARISING FROM
		INCORRECT USE OF THE SERVICES, INCLUDING CONSTRUCTED TRANSACTIONS, NETWORK AND TECHNICAL
		FAILURES, UNAUTHORIZED ACCESS TO ANY USER WALLETS, LEGAL AND REGULATORY MATTERS AND
		CONSEQUENCES, OR FRAUD CONDUCTED BY THIRD PARTIES.
	</InfoBox>
	<br />
	YOU AGREE AND ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THE TERMS OF THE
	FOLLOWING <a href="/disclaimers" target="_blank" rel="noopener noreferrer">DISCLAIMERS</a>, AND
	<a href="/terms-of-service" target="_blank" rel="noopener noreferrer">TERMS OF SERVICES</a>, WHICH
	ARE INCORPORATED HEREIN BY REFERENCE.
</HeavyBorderBox>
<br />
<Button on:click={onSaveRules}>Save document template(s)</Button>

<style>
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
</style>
