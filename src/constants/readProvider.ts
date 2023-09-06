import { providers } from 'ethers';
import { readNetwork } from '$stores/web3';

const readProvider = () => new providers.JsonRpcBatchProvider(readNetwork.get().rpcUrl);

export { readProvider as default };
