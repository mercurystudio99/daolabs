<script lang="ts">
	import { onMount } from 'svelte';
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
	import { getCollectionPrice, getCollectionCurrency } from '$utils/collectionHelpers';
	import Icon from '$lib/components/Icon';
	import Img from '$lib/components/Img.svelte';
	import { ipfsCidUrl, replaceIpfsDomain } from '$utils/ipfs';
	import { throwConfetti } from '$lib/utils/confetti';
	import type { DropzoneOutput } from '$models/minter/dropzone';
	import type { SimpleCollection } from '$models/minter/collection-config';
	import type { NftContract } from '$models/subgraph-entities/v2/nft-contract';
	import type { UpdateNotification } from '@web3-onboard/core';
	import type { ContractTransaction } from 'ethers';
	import type { EditionConfig } from '$models/minter/nft-config';

	export let collection: SimpleCollection;
	export let collectionSupply: number;
	export let isConnectedUserOwner: boolean;
	export let isDeployed: boolean;
	export let collectionStats: NftContract = undefined;
	export let saveCollection: (collection: SimpleCollection) => Promise<void>;
	export let mintFunc: (arg: any) => Promise<ContractTransaction>;
	export let mintCallback: () => Promise<void> = () => Promise.resolve();

	let totalEarned = 0;

	let mintAmount = 1;
	let showDefaultImageUpload = false;
	let price: string | number = 0;

	let placeholderImage: string;
	let currentEdition: EditionConfig;
	let timer: ReturnType<typeof setTimeout>;

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

	const rotateThroughEditionImages = (nextIndex: number) => {
		const editionImages = collection.editions.map((edition) => edition.file);
		if (nextIndex >= editionImages.length) {
			nextIndex = 0;
			placeholderImage = editionImages[0];
		} else {
			placeholderImage = editionImages[nextIndex];
		}

		clearTimeout(timer);
		timer = setTimeout(() => {
			rotateThroughEditionImages(nextIndex + 1);
		}, 5000);
	};

	const setPlaceholderImage = (_collection: SimpleCollection) => {
		if (_collection.defaultImage) {
			placeholderImage = _collection.defaultImage;
		} else {
			rotateThroughEditionImages(0);
		}
	};

	const mint = async () => {
		if (!$connectedAccount) {
			await web3Connect();
		}
		const processFunc = async (update: UpdateNotification) => {
			const editionIndex = collection.editions.findIndex(
				(edition) => edition._id === currentEdition?._id,
			);
			const tx = await mintFunc({ editionIndex, price, mintAmount });
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

	// onMount(() => {
	// 	return () => {
	// 		clearTimeout(timer);;w

	// 	};
	// });

	onMount(() => {
		setPlaceholderImage(collection);
		return () => {
			clearTimeout(timer);
		};
	});

	function setCurrentEdition(edition: EditionConfig) {
		if (currentEdition?._id === edition._id) {
			currentEdition = undefined;
			return;
		}
		currentEdition = edition;
	}

	$: price = currentEdition?.price ? Number(currentEdition?.price) : getCollectionPrice(collection);
	$: totalEarned = collectionStats?.totalSupply * Number(price);
	// TODO: we need remainingSupply for each edition! Need to check what the graph returns.
	$: remainingSupply = collectionSupply
		? collectionSupply - (collectionStats?.totalSupply || 0)
		: 'Unlimited';
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
			<div class="mint-image-list">
				{#each collection.editions as edition}
					<div
						class="mint-image"
						class:inactive={edition._id !== currentEdition?._id}
						on:click={() => setCurrentEdition(edition)}
						on:keyup
					>
						<Img
							src={replaceIpfsDomain(String(edition.file))}
							alt={'Edition image'}
							placeholder={`https://via.placeholder.com/${250}?text=...`}
							styles={{
								width: '100%',
								height: '100%',
								objectFit: 'contain',
							}}
						/>
					</div>
				{/each}
			</div>
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
					>
						{#if placeholderImage}
							<Img
								src={replaceIpfsDomain(String(currentEdition?.file ?? placeholderImage))}
								alt={'Placeholder image'}
								placeholder={`https://via.placeholder.com/${250}?text=...`}
								styles={{
									width: '100%',
									height: '100%',
									objectFit: 'contain',
								}}
							/>
						{/if}
						{#if showDefaultImageUpload && isConnectedUserOwner}
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
						<span>{mintAmount}/{currentEdition?.totalSupply ?? remainingSupply}</span>
						<span class="price">
							{#if typeof price === 'number'}
								{#if getCollectionCurrency(collection) === 'ETH'}
									<Ethereum />
								{:else}
									$
								{/if}
								{#if price === 0}
									Free
								{:else}
									{formattedNum(price * mintAmount)}
								{/if}
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
			<Button
				fullWidth
				on:click={mint}
				disabled={!isDeployed}
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

	.mint-image-list {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		justify-content: center;
		margin-bottom: 16px;
	}

	.mint-image {
		cursor: pointer;
		&.inactive {
			opacity: 0.4;
		}
	}

	.mint-image:hover {
		opacity: 0.9;
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
			flex-wrap: wrap;

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
