export interface Env {}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response | void> {
		try {
			const cacheUrl = new URL(request.url);
			if (cacheUrl.pathname.startsWith('/ipfs/')) {
				const cidPath = cacheUrl.pathname.replace(/^\/ipfs\//, '');
				const cacheKey = new Request(cacheUrl.toString());
				const cache = await caches.open('100');
				let response = await cache.match(cacheKey);

				if (!response) {
					console.log(
						`Response for request url: ${request.url} not present in cache. Fetching and caching request.`,
					);
					const gateways = [
						'https://nftstorage.link',
						'https://cloudflare-ipfs.com',
						'https://ipfs.io',
					];
					for (const gateway of gateways) {
						response = await fetch(`${gateway}/ipfs/${cidPath}`);
						if (response.status < 400) {
							response = new Response(response.body, {
								...response,
								headers: {
									'access-control-allow-origin': '*',
									'content-type': response.headers.get('content-type'),
									'Cache-Control': 'public, max-age=31536000, s-maxage=30000000',
								},
							});
							ctx.waitUntil(cache.put(cacheKey, response.clone()));
							break;
						}
					}
				} else {
					console.log(`Cache hit for: ${request.url}.`);
				}
				response = new Response(response.body, {
					...response,
					headers: {
						'access-control-allow-origin': '*',
						'Access-Control-Allow-Headers': 'apiKey',
						'content-type': response.headers.get('content-type'),
						'Cache-Control': 'public, max-age=31536000, s-maxage=30000000',
					},
				});
				return response;
			}
		} catch (err: unknown) {
			return new Response('500');
		}
	},
};
