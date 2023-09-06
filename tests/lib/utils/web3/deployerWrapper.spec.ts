import { expect, test } from '@playwright/test';
import { MockProvider } from 'ethereum-waffle';
import { ethers } from 'ethers';
import * as deployerWrapper from '$utils/web3/deployerWrapper';
import JBDirectory from '../../../../src/deployments/goerli/JBDirectory';

let jbxDirectoryAddress: string;
let accounts: ethers.Wallet[];
let provider: ethers.providers.Web3Provider;
console.log('deployNFToken 1');
test.beforeAll(() => {
	provider = new MockProvider();
	accounts = (provider as MockProvider).getWallets();

	jbxDirectoryAddress = JBDirectory.address;
	console.log('deployNFToken 2');
});

test('deployNFToken(...)', async () => {
	console.log('deployNFToken 3');
	const owner = accounts[0].address;
	const name = 'Shared NFT';
	const symbol = 'SNFT';
	const baseUri = 'ipfs://contract-metadata';
	const contractUri = 'ipfs://contract-metadata';
	const jbxProjectId = 2;
	const maxSupply = 100;
	const unitPrice = ethers.utils.parseEther('0.0001');
	const mintAllowance = 10;
	const mintPeriodStart = 0;
	const mintPeriodEnd = 0;

	expect(
		await deployerWrapper.deployNFToken(
			// 'juicebox3',
			owner,
			name,
			symbol,
			baseUri,
			contractUri,
			jbxProjectId,
			jbxDirectoryAddress,
			maxSupply,
			unitPrice,
			mintAllowance,
			mintPeriodStart,
			mintPeriodEnd,
			{},
			provider,
		),
	);
});
