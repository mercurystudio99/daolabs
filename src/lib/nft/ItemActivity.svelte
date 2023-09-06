<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import {
		EventType,
		type Event,
		type MintEvent,
		type TransferEvent,
		type Sale,
	} from '@zoralabs/zdk/dist/queries/queries-sdk';
	import Icon from '$lib/components/Icon';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import DetailSection from '$lib/components/minter/review-drawer/DetailSection.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';

	export let events: Event[] = [];
	export let sales: Sale[] = [];
	let data: ItemActivity[] = [];

	enum ActivityType {
		Mint = 'mint',
		Sale = 'sale',
		Transfer = 'transfer',
		// TODO: need to figure out the different types that zora returns and see if we can derive list and offer
		List = 'list',
		Offer = 'offer',
	}

	enum Currency {
		ETH = 'ETH',
		WETH = 'WETH',
	}

	type ItemActivity = {
		id: string;
		price?: number;
		currency?: Currency;
		type: ActivityType;
		timestamp: number;
		from: string;
		fromString: string;
		to?: string;
	};

	const imgSrc = {
		[Currency.ETH]: '/icons/eth.png',
		[Currency.WETH]: '/icons/weth.png',
	};

	function handleEvents(eventList: Event[]) {
		let parsedEvents: ItemActivity[] = [];
		for (const event of eventList) {
			const id = event.transactionInfo.transactionHash;
			let timestampString = event.transactionInfo.blockTimestamp as string;
			const timestamp = new Date(timestampString).getTime();
			let fromString = 'from';
			let currency: Currency;
			let from: string;
			let type: ActivityType;
			let price: number;

			if (event.eventType === EventType.TransferEvent) {
				// check if there's another event not of the type TransferEvent that has the same transactionHash
				// if so, then we can assume that this is a transfer event that we'll handle in the other event
				const otherEvent = eventList.find(
					(e) =>
						e.eventType !== EventType.TransferEvent &&
						e.transactionInfo.transactionHash === event.transactionInfo.transactionHash,
				);
				if (otherEvent) {
					// it'll be handled in the other event
					continue;
				}
				const properties = event.properties as TransferEvent;
				parsedEvents = [
					...parsedEvents,
					{
						id: event.transactionInfo.transactionHash,
						type: ActivityType.Transfer,
						timestamp,
						from: properties.fromAddress,
						fromString,
						to: properties.toAddress,
					},
				];
				continue;
			}
			// get the next event in the list, that is this events transfer
			const transferEvent = events.find(
				(e) => e.eventType === EventType.TransferEvent && e.transactionInfo.transactionHash === id,
			);
			const to = (transferEvent.properties as unknown as TransferEvent).toAddress;
			if (event.eventType === EventType.MintEvent) {
				const mintEvent = event.properties as unknown as MintEvent;
				currency = mintEvent.price.nativePrice.currency.name as Currency;
				// if a mint address we'll use the contract address instead of zero address
				from = mintEvent.collectionAddress;
				fromString = 'from contract';
				type = ActivityType.Mint;
				price = mintEvent.price.chainTokenPrice.decimal;
			} else if (event.eventType === EventType.SaleEvent) {
				from = (transferEvent.properties as unknown as TransferEvent).fromAddress;
				type = ActivityType.Sale;
				// find the sale in the sales list
				const saleData = sales.find((s) => s.transactionInfo.transactionHash === id);
				if (saleData) {
					currency = saleData.price.nativePrice.currency.name as Currency;
					price = saleData.price.chainTokenPrice.decimal;
				}
			}
			parsedEvents = [
				...parsedEvents,
				{
					id,
					currency,
					from,
					fromString,
					price,
					timestamp,
					to,
					type,
				},
			];
		}
		return parsedEvents;
	}

	$: data = handleEvents(events);
</script>

<DetailSection header="Item Activity" arrowBelowHeader={false}>
	{#each data as activity}
		<div class="activity">
			<InfoSpaceBetween>
				<div slot="left">
					<span class="type">
						{activity.type}
						{#if activity.type === ActivityType.Sale}
							<span class="price__amount">to</span>
							<EnsOrAddress address={activity.to} />
						{/if}
					</span>
					{#if [ActivityType.Offer, ActivityType.List].includes(activity.type) && activity.timestamp < new Date().getTime()}
						<span class="expired">Expired</span>
					{/if}
				</div>
				<div class="timestamp" slot="right">
					{formatDistanceToNow(activity.timestamp, { addSuffix: true })}
					<Icon name="link" />
				</div>
			</InfoSpaceBetween>
			<InfoSpaceBetween>
				<div class="price" slot="left">
					{#if activity.currency}
						<img src={imgSrc[activity.currency]} alt="currency icon" width="18" height="18" />
					{/if}
					{#if activity.price}
						<span class="price__amount">{activity.price}</span>
						<span class="price__currency">{activity.currency}</span>
					{/if}
					{#if activity.type === ActivityType.Transfer}
						<span class="price__amount">to</span>
						<EnsOrAddress address={activity.to} />
					{/if}
				</div>
				<div class="from" slot="right">
					{activity.fromString}
					<EnsOrAddress address={activity.from} />
				</div>
			</InfoSpaceBetween>
		</div>
	{/each}
</DetailSection>

<style>
	.activity {
		--small-font-size: 0.75em;
	}
	.activity {
		margin-top: 1em;
		padding-bottom: 0.5em;
		border-bottom: 1px solid var(--stroke-tertiary);
	}

	.timestamp,
	.type,
	.from {
		font-size: var(--small-font-size);
		color: var(--text-tertiary);
	}

	.type {
		text-transform: capitalize;
	}

	.expired {
		font-size: var(--small-font-size);
		color: var(--text-failure);
	}

	.price {
		display: flex;
		align-items: center;
		gap: 8px;
	}
</style>
