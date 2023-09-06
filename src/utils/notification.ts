import { web3Onboard } from '$stores/web3';
import Store from './Store';
import type { CustomNotification, UpdateNotification } from '@web3-onboard/core';

export const notify = new Store();

export const createCustomNotification = (object: CustomNotification) => {
	return web3Onboard.get().state.actions.customNotification(object);
};

export const errorHandle = (errorMessage: string, update?: UpdateNotification): void => {
	if (update) {
		update({
			message: errorMessage,
			type: 'error',
			autoDismiss: 3000,
		});
		return;
	}
	createCustomNotification({
		type: 'error',
		autoDismiss: 3000,
		message: errorMessage,
	});
};

const DefaultMessages = {
	pending: 'Pending...',
	success: 'Success! 🎉',
	error: '💥 Oh no, error!',
};

export async function processNotifications(
	processFunc: (update: UpdateNotification) => Promise<any>,
	messages?: Partial<typeof DefaultMessages>,
	links: Partial<typeof DefaultMessages> & { all?: string } = {},
	shouldThrow = false,
): Promise<any> {
	let update: UpdateNotification;
	try {
		const { update: updateFunc } = createCustomNotification({
			message: messages.pending || DefaultMessages.pending,
			link: links.pending || links.all,
			type: 'pending',
		});
		update = updateFunc;
	} catch (e) {
		console.warn('processNotifications', e);
		if (shouldThrow) {
			throw e;
		}
		return;
	}
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const response = await processFunc(update);
		update({
			message: messages.success || DefaultMessages.success,
			link: links.success || links.all,
			type: 'success',
			autoDismiss: 3000,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return response;
	} catch (e) {
		console.warn('processNotifications', e);
		update({
			message: messages.error || DefaultMessages.error,
			link: links.error || links.all,
			type: 'error',
			autoDismiss: 3000,
		});
		if (shouldThrow) {
			throw e;
		}
		return;
	}
}
