<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { BigNumber, constants } from 'ethers';
	import Button from '$lib/components/Button.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Icon from '$lib/components/Icon';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { querySubgraph, type OrderDirection } from '$utils/graph';
	import { formatPercent, formatWad } from '$utils/formatNumber';
	import { tokenSymbolText } from '$utils/tokenSymbolText';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import DownloadHolders from './DownloadHolders.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	export let close: () => void;

	type OrderBy = 'balance' | 'totalPaid' | 'lastPaidTimestamp';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');
	let pageNumber = 0;
	const pageSize = 6;
	let orderBy = 'balance' as OrderBy;
	let scrollTarget: HTMLElement;
	let sort = 'desc' as OrderDirection;
	let showDownloadModal = false;

	let holders: {
		balance: BigNumber;
		address: string;
		totalPaid: string;
		stakedBalance: string;
	}[] = [];
	let newBatch = [];

	const previousFetch = {
		orderBy,
		sort,
	};

	async function loadTokenHolders(pageNo: number, order: OrderBy, orderDirection: OrderDirection) {
		newBatch = await querySubgraph({
			entity: 'participant',
			keys: [
				'wallet',
				'totalPaid',
				'lastPaidTimestamp',
				'balance',
				'stakedBalance',
				'id',
				'address',
			],
			first: pageSize,
			skip: pageNo * pageSize,
			orderBy: order,
			orderDirection,
			where: [
				{
					key: 'projectId',
					value: $project.projectId.toNumber(),
				},
				{
					key: 'pv',
					value: '2',
				},
				{
					key: 'project',
					operator: '',
					value: `{platform: "${$project.platform}"}`,
				},
				{
					key: 'balance',
					value: 0,
					operator: 'gt',
				},
				{
					key: 'wallet',
					value: constants.AddressZero,
					operator: 'not',
				},
			],
		});
	}

	onMount(() => {
		loadTokenHolders(pageNumber, orderBy, sort).catch((e) => console.log(e));
	});

	$: holders = [...holders, ...newBatch];
	$: {
		if (previousFetch.orderBy !== orderBy || previousFetch.sort !== sort) {
			pageNumber = 0;
			holders = [];
			loadTokenHolders(pageNumber, orderBy, sort)
				.then(() => {
					// NOTE: why is this type not agreeing...
					previousFetch.sort = sort;
					previousFetch.orderBy = orderBy;
				})
				.catch((e) => console.log(e));
		}
	}
</script>

<main>
	<h3>Token holders</h3>
	<div class="note">
		This list is using an experimental data index and may be inaccurate for some projects.
	</div>

	<div class="options">
		<Dropdown
			bind:value={orderBy}
			options={[
				{
					value: 'balance',
					label: 'Token balance',
				},
				{
					value: 'totalPaid',
					label: 'Amount paid',
				},
				{
					value: 'lastPaidTimestamp',
					label: 'Last paid',
				},
			]}
		/>
		<span>
			<Icon
				name={sort === 'desc' ? 'sortDescending' : 'sortAscending'}
				on:click={() => {
					sort = sort === 'desc' ? 'asc' : 'desc';
				}}
			/>
		</span>
		<span>
			<Icon
				name="download"
				on:click={() => {
					showDownloadModal = true;
				}}
			/>
		</span>
	</div>
	<br />
	<div class="list" bind:this={scrollTarget}>
		{#each holders as tokenHolder}
			<div class="item-container">
				<div class="item">
					<div>
						<div style="line-height: 1.4rem; margin-right: 10px;">
							<span style="user-select: all; line-height: 22px;">
								<EnsOrAddress address={tokenHolder.address} />
							</span>
						</div>
						<div class="subtext">
							<span style="font-family: sans-serif;">Ξ</span>{formatWad(tokenHolder.totalPaid, {
								precision: 6,
							})} contributed
						</div>
					</div>
					<div style="text-align: right;">
						<div style="line-height: 1.4rem;">
							{formatWad(tokenHolder.balance, { precision: 0 })}{' '}
							{tokenSymbolText({
								tokenSymbol: $project.tokenSymbol,
								capitalize: false,
								plural: true,
							})}
							({formatPercent(tokenHolder.balance, $project.totalTokenSupply)}%)
						</div>
						<div class="subtext">
							{formatWad(tokenHolder.stakedBalance, { precision: 0 })}
							{tokenSymbolText({
								tokenSymbol: $project.tokenSymbol,
								capitalize: false,
								plural: true,
							})} unclaimed
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<InfiniteScroll
		elementScroll={scrollTarget}
		hasMore={!!newBatch.length}
		threshold={0}
		on:loadMore={() => {
			pageNumber += 1;
			loadTokenHolders(pageNumber, orderBy, sort).catch((e) => console.log(e));
		}}
	/>
</main>
<div class="buttons">
	<Button size="md" on:click={close}>Done</Button>
</div>
<Modal
	on:close={() => {
		showDownloadModal = false;
	}}
	show={showDownloadModal &&
		bind(DownloadHolders, {
			projectName: $project.projectMetadata.name,
			projectId: $project.projectId.toNumber(),
			tokenSymbol: $project.tokenSymbol,
			close: () => {},
		})}
/>

<style>
	h3 {
		color: var(--text-header);
		margin-bottom: 10px;
	}

	main {
		max-width: 480px;
		position: relative;
	}

	.buttons {
		margin-top: 10px;
		display: flex;
		justify-content: flex-end;
	}

	.item-container {
		margin-bottom: 20px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--stroke-tertiary);
	}

	.item {
		display: flex;
		place-content: space-between;
	}

	.list {
		max-height: 50vh;
		overflow-y: auto;
	}

	.note {
		background: var(--background-l2);
		font-weight: 300;
		padding: 10px 10px;
		margin: 10px 0px;
	}

	.options {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.options span {
		cursor: pointer;
		line-height: 0;
		font-size: 16px;
	}

	.options span:last-of-type {
		color: var(--icon-action-primary);
	}

	.subtext {
		font-size: 0.7rem;
		color: var(--text-tertiary);
	}
</style>
