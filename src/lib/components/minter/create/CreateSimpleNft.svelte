<script lang="ts">
	import { onMount } from 'svelte';
	import { format } from 'date-fns';
	import { ArrowRightIcon } from 'svelte-feather-icons';
	import { connectedAccount, readNetwork, web3Connect } from '$stores/web3';

	import PopInfo from '$lib/components/PopInfo.svelte';
	import Button from '$lib/components/Button.svelte';
	import clickOutsideDirective from '$utils/clickOutside';
	import InlineCalendar from '$lib/components/datepicker/components/InlineCalendar.svelte';
	import Modal, { bind, openModal, type ModalType } from '$lib/components/Modal.svelte';
	import FreshCollectionInfoModal from '$lib/components/FreshCollectionInfoModal.svelte';
	import { throwConfetti } from '$lib/utils/confetti';
	import { generateId } from '$lib/utils/generateId';
	import Icon from '$lib/components/Icon';
	import {
		type Royalty,
		initialSimpleCollectionConfig,
		type Collection,
		type SimpleCollection,
	} from '$models/minter/collection-config';
	import { simpleNftCreationOptions } from '$utils/introjs/options';
	import RoyaltySection from '$lib/components/sections/RoyaltySection.svelte';
	import { createCustomNotification } from '$utils/notification';
	import EditionPayoutReceiverSection from '$lib/components/sections/EditionPayoutReceiverSection.svelte';
	import { createSymbolForCollection } from '$utils/collectionHelpers';
	import CollectionSection from '$lib/components/sections/CollectionSection.svelte';
	import { NftStatus, type EditionConfig } from '$models/minter/nft-config';
	import { userdata } from '$utils/firebase';
	import { goto } from '$app/navigation';
	import SimpleNftPreview from '../preview/SimpleNftPreview.svelte';
	import FormInput from '../form/FormInput.svelte';
	import NftPreviewCards from '../card/NftPreviewCards.svelte';
	import CreateSimpleNftForm from './CreateSimpleNftForm.svelte';

	export let close: () => void;
	export let createNft: (nft: Collection) => void;
	export let getIntro: (introOptions: any, hintOptions: any) => void;

	let nft: SimpleCollection = { ...initialSimpleCollectionConfig };

	let nestedModal: ModalType;
	let formCompleted: boolean = false;
	let payoutError: string;

	const submit = async () => {
		if (!$connectedAccount) {
			await web3Connect();
		}

		// TODO: Save state in the browser if for some reason the modal is closed
		if (formCompleted && !payoutError) {
			localStorage.removeItem('NFT_FORM_CACHE');
			nft.creator = $connectedAccount;
			nft.network = $readNetwork.alias;
			nft.id = generateId();
			nft.mintStart = nft.mintStart ? nft.mintStart : new Date().getTime();
			nft.mintEnd = nft.mintEnd ? nft.mintEnd : new Date('01 01 2100').getTime();
			nft.symbol = nft.symbol || createSymbolForCollection(nft);
			nft.totalSupply = nft.editions.reduce((acc, curr) => acc + curr.totalSupply, 0);
			try {
				createNft(nft);
				close();
				throwConfetti().catch((err) => console.log(err));

				if ($userdata) {
					$userdata.collectionAutoNavigate
						? goto(`/collection/${nft.id}`)
						: openModal(bind(FreshCollectionInfoModal, { collectionId: nft.id, close: () => {} }));
				}
			} catch (e) {
				createCustomNotification({
					message: "Oh no! We couldn't create your NFT. Please try again later.",
					type: 'error',
				});
			}
		}
	};

	const theme = {
		calendar: {
			width: '280px',
			shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
		},
	};
	const formatDate = (date: number | Date) => format(date, 'yyyy-MM-dd h:mma');
	let showStartCalendar = false;
	const handleStartDateSelect = ({ detail }) => {
		nft.mintStart = detail.day.getTime();
		showStartCalendar = false;
	};
	let showEndCalendar = false;
	const handleEndDateSelect = ({ detail }) => {
		nft.mintEnd = detail.day.getTime();
		showEndCalendar = false;
	};

	onMount(() => {
		const cached = localStorage.getItem('NFT_FORM_CACHE');
		if (cached) {
			nft = JSON.parse(cached);
			nft.payoutAddress = nft.payoutAddress === 'create' ? '' : nft.payoutAddress;
		}
		getIntro(simpleNftCreationOptions, null);
	});

	const updateNft = (edition: EditionConfig) => {
		nft.editions = nft.editions.map((_edition: EditionConfig) => {
			if (_edition._id === edition._id) {
				return edition;
			}
			return _edition;
		});
	};

	const updateOrder = (nfts: EditionConfig[]) => {
		nft.editions = nfts;
	};

	const deleteNft = (index: number) => {
		nft.editions = nft.editions.filter((_, i) => i !== index);
	};

	const updateRoyalty = (royalty: Royalty) => {
		nft.royalty = royalty;
	};
	const deleteRoyalty = () => {
		nft.royalty = null;
	};

	$: formCompleted = nft.name && !!nft.editions.length;
</script>

<main>
	<section class="form">
		<h2>Edition Details</h2>
		<span id="edition-name">
			<FormInput
				id="name"
				label="Name"
				info="This will be displayed in marketplaces and wallets as your NFT collection's name."
				placeholder="Edition name"
				description="Marketplaces and wallets use the NFT contract name to identify your collection."
				required
				bind:value={nft.name}
			/>
		</span>
		<span id="edition-symbol">
			<FormInput
				id="symbol"
				label="Symbol"
				info="Symbols are generally a 3-6 character long acronym or abbreviation of your collection's name."
				placeholder="$NFT"
				description="3-6 character acronym or abbreviation. If left blank, one will be created for you."
				bind:value={nft.symbol}
			/>
		</span>
		<div class="time" id="edition-duration">
			<label for="start-time">
				<PopInfo message="Minting will be possible between the start and end time defined here.">
					Start and end time
				</PopInfo>
			</label>
			<div class="combined">
				<div class="input">
					<span
						class:placeholder={!nft.mintStart}
						on:click={() => (showStartCalendar = true)}
						on:keydown
					>
						{nft.mintStart ? formatDate(nft.mintStart) : 'Now'}
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
								timepicker
								selected={nft.mintStart ? new Date(nft.mintStart) : new Date()}
							/>
						</div>
					{/if}
				</div>
				<div class="icon">
					<ArrowRightIcon size="1x" />
				</div>
				<div class="input">
					<span
						class:placeholder={!nft.mintEnd}
						on:click={() => (showEndCalendar = true)}
						on:keydown
					>
						{nft.mintEnd ? formatDate(nft.mintEnd) : 'Forever'}
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
								start={nft.mintStart ? new Date(nft.mintStart) : new Date()}
								timepicker
								selected={nft.mintEnd ? new Date(nft.mintEnd) : new Date()}
							/>
						</div>
					{/if}
				</div>
			</div>
		</div>
		<CollectionSection title="Editions">
			{#if nft.editions.length}
				<NftPreviewCards
					savedNfts={nft.editions.filter((edition) => edition._status === NftStatus.SAVED)}
					colors={[]}
					{deleteNft}
					{updateOrder}
					{updateNft}
				/>
			{/if}
			<CreateSimpleNftForm bind:editions={nft.editions} />
		</CollectionSection>

		<span id="edition-royalties">
			<RoyaltySection
				royalty={nft.royalty}
				{updateRoyalty}
				{deleteRoyalty}
				updateNestedModal={(nm) => {
					nestedModal = nm;
				}}
				unsaved
			/>
		</span>
		<span id="edition-payouts">
			<EditionPayoutReceiverSection
				bind:payoutAddress={nft.payoutAddress}
				unsaved
				bind:error={payoutError}
			/>
		</span>

		<Button size="md" on:click={submit} type={'primary'} disabled={!formCompleted || !!payoutError}>
			{$connectedAccount ? 'Create Edition' : 'Connect wallet'}
		</Button>
		<small class="fee">2.5% of all primary sales go to Movement.</small>
	</section>
	<SimpleNftPreview {nft} />
</main>

<Modal
	on:close={() => {
		nestedModal = undefined;
	}}
	show={nestedModal}
/>

<style lang="scss">
	main {
		display: flex;
		padding: 8px;
		gap: 20px;
		width: calc(100vw - 96px);
		margin: 0 auto;

		.form {
			display: flex;
			flex-direction: column;
			flex-basis: 50%;

			h2 {
				color: var(--text-header);
				font-size: 21px;
				margin-bottom: 16px;
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
							border: 1px solid var(--stroke-secondary);
							transition: border-color 120ms ease-out;
							padding: 4px 11px;
							line-height: 1.5715;
							font-weight: 300;
							background: var(--background-l0);

							&:hover {
								border: var(--stroke-primary) 1px solid;
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
			label {
				color: var(--text-header);
				margin-bottom: 8px;
			}

			.fee {
				margin-top: 16px;
				color: var(--text-tertiary);
				font-size: 12px;
				text-align: center;
			}
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		main {
			flex-direction: column;
			width: 100%;
		}
	}
</style>
