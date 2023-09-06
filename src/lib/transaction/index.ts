import { bind, closeModal, openModal } from '$lib/components/Modal.svelte';
import { modal } from '$stores';
import TxnModal from './SimulationModal.svelte';
import type { ContractTransaction, PopulatedTransaction } from 'ethers';

export async function web3Transact<T extends (...args: any[]) => any>(
	functionName: string,
	handler: T,
	...handlerArgs: Parameters<T>
): Promise<ContractTransaction> {
	console.clear();
	const getArgsWithOpts = (args: Parameters<T>, populateTxn = false) => {
		const optKeys = ['populateTxn', 'actualProvider', 'gasLimit', 'value'];
		const last = args[args.length - 1] as object;
		if (
			args.length > handler.length &&
			!(last instanceof Array) &&
			typeof last === 'object' &&
			(Object.keys(last).find((key) => optKeys.includes(key)) || Object.keys(last).length === 0)
		) {
			args[args.length - 1] = { ...last, populateTxn: !!populateTxn };
		} else {
			args.push({ populateTxn: !!populateTxn });
		}
		return args;
	};
	console.log(getArgsWithOpts(handlerArgs, true));
	const populatedTransaction = (await handler(
		...getArgsWithOpts(handlerArgs, true),
	)) as PopulatedTransaction;
	console.log(`[${handler.name}] populatedTransaction =`, populatedTransaction);

	return new Promise((resolve, reject) => {
		let closed = false;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
		const component = bind(TxnModal, {
			async submit() {
				try {
					const txnResponse = (await handler(
						...getArgsWithOpts(handlerArgs, false),
					)) as ContractTransaction;
					closed = true;
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					closeModal(modal);
					await new Promise((r) => setTimeout(r, 500)); // wait for modal to close
					resolve(txnResponse);
					return txnResponse;
				} catch (error) {
					if (error instanceof Error) console.error(error.message);
					else console.error(error);
				}
			},
			close() {},
			populatedTransaction,
			functionName: functionName,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		openModal(component);
		const unsub = modal.subscribe((s) => {
			if (closed) return unsub();
			if (s !== component) {
				unsub();
				reject(new Error('modal was closed'));
				return;
			}
		});
	});
}
