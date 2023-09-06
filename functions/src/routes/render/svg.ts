import { Request, Response } from 'express';
import { generateTile } from '../../utils/tilesStandalone';

export async function renderTileSvg(req: Request, res: Response) {
	try {
		const { address } = req.params;
		const animate = req.query.hasOwnProperty('animate');

		if (address) {
			let tile = generateTile(address, animate);
			res.setHeader('content-type', 'image/svg+xml');
			res.send(tile);
			return;
		}
	} catch (error) {
		console.error(error.message);
	}
	res.status(404).json({
		error: 'Something went wrong'
	});
}
