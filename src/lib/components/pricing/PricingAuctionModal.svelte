<script lang="ts">
	import { createForm, Form } from 'svelte-forms-lib';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import moment from 'moment';
	import { isAddress } from 'ethers/lib/utils';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import FormDropdown from '$lib/components/minter/form/FormDropdown.svelte';
	import {
		initialCollectionPricing,
		type CollectionPricing,
	} from '$models/minter/collection-config';
	import { collectionPricingValidation } from '$models/minter/validation-schemas/pricing-validation';
	import Button from '$lib/components/Button.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import { V2_CURRENCY_ETH } from '$utils/v2/currency';
	import { formattedNum } from '$utils/formatNumber';
	import Icon from '$lib/components/Icon';
	import InlineCalendar from '$lib/components/datepicker/components/InlineCalendar.svelte';
	import clickOutsideDirective from '$utils/clickOutside';
	import Expandable from '$lib/components/Expandable.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import AdvancedCollectionPreview from '$lib/components/minter/preview/AdvancedCollectionPreview.svelte';
	import PayoutReceiverModal from '$lib/components/PayoutReceiverModal.svelte';
	import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	import EnsOrAddress from '../EnsOrAddress.svelte';
	import Modal, { bind } from '../Modal.svelte';
	import PricingChooseProject from './PricingChooseProject.svelte';
	import type { CurrencyName } from '$constants/currency';
	import type { AdvancedCollection } from '$models/minter/collection-config';

	export let collection: AdvancedCollection;
	export let method: 'fixed' | 'highest' | 'declining';

	let ethToUsdRate = 0;
	let recieversWidth;
	let formModal;
	// const royaltyValue = 10;
	let showStartCalendar = false;
	let showEndCalendar = false;
	let showStartTimeCalendar = false;
	let showEndTimeCalendar = false;

	let reservePrice = false;

	const theme = {
		calendar: {
			width: '280px',
			shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
		},
	};

	const formatDate = (date: string): string => moment(date).format('D MMM YY');
	const formatTime = (date: string): string => moment(date).format('h:mm a');

	const methods = [
		{
			label: 'Sell with declining price',
			value: 'declining',
		},
		{
			label: 'Sell to highest bidder',
			value: 'highest',
		},
	];

	const durations = [
		{
			label: '1 day',
			value: '1d',
		},
		{
			label: '3 day',
			value: '3d',
		},
		{
			label: '7 day',
			value: '7d',
		},
		{
			label: '1 month',
			value: '1m',
		},
		{
			label: '3 months',
			value: '3m',
		},
		{
			label: '6 months',
			value: '6m',
		},
	];

	const submitFn = () => {};

	const { errors, form, handleChange } = createForm<CollectionPricing>({
		initialValues: collection.pricing || { ...initialCollectionPricing, method },
		onSubmit: submitFn,
		validationSchema: collectionPricingValidation,
	});

	const handleStartDateSelect = ({ detail }) => {
		$form.startingDate = detail.day.getTime();
		showStartCalendar = false;
	};
	const handleEndDateSelect = ({ detail }) => {
		$form.endingDate = detail.day.getTime();
		showEndCalendar = false;
	};

	const handleStartTimeSelect = ({ detail }) => {
		$form.startingTime = detail.day.getTime();
		showStartCalendar = false;
	};
	const handleEndTimeSelect = ({ detail }) => {
		$form.endingTime = detail.day.getTime();
		showEndCalendar = false;
	};

	const setCurrency = (e) => {
		$form.currency = e.detail.currency.eq(V2_CURRENCY_ETH) ? 'ETH' : 'USD';
	};

	const convertPrice = (price: number, currency: CurrencyName) => {
		let multiplier = 1;
		if (currency === 'ETH') {
			multiplier = ethToUsdRate;
		}
		return `$${formattedNum(price * multiplier, { precision: 2 })} total`;
	};

	const addReciever = (reciever: any) => {
		$form.payoutReceivers = [...$form.payoutReceivers, reciever];
	};

	const openPayoutRecieverModal = () => {
		formModal = bind(PayoutReceiverModal, { addReciever, close: () => {} });
	};

	let services: { label: string; value: string }[];
	$: services = [
		{
			label: 'Type an address',
			value: 'address',
		},
		{
			label: 'Juicebox',
			value: 'juicebox',
		},
		{
			label: 'Choose a Juicebox project',
			value: 'jb',
		},
	];

	const handleSelectService = (serviceName: string) => {
		services.push({ label: serviceName, value: serviceName });
		$form.service = serviceName;
	};

	const handleSelect = ({ detail: { value } }) => {
		if (value === 'jb') {
			formModal = bind(PricingChooseProject, {
				handleSelectService,
				close: () => {},
			});
		}
	};

	$: priceConverted = convertPrice($form.price, $form.currency);
	$: priceConvertedReserve = convertPrice($form.reservePrice, $form.currency);

	onMount(async () => {
		try {
			const result = await axios.post(
				'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
			);
			ethToUsdRate = result.data.USD;
			const pricing = $form;
			priceConverted = convertPrice(pricing.price, pricing.currency);
		} catch (e) {
			if (e instanceof Error) {
				console.log(`error getting eth conversion rate ${e.message}`);
			}
		}
	});
</script>

<!-- eslint-disable -->
<main>
	<div class="form">
		<h1>Timed auction</h1>
		{#if $form.method == 'highest'}
			<InfoBox
				info={`
					<p>Sell to the highest bidder</p>
					<p>Also known as an English auction, OpenSea will automatically complete this transaction if a Sell to highest bidder auction finishes above 1 ETH, with OpenSea paying the gas fee in the process.</p>
					<p>If the auction finishes below 1 ETH, it's up to the seller to accept the highest offer. The seller is under no obligation to complete the transaction.</p>
					<p>Making a bid on this kind of action is like making an offer on a fixed-price listing. The seller can choose to accept it at any time, but the buyer will need WETH to create a bid.</p>
					<p>You may cancel an auction at any time, but doing so will require paying a gas fee.</p>
				`}
			/>
		{:else if $form.method == 'declining'}
			<InfoBox
				info={`
			<p>Where are the two types of auctions available:</p>
			<ul>
				<li>Sell to the highest bidder: the highest bid wins at the end</li>
				<li>Sell with a declining price: the price falls until someone purchases the item</li>
			</ul>`}
			/>
		{:else}
			<InfoBox
				info={`
			<p>Where are the two types of auctions available:</p>
			<ul>
				<li>Sell to the highest bidder: the highest bid wins at the end</li>
				<li>Sell with a declining price: the price falls until someone purchases the item</li>
			</ul>`}
			/>
		{/if}

		<Form onSubmit={submitFn}>
			<FormDropdown
				id="method"
				label="Method"
				info="Tooltip text"
				description="Sell to the highest bidder or sell with a declining price, which allows the listing to reduce in price until a buyer is found"
				options={methods}
				error={$errors.method}
				on:change={() => {}}
				bind:value={$form.method}
			/>

			<div class="price-input">
				<label for="price">
					<PopInfo message="Tooltip text">Starting price</PopInfo>
				</label>
				<CurrencyInput
					bind:inputValue={$form.price}
					on:change={handleChange}
					on:switchCurrency={setCurrency}
					step={0.001}
				/>
				<span class="conversion">{priceConverted}</span>
			</div>

			<div class="line" />

			<FormDropdown
				id="duration"
				label="Duration"
				info="Tooltip text"
				options={durations}
				error={$errors.duration}
				on:change={() => {}}
				bind:value={$form.duration}
			/>

			<div class="time" id="edition-duration">
				<label class="start-time" for="start-time">
					<PopInfo message="Minting will be possible between the start and end time defined here.">
						Start and end time
					</PopInfo>
				</label>
				<div class="combined">
					<div class="input">
						<span
							class:placeholder={!$form.startingDate}
							on:click={() => (showStartCalendar = true)}
							on:keydown
						>
							{$form.startingDate ? formatDate($form.startingDate) : 'Now'}
							<div class="calendar-icon">
								<Icon name="calendar" />
							</div>
						</span>
						{#if showStartCalendar}
							<div
								class="calendar"
								use:clickOutsideDirective
								on:clickOutside={() => {
									showStartCalendar = false;
								}}
							>
								<InlineCalendar
									{theme}
									on:select={handleStartDateSelect}
									start={new Date()}
									selected={$form.startingDate ? new Date($form.startingDate) : undefined}
								/>
							</div>
						{/if}
					</div>
					<div class="icon">-</div>
					<div class="input">
						<span
							class:placeholder={!$form.endingDate}
							on:click={() => (showEndCalendar = true)}
							on:keydown
						>
							{$form.endingDate ? formatDate($form.endingDate) : 'Forever'}
							<div class="calendar-icon">
								<Icon name="calendar" />
							</div>
						</span>
						{#if showEndCalendar}
							<div
								class="calendar right"
								use:clickOutsideDirective
								on:clickOutside={() => {
									showEndCalendar = false;
								}}
							>
								<InlineCalendar
									{theme}
									on:select={handleEndDateSelect}
									start={$form.endingDate ? new Date($form.endingDate) : new Date()}
									selected={$form.endingDate ? new Date($form.endingDate) : undefined}
								/>
							</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="time" id="edition-duration">
				<div class="combined">
					<div class="input">
						<span
							class:placeholder={!$form.startingTime}
							on:click={() => (showStartTimeCalendar = true)}
							on:keydown
						>
							{$form.startingTime ? formatTime($form.startingTime) : '15:00'}
							<div class="calendar-icon">
								<Icon name="clock" />
							</div>
						</span>
						{#if showStartTimeCalendar}
							<div
								class="calendar"
								use:clickOutsideDirective
								on:clickOutside={() => {
									showStartTimeCalendar = false;
								}}
							>
								<InlineCalendar
									{theme}
									on:select={handleStartTimeSelect}
									start={new Date()}
									timepicker
									selected={$form.startingTime ? new Date($form.startingTime) : undefined}
								/>
							</div>
						{/if}
					</div>
					<div class="icon">-</div>
					<div class="input">
						<span
							class:placeholder={!$form.endingTime}
							on:click={() => (showEndTimeCalendar = true)}
							on:keydown
						>
							{$form.endingTime ? formatTime($form.endingTime) : '15:00'}
							<div class="calendar-icon">
								<Icon name="clock" />
							</div>
						</span>
						{#if showEndTimeCalendar}
							<div
								class="calendar right"
								use:clickOutsideDirective
								on:clickOutside={() => {
									showEndTimeCalendar = false;
								}}
							>
								<InlineCalendar
									{theme}
									on:select={handleEndTimeSelect}
									start={$form.endingTime ? new Date($form.endingTime) : new Date()}
									selected={$form.endingTime ? new Date($form.endingTime) : undefined}
									timepicker
								/>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="line" />

			<div class="more-options">
				<Expandable titleColor="var(--text-header)">
					<div slot="title" class="expandable-title">
						<PopInfo message="Tooltip text">More options</PopInfo>
					</div>
					<div class="buyer-toggle">
						<Toggle bind:checked={reservePrice} /> Include reserve price
					</div>
					{#if reservePrice}
						<div class="price-input">
							<label for="price">
								<PopInfo message="Tooltip text">Reserve price</PopInfo>
							</label>
							<CurrencyInput
								bind:inputValue={$form.reservePrice}
								on:change={handleChange}
								on:switchCurrency={setCurrency}
								step={0.001}
							/>
							<span class="conversion">{priceConvertedReserve}</span>
						</div>
					{/if}
				</Expandable>
			</div>

			<div class="line" />

			<h4>
				<PopInfo message="Tooltip text">Revenue payout receiver<small>*</small></PopInfo>
			</h4>
			<!-- TODO: make clickable and editable, and removable -->
			{#if $form.payoutReceivers.length > 0}
				<div class="receivers" bind:clientWidth={recieversWidth}>
					{#each $form.payoutReceivers as receiver}
						{#if receiver.address === receiver.label}
							<span>
								{#if isAddress(receiver.address)}
									<EnsOrAddress address={receiver.address} />
								{:else}
									<span>
										{receiver.label}
									</span>
								{/if}
								{receiver.percent}%
							</span>
						{:else}
							<span>
								{receiver.label}
								{receiver.percent}%
							</span>
						{/if}
					{/each}
				</div>
			{/if}
			<Button
				size="md"
				buttonProps={{ type: 'button' }}
				type="tertiary"
				on:click={openPayoutRecieverModal}
			>
				Add receiver
			</Button>

			<div class="revenue-block">
				<h4>
					<PopInfo message="Tooltip text">Fees</PopInfo>
				</h4>
				<div class="revenue">
					<span>
						<PopInfo message="Tooltip text">
							<div class="left">Service fee:</div>
						</PopInfo>
						<div class="right">
							<HoverDropdown
								size="sm"
								options={services}
								bind:value={$form.service}
								style="width: auto;"
								initial="juicebox"
								on:select={handleSelect}
							/>
							<div>1%</div>
						</div>
					</span>
					<span>
						<PopInfo message="Tooltip text">
							<div class="left">Royalty rate:</div>
						</PopInfo>
						<div class="right">
							<div>10%</div>
						</div>
					</span>
				</div>
			</div>

			<div class="line" />

			<div class="footer">
				<Button size="md" buttonProps={{ type: 'button' }} type="secondary" on:click={close}>
					Cancel
				</Button>
				<Button size="md" type="secondary">Next</Button>
			</div>
		</Form>
	</div>
	<AdvancedCollectionPreview {collection} />
</main>

<Modal
	on:close={() => {
		formModal = undefined;
	}}
	show={formModal}
/>

<style lang="scss">
	main {
		display: flex;
		padding: 8px;
		gap: 24px;
		width: calc(100vw - 96px);

		.line {
			border-bottom: 1px solid var(--stroke-tertiary);
			margin-bottom: 16px;
		}

		.buyer-toggle {
			display: flex;
			font-weight: 300;
		}
		.form {
			display: flex;
			flex-direction: column;
			flex-basis: 50%;
			gap: 16px;
			h1 {
				color: var(--text-header);
				font-size: 28px;
				margin-bottom: 0px;
			}
			.expandable-title {
				color: var(--text-header);
				margin-bottom: 8px;
			}

			.price-input {
				display: flex;
				flex-direction: column;
				margin-bottom: 16px;

				label {
					color: var(--text-header);
					margin-bottom: 8px;
					display: flex;
				}
				.conversion {
					margin-left: auto;
					font-size: 11px;
					font-weight: 300;
					color: var(--text-secondary);
					margin-top: 4px;
				}
			}
			.more-options {
				margin-top: 16px;
			}

			.revenue-block {
				display: flex;
				flex-direction: column;
				color: var(--text-secondary);
				margin-bottom: 16px;
				margin-top: 16px;
				h4 {
					color: var(--text-header);
					margin-bottom: 8px;
				}

				.revenue {
					padding: 8px;
					padding-left: 0;
					display: flex;
					flex-direction: column;
					gap: 4px;

					span {
						display: flex;
						width: 100%;
						justify-content: space-between;
						gap: 10px;

						.right {
							display: flex;
							flex-wrap: wrap;
							gap: 4px;
							justify-content: flex-end;
						}
						.left {
							width: auto;
						}
					}
				}
			}

			.receivers {
				padding: 8px 16px;
				border: 0.4px solid var(--stroke-tertiary);
				display: flex;
				flex-direction: column;
				gap: 4px;
				margin-bottom: 16px;

				span {
					display: flex;
					width: 100%;
					justify-content: space-between;
					color: var(--text-secondary);
					gap: 10px;
				}
			}

			h4 {
				color: var(--text-header);
				margin-bottom: 16px;
				display: flex;
			}
			.footer {
				margin-top: 32px;
				display: flex;
				justify-content: flex-end;
				gap: 16px;
			}
		}
		.start-time {
			color: var(--text-header);
		}
		.time {
			margin-bottom: 16px;
			.combined {
				display: flex;
				align-items: center;
				margin-top: 8px;

				.icon {
					margin: 0 8px;
				}

				.input {
					flex-grow: 1;
					flex-basis: 50%;
					position: relative;

					span {
						display: flex;
						width: 100%;
						background: transparent;
						border: 1px solid var(--stroke-primary);
						transition: border-color 120ms ease-out;
						padding: 4px 11px;
						line-height: 1.5715;
						font-weight: 300;
						background: var(--background-l0);
						border-color: var(--stroke-primary);

						&:hover {
							border: var(--background-action-primary) 1px solid;
						}
					}

					.calendar-icon {
						position: absolute;
						right: 12px;
						top: 6px;
						color: var(--text-tertiary);
						font-size: 16px;
						cursor: pointer;
					}

					.placeholder {
						color: var(--text-tertiary);
					}
					.calendar {
						position: absolute;
						z-index: 1002;
						font-weight: 400;
					}
					.right {
						right: 0;
					}
				}
			}
		}
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		main {
			flex-direction: column;
		}
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 400px) {
		main {
			.form {
				.revenue-block {
					.revenue {
						span {
							.left {
								width: min-content;
							}
						}
					}
				}
			}
		}
	}
</style>
