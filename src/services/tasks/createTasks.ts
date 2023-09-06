export async function createTask(params: {}): Promise<any> {
	if (!import.meta.env.VITE_FIREBASE_FUNCTIONS_URL) {
		throw new Error('Not found server url');
	}
	const url = `${String(import.meta.env.VITE_FIREBASE_FUNCTIONS_URL)}/app/task`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			apikey: import.meta.env.VITE_API_KEY as string,
		},
		body: JSON.stringify(params),
	});
	return response.json();
}

export async function deleteTask(params: { userId: string; collectionId: string }): Promise<any> {
	if (!import.meta.env.VITE_FIREBASE_FUNCTIONS_URL) {
		throw new Error('Not found server url');
	}
	const url = `${String(import.meta.env.VITE_FIREBASE_FUNCTIONS_URL)}/app/task/${params.userId}/${
		params.collectionId
	}`;
	const response = await fetch(url, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			apikey: import.meta.env.VITE_API_KEY as string,
		},
	});
	return response.json();
}
