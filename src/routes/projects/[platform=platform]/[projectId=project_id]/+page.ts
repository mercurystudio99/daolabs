import { error } from '@sveltejs/kit';
import type { ProjectPlatform } from '$constants/platform';

export const prerender = 'auto';
export const csr = true;

/** @type {PageLoad} */
export function load({ params }: { params: { platform: string; projectId: string } }) {
	if (params.platform === 'juicebox' || params.platform === 'daolabs') {
		if (params.projectId?.match(/^\d+$/)) {
			return {
				platform: params.platform as ProjectPlatform,
				projectId: params.projectId,
			};
		}
	}
	const err: Error = { ...Error('Not Found'), ...error(404, 'Not found') };
	throw err;
}
