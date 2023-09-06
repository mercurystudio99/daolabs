import { loadCollection } from '$utils/collectionHelpers';

export function load({ params }: { params: { address: string; id: string } }) {
	const { id } = params;

	return {
		id,
		streamed: {
			collection: loadCollection(id),
		},
	};
}

export const prerender = 'auto';
