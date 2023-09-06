<script lang="ts">
	import { getContext } from 'svelte';
	import { ethers } from 'ethers';
	import { formatDate } from '$utils/formatDate';
	import { getProjectEventsById } from '$data/event';
	import { formatWad } from '$utils/formatNumber';
	import { getEnsAddress } from '$lib/utils/getResolvedEns';
	import Button from './Button.svelte';
	import PopInfo from './PopInfo.svelte';
	import type Store from '$utils/Store';
	import type { ProjectEvent } from '$models/subgraph-entities/vX/project-event';
	import type { V2ProjectContextType } from '$models/project-type';

	export let close;

	let loadingPayments = false;
	let loadingRedeemed = false;
	let loadingDistributed = false;
	let loadingDistributedReserved = false;
	let loadingEvents = false;
	let loadingERC20PaymentAddress = false;
	const project: Store<V2ProjectContextType> = getContext('PROJECT');

	async function getEns(address: string) {
		const ens = await getEnsAddress(address);
		return ens === address ? '' : ens;
	}

	async function getEvents(filter?: keyof ProjectEvent) {
		switch (filter) {
			case 'payEvent':
				loadingPayments = true;
				break;
			case 'redeemEvent':
				loadingRedeemed = true;
				break;
			case 'distributePayoutsEvent':
				loadingDistributed = true;
				break;
			case 'distributeReservedTokensEvent':
				loadingDistributedReserved = true;
				break;
			case 'deployETHERC20ProjectPayerEvent':
				loadingERC20PaymentAddress = true;
				break;
			default:
				loadingEvents = true;
				break;
		}
		return getProjectEventsById($project.platform, $project.projectId.toNumber(), filter);
	}

	function setLoadingFalse() {
		loadingPayments = false;
		loadingRedeemed = false;
		loadingDistributed = false;
		loadingDistributedReserved = false;
		loadingEvents = false;
		loadingERC20PaymentAddress = false;
	}

	function downloadCsv(rows: string[][], name: string) {
		const csvContent = `data:text/csv;charset=utf-8,${rows.map((e) => e.join(',')).join('\n')}`;
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		const projectName: string = $project.projectMetadata.name;
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `@${projectName}_${name}.csv`);
		document.body.appendChild(link);

		link.click();
		setLoadingFalse();
	}
	async function downloadPayments() {
		try {
			const events = await getEvents('payEvent');
			const rows = [
				['Date', 'Ethereum address', 'Ens', 'Amount', 'Tokens returned', 'Transaction Id'], // CSV header row
			];
			const tokens: string =
				$project.tokenAddress && $project.tokenAddress === ethers.constants.AddressZero
					? $project.tokenAddress
					: $project.projectId.toString();
			for await (const e of events) {
				const info = e.payEvent;
				const date = formatDate((info.timestamp ?? 0) * 1000);
				const ens = await getEns(info.beneficiary);
				rows.push([
					date,
					info.beneficiary,
					ens,
					formatWad(info.amount, {
						precision: 4,
						padEnd: false,
					}),
					tokens,
					info.txHash,
				]);
			}
			downloadCsv(rows, 'payments');
		} catch (e) {
			console.error('Error downloading events', e);
		}
		setLoadingFalse();
	}
	async function downloadRedeemed() {
		try {
			const events = await getEvents('redeemEvent');
			const rows = [
				[
					'Date',
					'Ethereum address',
					'Ens',
					'Token address',
					'Amount being redeemed',
					'Amount in ethereum returned',
					'Transaction Id',
				], // CSV header row
			];
			for await (const e of events) {
				const tokenAddress: string = $project.tokenAddress;
				const info = e.redeemEvent;
				const date = formatDate((info.timestamp ?? 0) * 1000);
				const ens = await getEns(info.beneficiary);
				rows.push([
					date,
					info.beneficiary,
					ens,
					tokenAddress,
					formatWad(info.amount, { precision: 0 }),
					formatWad(info.returnAmount, { precision: 4 }),
					info.txHash,
				]);
			}
			downloadCsv(rows, 'redeemed');
		} catch (e) {
			console.error('Error downloading participants', e);
		}
		setLoadingFalse();
	}
	async function downloadFunds() {
		try {
			const events = await getEvents('distributePayoutsEvent');

			const rows = [
				[
					'Date',
					'Ethereum address',
					'Ens',
					'Project Id',
					'Payout currency type',
					'Amount',
					'Called by',
					'Transaction Id',
				], // CSV header row
			];
			for await (const e of events) {
				const id: string = $project.projectId.toString();
				const info = e.distributePayoutsEvent;
				const date = formatDate((info.timestamp ?? 0) * 1000);
				const ens = await getEns(info.beneficiary);
				rows.push([
					date,
					info.beneficiary,
					ens,
					id,
					'Ethereum',
					formatWad(info.distributedAmount, { precision: 4 }),
					info.caller,
					info.txHash,
				]);
			}
			downloadCsv(rows, 'distributed_funds');
		} catch (e) {
			console.error('Error downloading participants', e);
		}
		setLoadingFalse();
	}
	async function downloadReservedTokens() {
		try {
			const events = await getEvents('distributeReservedTokensEvent');

			const rows = [
				[
					'Date',
					'Ethereum address',
					'Ens',
					'Project Id',
					'Token address',
					'Amount',
					'Called by',
					'Transaction Id',
				], // CSV header row
			];
			for await (const e of events) {
				const id: string = $project.projectId.toString();
				const tokenAddress: string = $project.tokenAddress;
				const info = e.distributeReservedTokensEvent;
				const date = formatDate((info.timestamp ?? 0) * 1000);
				const ens = await getEns(info.beneficiary);
				rows.push([
					date,
					info.beneficiary,
					ens,
					id,
					tokenAddress,
					formatWad(info.tokenCount, { precision: 2 }),
					info.caller,
					info.txHash,
				]);
			}
			downloadCsv(rows, 'distributed_reserved_tokens');
		} catch (e) {
			console.error('Error downloading participants', e);
		}
		setLoadingFalse();
	}

	async function downloadECR20PayementAddress() {
		try {
			const events = await getEvents('deployETHERC20ProjectPayerEvent');

			const rows = [
				['Project ID', 'ID', 'Address', 'Deployed By', 'Memo', 'Date', 'TransactionHash'], // CSV header row
			];
			for await (const e of events) {
				const id: string = $project.projectId.toString();
				const info = e.deployETHERC20ProjectPayerEvent;
				const date = formatDate((info.timestamp ?? 0) * 1000);
				const ens = await getEns(info.caller);
				rows.push([
					id,
					info.id,
					info.address,
					ens || info.caller,
					info.memo || '',
					date,
					info.txHash,
				]);
			}
			downloadCsv(rows, 'erc20_project_payer_address');
		} catch (e) {
			console.error('Error downloading participants', e);
		}
		setLoadingFalse();
	}

	async function downloadEvents() {
		try {
			const events = await getEvents();
			const rows = [
				['Date', 'Event type', 'Memo', 'Called by'], // CSV header row
			];
			for await (const e of events) {
				if (e.projectCreateEvent) {
					const date = formatDate((e.projectCreateEvent.timestamp ?? 0) * 1000);
					rows.push([date, 'Project creation', '', e.projectCreateEvent.caller]);
				} else if (e.payEvent) {
					const date = formatDate((e.payEvent.timestamp ?? 0) * 1000);
					rows.push([date, 'Pay', e.payEvent.note, e.payEvent.caller]);
				} else if (e.deployedERC20Event) {
					const date = formatDate((e.deployedERC20Event.timestamp ?? 0) * 1000);
					rows.push([date, 'Deployed ERC-20', '', e.deployedERC20Event.caller]);
				} else if (e.distributePayoutsEvent) {
					const date = formatDate((e.distributePayoutsEvent.timestamp ?? 0) * 1000);
					rows.push([
						date,
						'Distribute Payouts',
						e.distributePayoutsEvent.memo,
						e.distributePayoutsEvent.caller,
					]);
				} else if (e.distributeReservedTokensEvent) {
					const date = formatDate((e.distributeReservedTokensEvent.timestamp ?? 0) * 1000);
					rows.push([
						date,
						'Distribute reserved tokens',
						e.distributeReservedTokensEvent.memo,
						e.distributeReservedTokensEvent.caller,
					]);
				} else if (e.redeemEvent) {
					const date = formatDate((e.redeemEvent.timestamp ?? 0) * 1000);
					rows.push([date, 'Redeem', '', e.redeemEvent.caller]);
				}
			}
			downloadCsv(rows, 'events');
		} catch (e) {
			console.error('Error downloading participants', e);
		}
		setLoadingFalse();
	}
</script>

<section>
	<h4>
		<PopInfo
			message="This list is using an experimental data index and may be inaccurate for some projects."
			>Download CSV of project activity</PopInfo
		>
	</h4>
	<Button size="md" type="tertiary" on:click={downloadPayments} loading={loadingPayments}
		>Payments</Button
	>
	<Button size="md" type="tertiary" on:click={downloadRedeemed} loading={loadingRedeemed}
		>Redeemed</Button
	>
	<Button size="md" type="tertiary" on:click={downloadFunds} loading={loadingDistributed}
		>Distributed funds</Button
	>
	<Button
		size="md"
		type="tertiary"
		on:click={downloadReservedTokens}
		loading={loadingDistributedReserved}
	>
		Distributed reserved tokens
	</Button>
	<Button
		size="md"
		type="tertiary"
		on:click={downloadECR20PayementAddress}
		loading={loadingERC20PaymentAddress}
	>
		ETH-ERC20 payment address
	</Button>
	<Button size="md" type="tertiary" on:click={downloadEvents} loading={loadingEvents}>Events</Button
	>
	<div class="close">
		<Button size="md" type="secondary" on:click={close}>Close</Button>
	</div>
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: min(586px, 75vw);
	}
	h4 {
		color: var(--text-header);
		margin: 0;
	}

	.close {
		width: fit-content;
		align-self: flex-end;
	}
</style>
