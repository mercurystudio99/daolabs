import { fetch } from 'undici';
import type { Request, Response } from 'express';

export async function createHttpTask(request: Request, response: Response) {
	const data = request.body as Record<string, unknown>;

	const url = 'https://pinning.juicebox.wtf/task';
	const method = 'POST';

	const res = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (res.status.toString().startsWith('2')) {
		const json = await res.json();
		response.status(res.status).json(json);
	} else {
		response.status(res.status).json({
			message: res.statusText,
		});
	}
}

export async function deleteHttpTask(request: Request, response: Response) {
	const { id, userId } = request.params;

	const url = `https://pinning.juicebox.wtf/task/${userId}/${id}`;
	const method = 'DELETE';

	const res = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (res.status.toString().startsWith('2')) {
		const json = await res.json();
		response.status(res.status).json(json);
	} else {
		response.status(res.status).json({
			message: res.statusText,
		});
	}
}
