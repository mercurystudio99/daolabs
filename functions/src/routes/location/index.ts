import type { Request, Response } from 'express';

export function getCountryName(req: Request, res: Response) {
	res.json({
		country: req.headers['x-appengine-country'],
		region: req.headers['x-appengine-region'],
		city: req.headers['x-appengine-city'],
		cityLatLong: req.headers['x-appengine-citylatlong'],
		userIP: req.headers['x-appengine-user-ip'],
	});
}
