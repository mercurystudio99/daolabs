import { Firestore } from 'firebase-admin/firestore';
import { firestore } from '../init';

export interface IToken {
	value: string;
	uniswapPrice: number | string;
	token: {
		contractAddress: string;
		name: string;
		symbol: string;
		logo: string;
		thumbnail: string;
		decimals: number;
		balance?: string;
	};
}

class UserService {
	_db: Firestore;

	constructor(_firestore: Firestore) {
		this._db = _firestore;
	}

	async getTokens(address: string): Promise<{ data: IToken[] | null; updateTime: number }> {
		const data = await this._db.collection('users').doc(`${address}/tokens/erc20`).get();
		if (!data.exists) return { data: null, updateTime: 0 };
		const tokens = data.data();
		return {
			updateTime: data.updateTime.toMillis(),
			data: Object.values(tokens) as IToken[],
		};
	}

	saveTokens(address: string, data: any[]) {
		return this._db
			.collection('users')
			.doc(`${address}/tokens/erc20`)
			.set(Object.assign({}, data))
			.then((response) => response.writeTime)
			.catch((err) => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
				throw new Error(err.message);
			});
	}
}

export default new UserService(firestore);
