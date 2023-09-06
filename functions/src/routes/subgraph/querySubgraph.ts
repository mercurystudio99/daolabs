import { Stream } from 'stream';
import { Request, Response } from 'express';
import fetch from 'cross-fetch';

const subgraphs = {
	mainnet: `https://api.thegraph.com/subgraphs/name/cptspacecadet/daolabs-jbx`,
	goerli: 'https://api.thegraph.com/subgraphs/name/cptspacecadet/daolabs-jbx-goerli',
};

export function querySubgraph(network: keyof typeof subgraphs) {
	return async function querySubgraphHandler(req: Request, res: Response) {
		try {
			const { query } = req.body as { query: string };
			const response = await fetch(subgraphs[network], {
				method: 'POST',
				body: JSON.stringify({
					query: query,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			res.setHeader('content-type', response.headers.get('content-type'));
			const body = response.body as unknown as Stream;
			body.pipe(res);
		} catch (error) {
			console.error((error as Error)?.message);
		}
	};
}
