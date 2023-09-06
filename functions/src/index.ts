import * as functions from 'firebase-functions';
import express, { Express, json, urlencoded, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import fileMultipartFileUpload from 'express-multipart-file-parser';
import cors from 'cors';
import comp from 'compression';
import apiKeyRouter from './routes/api-keys';
import { ipfsGateway } from './routes/gateway';
import { pinFiles } from './routes/pinning';
import { pinFilesV0 } from './routes/pinning/pinningV0';
import { createHttpTask, deleteHttpTask } from './routes/pinning/task';
import { currentGas, getWalletTokenBalances, getWalletTokenTransfers } from './routes/web3';
import { readContract } from './routes/contract/readContract';
import { checkApiKey } from './middlewares/checkApiKey';
import { querySubgraph } from './routes/subgraph';
import { getContractAbi } from './routes/etherscan';
import { checkGnosisAddress, getPendingTransactions, safeBalancesInEth } from './routes/gnosis';
import { getCountryName } from './routes/location';
import { getParticipationScore } from './routes/deepdao/score';
import { getTransactions } from './routes/etherscan/transactions';
import { renderTileSvg } from './routes/render/svg';
import { whitelistedDomains } from './constants';
import { getFloorPrice } from './routes/alchemy/getFloorPrice';
import { zoraGraphql } from './routes/zora/graphql';
import { getContractInfo } from './routes/opensea/contractInfo';
import { getAssetTransfers } from './routes/alchemy/getAssetTransfers';
import { getBalance, getBlocks } from './routes/alchemy/getBalance';
import { getNfts } from './routes/nfts/getNfts';
import { pinManyFilesFn } from './routes/pubsub/pinManyFiles';
import { handleContractWrite, type ContractInput } from './utils/contract';
import { scheduleContractWrite } from './routes/schedule/nfts';
import { writeContract } from './routes/contract/writeContract';
import { getAppPublicKey, validateTwitterConnect, verifyTwitter } from './routes/auth/verify';
const expressApp: Express = express();

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
expressApp.use(comp());
expressApp.use(json());
expressApp.use(urlencoded({ extended: true }));
expressApp.use(cookieParser());
expressApp.use(
	cors({
		methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
		origin: whitelistedDomains,
	}),
);

expressApp.use((req: Request, res: Response, next) => {
	const period = 86400; // 1 hours
	if (req.method == 'GET') {
		res.set('Cache-control', `public, max-age=${period} s-maxage=${period}`);
	} else {
		res.set('Cache-control', 'no-store');
	}
	next();
});

expressApp.post('/ipfs', [checkApiKey, fileMultipartFileUpload], pinFiles);
expressApp.get('/ipfs/*', ipfsGateway);

// Alchemy methods
expressApp.get('/alchemy/getFloorPrice', [checkApiKey], getFloorPrice);
expressApp.get('/alchemy/getAssetTransfers', [checkApiKey], getAssetTransfers);
expressApp.get('/alchemy/getBalance', [checkApiKey], getBalance);
expressApp.get('/alchemy/getBlocks', [checkApiKey], getBlocks);

// Twitter Connection
expressApp.get('/auth/publickey', [checkApiKey], getAppPublicKey);
expressApp.post('/auth/verify/twitter', [checkApiKey], verifyTwitter);
expressApp.post('/auth/twitter/validate', [checkApiKey], validateTwitterConnect);

// Zora methods
expressApp.post('/zora/graphQl', [checkApiKey], zoraGraphql);

//Opensea methods
expressApp.get('/opensea/contractInfo', [checkApiKey], getContractInfo);

expressApp.get('/nfts/getNfts', [checkApiKey], getNfts);

expressApp.get('/web3/currentGas', [checkApiKey], currentGas);
expressApp.post('/web3/readContract', [checkApiKey], readContract);
expressApp.post('/web3/writeContract', [checkApiKey], writeContract);
expressApp.get('/web3/getWalletTokenBalances/:address', [checkApiKey], getWalletTokenBalances);
expressApp.get('/web3/getWalletTokenTransfers/:address', [checkApiKey], getWalletTokenTransfers);
expressApp.post('/web3/scheduleWriteContract', [checkApiKey], scheduleContractWrite);

expressApp.get('/etherscan/transactions/:address', [checkApiKey], getTransactions);
expressApp.get('/etherscan/contract/:address', [checkApiKey], getContractAbi);

expressApp.get('/gnosis/check/:address', [checkApiKey], checkGnosisAddress);
expressApp.get('/gnosis/balances/:address/total', [checkApiKey], safeBalancesInEth);
expressApp.get('/gnosis/txns/:address/pending', [checkApiKey], getPendingTransactions);
expressApp.post('/subgraph/mainnet', [checkApiKey], querySubgraph('mainnet'));
expressApp.post('/subgraph/goerli', [checkApiKey], querySubgraph('goerli'));
expressApp.get('/location/country', [checkApiKey], getCountryName);
expressApp.get('/deepdao/score/:address', [checkApiKey], getParticipationScore);
expressApp.use('/api-keys', apiKeyRouter);
expressApp.get('/tiles/render/svg/:address', renderTileSvg);

expressApp.post('/task', [checkApiKey], createHttpTask);
expressApp.delete('/task/:userId/:id', [checkApiKey], deleteHttpTask);

const runWith: functions.RuntimeOptions = {
	memory: '1GB',
	minInstances: 1,
	secrets: [
		'BLOCKNATIVE_API_KEY',
		'INFURA_ID',
		'SUBGRAPH_API_KEY',
		'ETHERSCAN_API_KEY',
		'DEEP_DAO_API_KEY',
		'NFT_STORAGE_API_KEY',
		'MORALIS_API_KEY',
		'ALCHEMY_API_KEY',
		'SIGNER_SECRET_KEY',
	],
	timeoutSeconds: 540,
};
export const app = functions.runWith(runWith).https.onRequest(expressApp);

export const pinManyFiles = functions
	.runWith({
		timeoutSeconds: 540,
		memory: '1GB',
		secrets: ['NFT_STORAGE_API_KEY'],
	})
	.firestore.document('pin-many-files/{docId}')
	.onCreate(pinManyFilesFn);

// This is temporary
export const ipfsPinFilesV0Cid = functions
	.runWith({
		secrets: [
			'BLOCKNATIVE_API_KEY',
			'INFURA_ID',
			'SUBGRAPH_API_KEY',
			'ETHERSCAN_API_KEY',
			'DEEP_DAO_API_KEY',
			'NFT_STORAGE_API_KEY',
			'MORALIS_API_KEY',
			'ALCHEMY_API_KEY',
		],
	})
	.https.onRequest((req, resp) => {
		expressApp.post('/pin', [checkApiKey, fileMultipartFileUpload], pinFilesV0);
		expressApp(req, resp);
	});

export const scheduleWriteContract = functions
	.runWith({ secrets: ['PRIVATE_KEY'] })
	.tasks.taskQueue({
		retryConfig: {
			maxAttempts: 5,
			minBackoffSeconds: 60,
		},
	})
	.onDispatch(async (data) => {
		await handleContractWrite(data as ContractInput);
	});
