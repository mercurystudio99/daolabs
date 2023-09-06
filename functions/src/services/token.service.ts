import allTokens from '../assets/tokens.json';

interface IToken {
	chainId: number;
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	logoURI: string;
}

export class TokenService {
	getTokenBySymbol(symbol: string): IToken | null {
		try {
			const tokens: IToken[] = allTokens.tokens as IToken[];
			return tokens.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
		} catch (err) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return err;
		}
	}
}

export default new TokenService();
