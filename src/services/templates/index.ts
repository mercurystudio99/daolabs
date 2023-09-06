import { ethers } from 'ethers';
import { getProvider } from '$stores/web3';
// @ts-ignore
import { bind, openModal } from '$lib/components/Modal.svelte';
import type { PinataPinResponse } from 'pinata_ipfs_sdk';
type SignedDocument = {
	id: string;
	signature: string;
};

function getSignedDocuments(): SignedDocument[] {
	const signedDocuments = localStorage.getItem('signedDocuments');
	if (signedDocuments) {
		return JSON.parse(signedDocuments) as SignedDocument[];
	}
	return [];
}

// NOTE: groupIds are used to group templates together in the UI and to
// identify documents that are mutually exclusive.
export const templates = [
	{
		id: 'tos',
		title: 'Terms of Service',
		location: '/documents/tos.md',
		groupId: 'daolabsTOS',
		jsonLocation: '',
		description: '',
	},
	{
		id: 'treasuryTosLong',
		title: 'TOS (Long)',
		location: '/documents/tos/tos-long.md',
		groupId: 'tos',
		jsonLocation: '/documents/tos/tos-long.json',
		description: '',
	},
	{
		id: 'treasuryTosSimple',
		title: 'TOS (Simple)',
		location: '/documents/tos/tos-simple.md',
		groupId: 'tos',
		jsonLocation: '/documents/tos/tos-simple.json',
		description: '',
	},
	{
		id: 'nonprofit',
		title: 'Non-profit',
		description:
			'A non-profit organization is a legal entity organized and operated for a collective, public or social benefit, in contrast with an entity that operates as a business aiming to generate a profit for its owners.',
		groupId: 'corpType',
		location: '/documents/non-profit/delaware.md',
		jsonLocation: '/documents/non-profit/delaware.json',
	},
	{
		id: 'forprofit',
		title: 'For-profit',
		description:
			'A for-profit corporation is an organization which aims to earn profit through its operations and is concerned with its own interests.',
		location: '/documents/for-profit/delaware.md',
		groupId: 'corpType',
		jsonLocation: '/documents/for-profit/delaware.json',
	},
];

export type ParameterField = {
	type: string;
	name: string;
	label: string;
	props?: Record<string, string>;
	placeholder?: string;
	value?: string | number;
};

export type Template = typeof templates[0];
export type ProjectTemplate = {
	id: string;
	title: string;
	markdown?: string;
	metadata?: Record<string, string>;
	signature?: string;
	pinInfo?: PinataPinResponse;
};

export const templatesIdToItemMap = templates.reduce((acc, template) => {
	acc[template.id] = template;
	return acc;
}, {} as Record<string, Template>);

export const templatesIdToGroupIdMap = templates.reduce((acc, template) => {
	acc[template.id] = template.groupId;
	return acc;
}, {} as Record<string, string>);

export async function getDataToSign(templateId: string) {
	const template = templatesIdToItemMap[templateId];
	if (!template) {
		throw new Error(`Template with id ${templateId} not found`);
	}
	const response = await fetch(template.location);
	const data = await response.text();
	return data;
}

export async function getParameterJsonForTemplate(templateId: string): Promise<ParameterField[]> {
	const template = templatesIdToItemMap[templateId];
	if (!template) {
		throw new Error(`Template with id ${templateId} not found`);
	}
	if (!template.jsonLocation) {
		throw new Error(`Template with id ${templateId} does not have a json location`);
	}
	if (template.jsonLocation === '') {
		return [];
	}
	const response = await fetch(template.jsonLocation);
	const data = (await response.json()) as ParameterField[];
	return data;
}

export async function getHashForDocument(templateId: string) {
	const dataToSign = await getDataToSign(templateId);
	return ethers.utils.id(dataToSign);
}

export async function getHashForEditedDocument(markdown: string) {
	return ethers.utils.id(markdown);
}

export async function getProjectTemplate(templateId: string): Promise<ProjectTemplate> {
	const dataToSign = await getDataToSign(templateId);
	const documentHash = ethers.utils.id(dataToSign);
	const item = templatesIdToItemMap[templateId];
	return {
		id: item.id,
		title: item.title,
	};
}

export function getProjectTos(projectTemplates: ProjectTemplate[]) {
	return projectTemplates?.find((template) => /Tos|tos/.test(template.id));
}

export function checkIfSigned(templateId: string) {
	const signedDocuments = getSignedDocuments();
	return signedDocuments.some((doc) => doc.id === templateId);
}

export async function signDocument(templateId: string) {
	const dataToSign = await getDataToSign(templateId);
	const documentHash = ethers.utils.id(dataToSign);

	const signer = getProvider().getSigner();
	try {
		const signature = await signer.signMessage(ethers.utils.arrayify(documentHash));
		const signedDocuments = getSignedDocuments();
		signedDocuments.push({ id: templateId, signature });
		localStorage.setItem('signedDocuments', JSON.stringify(signedDocuments));
	} catch (err) {
		console.log(err);
		throw err;
	}
}

export async function signEditedDocument(markdown: string) {
	const documentHash = ethers.utils.id(markdown);
	const signer = getProvider().getSigner();
	try {
		const signature = await signer.signMessage(ethers.utils.arrayify(documentHash));
		return signature;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

export function checkAndOpenDocumentModal(templateId: string) {
	return new Promise((resolve, reject) => {
		if (checkIfSigned(templateId)) {
			resolve(true);
		} else {
			import('$lib/components/modals/SignDocument.svelte')
				.then(({ default: SignDocument }) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					openModal(
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call
						bind(SignDocument, {
							template: templatesIdToItemMap[templateId],
							resolve,
							reject,
						}),
					);
				})
				.catch(reject);
		}
	});
}
