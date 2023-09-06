import Store from './Store';
import type { ethers } from 'ethers';

export const nonce = new Store(-1);

export async function getNonce(
	provider: ethers.providers.Web3Provider,
	account: string,
): Promise<number> {
	const baseNonce = await provider.getTransactionCount(account);
	const newNonce = Math.max(nonce.get() + 1, baseNonce);
	nonce.set(newNonce);
	return newNonce;
}
