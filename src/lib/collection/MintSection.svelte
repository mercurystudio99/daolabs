<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Ethereum from '$lib/components/Ethereum.svelte';
	import { formatDate } from '$utils/formatDate';
	import { formattedNum } from '$utils/formatNumber';
	import { connectedAccount, web3Connect } from '$stores/web3';
	import { processNotifications } from '$utils/notification';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import { userdata } from '$utils/firebase';
	import DropzoneModal from '$lib/components/DropzoneModal.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import {
		isPfpCollection,
		isImageCollection,
		isMusicCollection,
		isVideoCollection,
		getCollectionPrice,
		getCollectionCurrency,
		isSimpleCollection,
		isAdvancedCollection,
	} from '$utils/collectionHelpers';
	import Icon from '$lib/components/Icon';
	import Img from '$lib/components/Img.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import { ipfsCidUrl, replaceIpfsDomain } from '$utils/ipfs';
	import { mintDateCheck } from '$utils/mint';
	import { createExampleLayering, type PfpPropertyLayer } from '$lib/utils/nftCreationUtils';
	import { throwConfetti } from '$lib/utils/confetti';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	import type { Collection } from '$models/minter/collection-config';
	import type { NftContract } from '$models/subgraph-entities/v2/nft-contract';
	import type { UpdateNotification } from '@web3-onboard/core';
	import type { ContractTransaction } from 'ethers';

	export let collection: Collection;
	export let collectionSupply: number;
	export let isConnectedUserOwner: boolean;
	export let isDeployed: boolean;
	export let collectionStats: NftContract = undefined;
	export let saveCollection: (collection: Collection) => Promise<void>;
	export let mintFunc: (arg: any) => Promise<ContractTransaction>;
	export let mintCallback: () => Promise<void> = () => Promise.resolve();
	export let nftFilter: number;

	let totalEarned = 0;

	let mintAmount = 1;
	let randomPfpLayers: PfpPropertyLayer[] = [];
	let showDefaultImageUpload = false;
	let price: string | number = 0;
	let timer: NodeJS.Timeout;

	let placeholderImage: string;

	const openDefaultImageDropzone = () => {
		openModal(
			bind(DropzoneModal, {
				title: "Edit collection's default picture",
				accept: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
				saveChanges: (file: DropzoneOutput) => {
					if (!file) {
						collection.defaultImage = '';
					} else {
						collection.defaultImage = ipfsCidUrl(file.pinInfo.IpfsHash);
					}
					if ($userdata) {
						saveCollection(collection).catch((e) => console.log(e));
					}
				},
				close: () => {},
			}),
		);
	};

	const discardDefaultImage = () => {
		collection.defaultImage = '';
		saveCollection(collection).catch((e) => console.log(e));
	};

	const handlePfpRandomSelect = () => {
		if (isAdvancedCollection(collection) && collection.nfts && isPfpCollection(collection)) {
			const layers = createExampleLayering(collection.nfts[nftFilter]);
			randomPfpLayers = layers.reduce((acc, layer) => {
				acc[layer.layer] = layer;
				return acc;
			}, [] as PfpPropertyLayer[]);

			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => {
				randomPfpLayers = [];
			}, 2800);
		}
	};

	const rotateThroughEditionImages = (nextIndex: number) => {
		if (isSimpleCollection(collection)) {
			const editionImages = collection.editions.map((edition) => edition.file);
			if (nextIndex >= editionImages.length) {
				nextIndex = 0;
				placeholderImage = editionImages[0];
			} else {
				placeholderImage = editionImages[nextIndex];
			}

			setTimeout(() => {
				rotateThroughEditionImages(nextIndex + 1);
			}, 5000);
		}
	};

	const getPlaceholderImage = (_collection: Collection) => {
		if (_collection.defaultImage) {
			return _collection.defaultImage;
		}
		if (isSimpleCollection(_collection)) {
			rotateThroughEditionImages(0);
			return _collection.editions[0].file;
		} else if (isAdvancedCollection(_collection) && _collection.nfts?.length) {
			// TODO handle p5js
			if (isImageCollection(_collection)) {
				return _collection.nfts?.[0]?.file;
			}
			if (isMusicCollection(_collection)) {
				return _collection.nfts?.[0]?.albums[0]?.cover;
			}
			if (isVideoCollection(_collection)) {
				return _collection.nfts[0]?.cover;
			}
			if (isPfpCollection(_collection)) {
				handlePfpRandomSelect();
			}
		}
		return '';
	};

	const mint = async () => {
		if (!$connectedAccount) {
			await web3Connect();
		}
		const processFunc = async (update: UpdateNotification) => {
			const tx = await mintFunc({ price, mintAmount });
			update({
				message: 'Minting...',
				type: 'pending',
			});
			await tx.wait();
			await throwConfetti();
		};

		await processNotifications(processFunc, {
			pending: 'Sign transaction to mint NFT',
			success: 'Minted NFT',
			error: 'Transaction failed',
		});

		await mintCallback();
	};

	// const changeMintAmount = (value: number) => {
	// 	const nextValue = mintAmount + value;
	// 	if (nextValue > 0 && nextValue <= remainingSupply:) {
	// 		mintAmount = nextValue;
	// 	}
	// };

	$: placeholderImage = getPlaceholderImage(collection);
	$: price = getCollectionPrice(collection);
	$: totalEarned = collectionStats?.totalSupply * Number(price);
	$: remainingSupply = collectionSupply
		? collectionSupply - (collectionStats?.totalSupply || 0)
		: 'Unlimited';
	$: shouldCountdownShow =
		isDeployed &&
		collection.reveal &&
		new Date(String(collection.reveal?.revealValue)) >= new Date();
	$: isAvailableToMint =
		mintDateCheck(collection.mintStart, collection.mintEnd) && remainingSupply > 0;
</script>

<section>
	<div class="mint-info">
		<h2>Mint</h2>
		<span>Total Supply: {collectionSupply || 'Unlimited'}</span>
		{#if isConnectedUserOwner}
			<span>Total Earned: {totalEarned ? formattedNum(totalEarned) : 0}</span>
		{/if}
		<span>
			Start date: {formatDate(
				collection.mintStart ? new Date(collection.mintStart).getTime() : new Date().getTime(),
			)}
		</span>
		<span>
			End date: {collection.mintEnd
				? formatDate(new Date(collection.mintEnd).getTime())
				: 'Forever'}
		</span>
	</div>
	<div class="mint-configuration-container">
		<div class="mint-configuration">
			<!-- NOTE: Temporarily remove multiple mint until contracts have support -->
			<!-- <div class="button" on:click={() => changeMintAmount(-1)} on:keydown>
				<Icon name="minusCircle" />
			</div> -->
			<div class="mint-image-container">
				<div class="placeholder" class:missing-placeholder={!placeholderImage}>
					<div
						class="default-image"
						on:mouseleave={() => {
							showDefaultImageUpload = false;
						}}
						on:touchend={() => {
							showDefaultImageUpload = false;
						}}
						on:mouseenter={() => {
							showDefaultImageUpload = true;
						}}
						on:touchstart={() => {
							showDefaultImageUpload = true;
						}}
						on:click={handlePfpRandomSelect}
						on:keydown
					>
						{#if Object.values(randomPfpLayers).length}
							{#await import('$lib/components/minter/preview/PFPLayering.svelte') then { default: PfpLayering }}
								<svelte:component
									this={PfpLayering}
									layers={Object.values(randomPfpLayers)}
									style={{
										height: '100%',
										width: '100%',
										position: 'absolute',
										top: 0,
									}}
								/>
							{/await}
						{/if}
						{#if placeholderImage}
							<Img
								src={replaceIpfsDomain(String(placeholderImage))}
								alt={'Placeholder image'}
								placeholder={`https://via.placeholder.com/${250}?text=...`}
								styles={{
									width: '100%',
									height: '100%',
									objectFit: 'contain',
								}}
							/>
						{/if}
						{#if showDefaultImageUpload && isConnectedUserOwner && !isDeployed}
							<div class="default-image-edit">
								<div class="icon" on:click={openDefaultImageDropzone} on:keydown>
									<Icon name="edit" viewBox="0 0 36 36" />
								</div>
							</div>
							{#if placeholderImage}
								<CloseButton
									size="0.5rem"
									position="8px"
									on:click|once={discardDefaultImage}
									color="--icon-action-primary"
								/>
							{/if}
						{/if}
					</div>
				</div>
				<div class="mint-amount">
					<p class="labels">
						<span>Amount</span>
						<span class="price">Mint Price</span>
					</p>
					<p class="amount">
						<span>{mintAmount}/{remainingSupply}</span>
						<span class="price">
							{#if typeof price === 'number'}
								{#if getCollectionCurrency(collection) === 'ETH'}
									<Ethereum />
								{:else}
									$
								{/if}
								{formattedNum(price * mintAmount)}
							{:else}
								<Ethereum />
								n/a
							{/if}
						</span>
					</p>
				</div>
			</div>
			<!-- <div class="button" on:click={() => changeMintAmount(1)} on:keydown>
				<Icon name="plusCircle" />
			</div> -->
		</div>
		<div class="mint-button">
			{#if shouldCountdownShow}
				<Countdown date={new Date(String(collection.reveal.revealValue)).getTime()} />
			{/if}
			<Button
				fullWidth
				on:click={mint}
				disabled={!isDeployed || shouldCountdownShow || !isAvailableToMint}
				type={$connectedAccount ? 'primary' : 'secondary'}
				buttonProps={{ id: 'mint' }}
			>
				{$connectedAccount ? 'Mint' : 'Connect Wallet'}
			</Button>
		</div>
	</div>
</section>

<style lang="scss">
	.default-image {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.default-image-edit {
		display: flex;
		cursor: pointer;
		font-size: 16px;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
	}

	section {
		margin-bottom: 16px;
	}
	.mint-info {
		display: flex;
		flex-direction: column;
		margin-bottom: 16px;
		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
		}
		span {
			color: var(--text-secondary);
		}
	}
	.mint-configuration-container {
		width: 100%;
		display: flex;
		justify-content: center;
		border: 0.4px solid var(--stroke-tertiary);
		padding: 16px;
		flex-direction: column;
		.mint-configuration {
			display: flex;
			align-items: center;
			gap: 16px;
			justify-content: center;
			font-size: 21px;

			/* .button {
				cursor: pointer;
			} */
			.mint-image-container {
				display: flex;
				flex-direction: column;
				border: 0.4px solid var(--stroke-tertiary);
				width: 50vw;
				max-width: 300px;
				.placeholder {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 100%;
					height: 300px;
				}

				.missing-placeholder {
					height: 300px;
					background: var(--background-l2);
					.icon {
						display: flex;
						align-items: center;
						justify-content: center;
						height: 100%;
						color: var(--text-tertiary);
					}
				}
				.mint-amount {
					padding: 7px 13px;
					display: flex;
					justify-content: space-between;
					gap: 10px;
					font-size: 14px;

					.labels {
						span {
							text-align: start;
						}
					}
					.amount {
						span {
							text-align: end;
						}
					}
					p {
						display: flex;
						flex-direction: column;
						gap: 4px;
						color: var(--text-secondary);
					}
					.price {
						color: #7fcec9;
					}
				}
			}
		}
	}
	.mint-button {
		align-self: center;
		margin-top: 16px;
		width: 50vw;
		max-width: 300px;
	}
</style>
