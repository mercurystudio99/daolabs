// TODO: move to firebase functions
export class Alchemy {
	private static readonly API_URL = 'https://eth-mainnet.g.alchemy.com/nft/v2';

	static async getTokenAttributes(contractAddress: string, tokenId: string): Promise<any> {
		const options = { method: 'GET', headers: { accept: 'application/json' } };
		const url = `${this.API_URL}/${String(
			import.meta.env.VITE_ALCHEMY_MAINNET_API_KEY,
		)}/computeRarity?contractAddress=${contractAddress}&tokenId=${tokenId}`;

		const response = await fetch(url, options);
		const json = await response.json();
		return json;
	}
}
